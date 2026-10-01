"""Dependency-free publication boundary and content regression checks."""
from pathlib import Path
from html.parser import HTMLParser
import base64, hashlib, json, re

ROOT=Path(__file__).resolve().parents[1]
ASSETS=['portrait.png','Weiyu_Zhou_CV_ZH.pdf','Weiyu_Zhou_CV_EN.pdf','share-card.png']
expected={'index.html','.nojekyll',*('assets/'+p for p in ASSETS)}
actual={p.relative_to(ROOT/'dist').as_posix() for p in (ROOT/'dist').rglob('*') if p.is_file()}
assert actual==expected,(actual^expected)
assert not any(p.is_symlink() for p in (ROOT/'dist').rglob('*'))
online=(ROOT/'dist/index.html').read_text(encoding='utf-8')
offline=(ROOT/'index.html').read_text(encoding='utf-8')
assert 'data:application/pdf' not in online
assert not re.search(r'@@[A-Z_]+@@',online)
assert '博士学位待授予' in online and 'Doctoral degree pending' in online
assert 'subject to university approval' in online
for name in ASSETS:
 assert (ROOT/'dist/assets'/name).read_bytes()==(ROOT/'assets'/name).read_bytes()
for language in ['ZH','EN']:
 name=f'Weiyu_Zhou_CV_{language}.pdf'
 assert f'href="assets/{name}"' in online
 payload=base64.b64encode((ROOT/'assets'/name).read_bytes()).decode()
 assert f'data:application/pdf;base64,{payload}' in offline
 assert (ROOT/'assets'/name).read_bytes().startswith(b'%PDF-')

class CheckHTML(HTMLParser):
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag in ['img','script'] and a.get('src'):
   assert a['src'].startswith(('assets/','data:')),a['src']
  if tag=='a' and a.get('href','').startswith('assets/'):
   assert a['href'] in expected,a['href']
CheckHTML().feed(online)
assert not re.search(r'https?://[^\s"\']+', (ROOT/'src/style.css').read_text())
print('PASS: dist whitelist, same-origin assets, bilingual degree status, PDF bytes and offline embeds')
