"""Explicit manifest packaging: never glob runtime databases, secrets or environments."""
import json
from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parent.parent

def manifest():
    guides = json.loads((ROOT/'backend/guided_lessons.json').read_text(encoding='utf-8'))
    return ['README.md'] + [f'{id}/{name}' for id,g in guides.items() if not g.get('framework') for name in [*g['files'], 'README.md']]

def package_guides():
    source = ROOT/'examples/guided_lessons'
    target = ROOT/'public/downloads/guided-lessons.zip'
    target.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(target, 'w', compression=zipfile.ZIP_DEFLATED) as archive:
        for relative in manifest():
            path = (source/relative).resolve()
            if not path.is_relative_to(source.resolve()): raise ValueError('Invalid tutorial manifest path')
            entry = zipfile.ZipInfo('guided-lessons/' + relative, date_time=(2026,10,29,0,0,0))
            entry.compress_type = zipfile.ZIP_DEFLATED
            archive.writestr(entry, path.read_bytes())
    print(f'Packaged {len(manifest())} explicit tutorial files.')
    return target

if __name__ == '__main__': package_guides()
