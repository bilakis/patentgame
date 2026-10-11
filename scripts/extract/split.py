import re, json
NOISE = [r'^PATENT VE MARKA VEKİLLİĞİ GENEL YETERLİK SINAVI.*$', r'^.*SORU KİTAPÇIĞI \(A\)\s*$', r'^Diğer sayfaya geçiniz\.?\s*$',
         r'^\d{1,2}\s*$', r'^Patent Vekilliği ve Marka Vekilliği Genel Yeterlik Sınavı.*$', r'^A\s*$', r'^(PATENT|MARKA) VEKİLLİĞİ SINAVI.*$',
         r'^TEST.*BİTTİ.*$', r'^TESTİNİZ BİTTİ.*$', r'^Test Bitti\s*$', r'^\[split.*$', r'^--- (LEFT|RIGHT)$']
NOISE = [re.compile(x) for x in NOISE]
def pages(y):
    s = open(f'cols/{y}.txt').read()
    out = []
    for chunk in s.split('##### PAGE ')[1:]:
        num, _, body = chunk.partition('\n')
        lines = []
        for ln in body.splitlines():
            if any(n.match(ln.strip()) for n in NOISE): continue
            lines.append(ln)
        out.append((int(num.strip()), lines))
    return out
def split(y, ranges):
    """ranges: list of (section, first_page, last_page, first_q, last_q)"""
    P = dict(pages(y))
    res = []
    for sec, p0, p1, q0, q1 in ranges:
        seq = []
        for p in range(p0, p1+1):
            for ln in P.get(p, []):
                seq.append((p, ln))
        expected = q0
        cur = None
        for p, ln in seq:
            m = re.match(r'^\s*(\d{1,3})\s*[.\-]\s*(.*)$', ln)
            if m and int(m.group(1)) == expected and expected <= q1 and (cur is None or re.search(r'(^|\s)E\)', cur['raw'])):
                cur = {'year': y, 'section': sec, 'num': expected, 'pages': [p], 'raw': m.group(2)}
                res.append(cur); expected += 1
                continue
            if cur is not None:
                if p not in cur['pages']: cur['pages'].append(p)
                cur['raw'] += '\n' + ln
        if expected != q1 + 1:
            print('WARN', y, sec, 'stopped at', expected)
    return res
ALL = []
ALL += split('2015', [('patent', 1, 6, 1, 25), ('marka', 7, 13, 1, 25), ('ortak', 14, 19, 1, 25)])
ALL += split('2017', [('main', 5, 17, 1, 60), ('main', 25, 37, 61, 100)])
ALL += split('2019', [('main', 5, 23, 1, 60), ('main', 27, 44, 61, 100)])
ALL += split('2021', [('main', 5, 23, 1, 60), ('main', 28, 48, 61, 100)])
ALL += split('2024', [('patent', 5, 26, 1, 60), ('marka', 33, 56, 1, 60)])
keys = json.load(open('keys.json'))
for q in ALL:
    q['answer'] = keys[q['year']][q['section']][str(q['num'])]
    q['id'] = f"{q['year']}-{q['section'][0]}{q['num']:03d}" if q['section'] != 'main' else f"{q['year']}-{q['num']:03d}"
print(len(ALL))
json.dump(ALL, open('raw_questions.json', 'w'), ensure_ascii=False, indent=1)
