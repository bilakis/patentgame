#!/usr/bin/env python3
"""Oyunu tek bir HTML dosyasına paketler (çevrimdışı oynamak ya da paylaşmak için).

Kullanım:
  python3 scripts/build_single.py                 # dist/vekil-masasi.html (tam belge)
  python3 scripts/build_single.py --fragment OUT  # <html>/<head>/<body> etiketleri olmadan parça

CSS ve JS satır içine alınır; assets/fig altındaki görseller data: URI olarak gömülür.
Yazı tipleri Google Fonts'tan yüklenir; bağlantı yoksa sistem yazı tiplerine düşer.
"""
import base64
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent


def js_safe(src):
    return src.replace('</script', '<\\/script')


def main():
    fragment = '--fragment' in sys.argv
    args = [a for a in sys.argv[1:] if a != '--fragment']
    out = pathlib.Path(args[0]) if args else ROOT / 'dist' / 'vekil-masasi.html'
    html = (ROOT / 'index.html').read_text(encoding='utf-8')

    css = (ROOT / 'css' / 'style.css').read_text(encoding='utf-8')
    html = html.replace('<link rel="stylesheet" href="css/style.css">', '<style>\n' + css + '\n</style>')

    figs = {}
    for f in sorted((ROOT / 'assets' / 'fig').glob('*.png')):
        figs['assets/fig/' + f.name] = 'data:image/png;base64,' + base64.b64encode(f.read_bytes()).decode()
    fig_js = 'window.VK = window.VK || {};\nVK.FIGURES = ' + json.dumps(figs) + ';\n'

    def inline(m):
        path = m.group(1)
        src = (ROOT / path).read_text(encoding='utf-8')
        extra = fig_js if path.endswith('util.js') else ''
        return '<script>\n' + js_safe(src + '\n' + extra) + '\n</script>'

    html = re.sub(r'<script src="([^"]+)"></script>', inline, html)

    if fragment:
        head = re.search(r'<head>(.*?)</head>', html, re.S).group(1)
        body = re.search(r'<body>(.*?)</body>', html, re.S).group(1)
        head = re.sub(r'<meta charset[^>]*>\s*|<meta name="viewport"[^>]*>\s*', '', head)
        title = re.search(r'<title>.*?</title>', head).group(0)
        head = head.replace(title, '')
        html = title + '\n' + head.strip() + '\n' + body.strip() + '\n'

    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(html, encoding='utf-8')
    print(f'{out}  ({out.stat().st_size / 1024 / 1024:.2f} MB, {len(figs)} görsel)')


if __name__ == '__main__':
    main()
