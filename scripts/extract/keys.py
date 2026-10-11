import re, json
T = 'txt/'
keys = {}
def tail(y, marker):
    s = open(T+y+'.txt').read()
    i = s.rfind(marker)
    return s[i:]
# 2015: rows "n X n X n X"
t = tail('2015', 'CEVAP ANAHTARI')
p, m, o = {}, {}, {}
for line in t.splitlines():
    r = re.findall(r'(\d+)\s+([A-E])\b', line)
    if len(r) == 3:
        p[int(r[0][0])] = r[0][1]; m[int(r[1][0])] = r[1][1]; o[int(r[2][0])] = r[2][1]
keys['2015'] = {'patent': p, 'marka': m, 'ortak': o}
for y, pat, marker in [('2017', r'(\d+)-\s+([A-E])\b', 'CEVAPLARI (A)'), ('2019', r'(\d+)\s+([A-E])\b', 'CEVAPLARI (A)'), ('2021', r'(\d+)\.\s+([A-E])\b', 'CEVAP ANAHTARI (A)')]:
    t = tail(y, marker)
    d = {}
    for n, a in re.findall(pat, t):
        d[int(n)] = a
    keys[y] = {'main': d}
t = tail('2024', 'CEVAP ANAHTARI (A)')
p, m = {}, {}
for line in t.splitlines():
    r = re.findall(r'(\d+)\.\s+([A-E])\b', line)
    if len(r) == 4:
        p[int(r[0][0])] = r[0][1]; p[int(r[1][0])] = r[1][1]; m[int(r[2][0])] = r[2][1]; m[int(r[3][0])] = r[3][1]
keys['2024'] = {'patent': p, 'marka': m}
for y, v in keys.items():
    for k, d in v.items():
        n = max(d) if d else 0
        missing = [i for i in range(1, n+1) if i not in d]
        print(y, k, len(d), 'max', n, 'missing', missing)
json.dump(keys, open('keys.json', 'w'), indent=1)
