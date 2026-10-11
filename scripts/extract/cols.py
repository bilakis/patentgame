import sys, pdfplumber, re
path, out = sys.argv[1], sys.argv[2]
res = []
with pdfplumber.open(path) as pdf:
    for i, page in enumerate(pdf.pages):
        w, h = page.width, page.height
        # detect split: find gap in word x positions near middle
        words = page.extract_words()
        mid = w/2
        res.append(f"\n##### PAGE {i+1}\n")
        if not words:
            continue
        # try to find best split x between 0.4w and 0.6w with fewest words crossing
        best = mid; bestc = 10**9
        for x in [w*0.40 + k*(w*0.2/40) for k in range(41)]:
            c = sum(1 for wd in words if wd['x0'] < x < wd['x1'])
            if c < bestc or (c == bestc and abs(x-mid) < abs(best-mid)):
                bestc, best = c, x
        left = page.crop((0, 0, best, h)).extract_text(layout=False) or ''
        right = page.crop((best, 0, w, h)).extract_text(layout=False) or ''
        res.append(f"[split={best:.0f} crossing={bestc}]\n--- LEFT\n{left}\n--- RIGHT\n{right}\n")
open(out, 'w').write(''.join(res))
