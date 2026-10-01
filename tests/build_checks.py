"""Exercise root/project URLs and reject accidental publication of extra files."""
from pathlib import Path
import json, shutil, subprocess, sys, tempfile
ROOT=Path(__file__).resolve().parents[1]
(ROOT/'qa').mkdir(exist_ok=True)
with tempfile.TemporaryDirectory(prefix='build-check-',dir=ROOT/'qa') as temp:
 target=Path(temp)
 for name in ['build.py','site.json']:shutil.copyfile(ROOT/name,target/name)
 for name in ['src','assets']:shutil.copytree(ROOT/name,target/name)
 for url in ['https://weiyuzhou-code.github.io/','https://weiyuzhou-code.github.io/portfolio/']:
  subprocess.run([sys.executable,str(target/'build.py'),'--site-url',url],check=True,capture_output=True)
  s=(target/'dist/index.html').read_text(encoding='utf-8')
  assert f'<link rel="canonical" href="{url}">' in s
  assert f'content="{url}assets/share-card.png"' in s
  assert 'href="assets/Weiyu_Zhou_CV_EN.pdf"' in s
  assert 'data:application/pdf' not in s
 for invalid in ['http://localhost:8000/','https://github.com/weiyuzhou-code/portfolio','https://user:pass@weiyuzhou-code.github.io/']:
  result=subprocess.run([sys.executable,str(target/'build.py'),'--site-url',invalid],capture_output=True)
  assert result.returncode!=0
 (target/'dist/internal-notes.txt').write_text('Synthetic private-file boundary check')
 result=subprocess.run([sys.executable,str(target/'build.py')],capture_output=True)
 assert result.returncode!=0 and b'Unexpected files in dist' in result.stderr
print('PASS: production metadata, project subpath, invalid URL rejection and private-file guard')
