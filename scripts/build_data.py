#!/usr/bin/env python3
"""Soru verisini oyuna hazırlar.

Kullanım:
  python3 scripts/build_data.py [kaynak_klasör ...]

- Kaynak klasör(ler)deki *.json dosyalarını (zenginleştirilmiş soru dizileri) okur,
  id'ye göre birleştirir ve data/questions.json'a yazar.
- Kaynak verilmezse yalnızca mevcut data/questions.json'dan js/data/questions.js üretir.
- js/data/questions.js, tarayıcının dosya sisteminden de (file://) açılabilmesi için
  JSON'u bir <script> değişkeni olarak gömer.
"""
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / 'data' / 'questions.json'
OUT = ROOT / 'js' / 'data' / 'questions.js'

KEEP = ['id', 'year', 'section', 'num', 'topic', 'subtopic', 'kind', 'docType', 'title', 'client', 'intro', 'line',
        'context', 'items', 'table', 'ask', 'optionHeaders', 'options', 'answer', 'explanation', 'law', 'hint',
        'difficulty', 'figure', 'outdated', 'keyNote']
TOPICS = {'patent', 'patent_intl', 'tasarim', 'marka', 'marka_intl', 'cografi', 'vekillik', 'genel_hukuk'}


def sort_key(q):
    order = {'main': 0, 'patent': 0, 'marka': 1, 'ortak': 2}
    return (q['year'], order.get(q.get('section', 'main'), 0), q['num'])


def clean(q):
    out = {k: q[k] for k in KEEP if k in q and q[k] not in (None, '', [], {})}
    if 'section' not in out:
        out['section'] = 'main'
    return out


def main():
    sources = [pathlib.Path(p) for p in sys.argv[1:]]
    if sources:
        merged = {}
        for src in sources:
            for f in sorted(src.glob('*.json')):
                for q in json.loads(f.read_text(encoding='utf-8')):
                    merged[q['id']] = clean(q)
        qs = sorted(merged.values(), key=sort_key)
        DATA.parent.mkdir(parents=True, exist_ok=True)
        DATA.write_text(json.dumps(qs, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    qs = json.loads(DATA.read_text(encoding='utf-8'))
    problems = []
    for q in qs:
        if q['topic'] not in TOPICS:
            problems.append(f"{q['id']}: konu {q['topic']}")
        if q['answer'] not in q['options']:
            problems.append(f"{q['id']}: cevap seçeneklerde yok")
        fig = q.get('figure')
        if fig and not (ROOT / fig).exists():
            problems.append(f"{q['id']}: görsel yok {fig}")
    if problems:
        print('\n'.join(problems))
        sys.exit(1)
    body = json.dumps(qs, ensure_ascii=False, separators=(',', ':'))
    OUT.write_text('/* Otomatik üretildi: scripts/build_data.py — elle düzenleme. */\n'
                   'window.VK = window.VK || {};\nVK.QUESTIONS = ' + body + ';\n', encoding='utf-8')
    by_year = {}
    for q in qs:
        by_year[q['year']] = by_year.get(q['year'], 0) + 1
    print(f'{len(qs)} soru → {OUT.relative_to(ROOT)}  ', by_year)


if __name__ == '__main__':
    main()
