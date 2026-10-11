#!/usr/bin/env python3
"""Soru verisini doğrular.

Kullanım:
  python3 scripts/validate_questions.py                 # data/questions.json
  python3 scripts/validate_questions.py a.json b.json   # zenginleştirilmiş parça dosyaları

Şema alanlarını, konu/tür değerlerini, seçenek yapısını, görsel dosyalarını ve her sorunun
cevabının data/answer_keys.json içindeki RESMÎ cevap anahtarıyla aynı olduğunu kontrol eder.
"""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
TOPICS = {'patent', 'patent_intl', 'tasarim', 'marka', 'marka_intl', 'cografi', 'vekillik', 'genel_hukuk'}
KINDS = {'sure', 'vaka', 'bilgi', 'hata', 'kombinasyon'}
DOCS = {'Müvekkil Talebi', 'Müvekkil Sorusu', 'Kurum Yazısı', 'Süre Takip Kartı', 'Stajyer Notu',
        'Meslektaş Danışması', 'Dava Dosyası', 'İç Eğitim Notu'}
REQ = ['id', 'year', 'num', 'topic', 'subtopic', 'kind', 'docType', 'title', 'client', 'intro', 'line',
       'ask', 'options', 'answer', 'explanation', 'hint', 'difficulty']


def official(keys, q):
    y = str(q['year'])
    sec = q.get('section') or 'main'
    if y not in keys:
        return None
    table = keys[y].get(sec) or keys[y].get('main')
    return table.get(str(q['num'])) if table else None


def main():
    keys = json.loads((ROOT / 'data' / 'answer_keys.json').read_text(encoding='utf-8'))
    paths = [pathlib.Path(p) for p in sys.argv[1:]] or [ROOT / 'data' / 'questions.json']
    bad = 0
    seen = set()
    for path in paths:
        data = json.loads(path.read_text(encoding='utf-8'))
        for q in data:
            errs = [f'eksik alan: {k}' for k in REQ if k not in q]
            if errs:
                print(q.get('id'), errs)
                bad += 1
                continue
            if q['id'] in seen:
                errs.append('tekrarlanan id')
            seen.add(q['id'])
            off = official(keys, q)
            if off is None:
                errs.append('cevap anahtarında yok')
            elif off != q['answer']:
                errs.append(f"cevap {q['answer']} ≠ resmî {off}")
            if q['topic'] not in TOPICS:
                errs.append('konu ' + q['topic'])
            if q['kind'] not in KINDS:
                errs.append('tür ' + q['kind'])
            if q['docType'] not in DOCS:
                errs.append('belge türü ' + q['docType'])
            if set(q['options']) != set('ABCDE'):
                errs.append('seçenek anahtarları A–E olmalı')
            oh = q.get('optionHeaders')
            for k, v in q['options'].items():
                if oh:
                    if not (isinstance(v, list) and len(v) == len(oh)):
                        errs.append(f'{k} seçeneği {len(oh)} hücreli dizi olmalı')
                elif not (isinstance(v, str) and v.strip()):
                    errs.append(f'{k} seçeneği boş')
            if q['difficulty'] not in (1, 2, 3):
                errs.append('zorluk 1–3 olmalı')
            if not isinstance(q['client'], dict) or not q['client'].get('name'):
                errs.append('client.name')
            if 'items' in q and not all(isinstance(i, str) for i in q['items']):
                errs.append('items')
            if 'table' in q and not (isinstance(q['table'].get('headers'), list) and isinstance(q['table'].get('rows'), list)):
                errs.append('table')
            if q.get('figure') and not (ROOT / q['figure']).exists():
                errs.append('görsel dosyası yok')
            for k in ('context', 'ask', 'intro', 'explanation'):
                if isinstance(q.get(k), str) and re.search(r'\w-\n\w', q[k]):
                    errs.append('heceleme tiresi: ' + k)
            if errs:
                print(q['id'], errs)
                bad += 1
        print(f'{path}: {len(data)} soru')
    print('HATA' if bad else 'OK', bad)
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
