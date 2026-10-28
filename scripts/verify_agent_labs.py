"""Extract the actual downloadable ZIP, then run its tests in an isolated lab venv."""
import argparse
from pathlib import Path
import subprocess
import tempfile
import zipfile
from package_agent_labs import package, FILES, ROOT

parser = argparse.ArgumentParser(); parser.add_argument('--python', required=True)
args = parser.parse_args(); python = Path(args.python).resolve()
target = package()
(ROOT/'work').mkdir(exist_ok=True)
with tempfile.TemporaryDirectory(prefix='download-labs-',dir=ROOT/'work') as temporary:
    directory = Path(temporary)
    with zipfile.ZipFile(target) as archive:
        if archive.namelist() != ['agent-labs/'+filename for filename in FILES]:
            raise ValueError('ZIP inventory differs from the reviewed source list')
        archive.extractall(directory)
    result = subprocess.run([str(python),'-X','utf8','-m','unittest','-v','test_labs'],cwd=directory/'agent-labs',timeout=150)
    if result.returncode: raise SystemExit(result.returncode)
    print('PASS: downloaded ZIP extracted and all executable labs verified; no paid model calls.')
