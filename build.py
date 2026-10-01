#!/usr/bin/env python3
"""Build an entirely self-contained portfolio. Python 3.9+; standard library only.
Edit src/content.json and src/*.css/js/html, then run: python build.py
CV PDFs are maintained in assets/; regenerate from src/cv_*.html when edited.
"""
from pathlib import Path
import json, re, base64, html, math, argparse, shutil
from urllib.parse import urlsplit
ROOT=Path(__file__).resolve().parent
S=json.loads((ROOT/'src/content.json').read_text(encoding='utf-8'))
def esc(s):return html.escape(str(s),quote=True)
def resolve(key):
 v=S
 for part in key.split('.'):v=v[int(part)] if isinstance(v,list) else v[part]
 return v

def trans(key):
 v=resolve(key)
 return f'<span data-i18n="{esc(key)}">{esc(v["zh"] if isinstance(v,dict) else v)}</span>'
def data_uri(path,mime):
 if not path.is_file():raise FileNotFoundError(f'Required asset missing: {path}')
 return f'data:{mime};base64,'+base64.b64encode(path.read_bytes()).decode('ascii')

def icon(name):return f'<svg class="icon" aria-hidden="true"><use href="#i-{name}"></use></svg>'
LOGO='<svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M5 13L12 29L20 10L28 29L35 13" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 34H32" stroke="currentColor" stroke-width="1" opacity=".45"/></svg>'
paths={
'arrow-ne':'<path d="M5 19L19 5M5 5h14v14"/>',
'arrow-e':'<path d="M4 12h16m-6-6 6 6-6 6"/>',
'arrow-up':'<path d="M12 20V4m-6 6 6-6 6 6"/>',
'download':'<path d="M12 3v12m-5-5 5 5 5-5M5 17v4h14v-4"/>',
'copy':'<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M15 5V3H4v13h1"/>',
'menu':'<path d="M4 7h16M4 12h16M4 17h16"/>',
'pause':'<path d="M8 5v14M16 5v14"/>',
'play':'<path d="m8 4 12 8-12 8V4Z"/>',
'check':'<path d="m5 12 4 4L19 6"/>',
'close':'<path d="m6 6 12 12M6 18 18 6"/>',
'share':'<path d="M12 15V3m-4 4 4-4 4 4M5 11v10h14V11"/>',
'file':'<path d="M14 3H5v18h14V8l-5-5Zm0 0v5h5M8 13h8M8 17h6"/>'}
ICONS='<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true"><defs>'+''.join(f'<symbol id="i-{k}" viewBox="0 0 24 24">{v}</symbol>' for k,v in paths.items())+'</defs></svg>'

def svg_wrap(inner):return '<svg viewBox="0 0 560 245" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">'+inner+'</svg>'
def art_cavitation():
 parts=['<defs><linearGradient id="cavmat" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#d1ddc6"/><stop offset="1" stop-color="#a9bfa4"/></linearGradient><radialGradient id="void"><stop stop-color="#fafbf3"/><stop offset=".65" stop-color="#edf2e4"/><stop offset="1" stop-color="#9ab592"/></radialGradient></defs>', '<g transform="translate(115 56) rotate(-8 160 80)"><rect x="-2" y="9" width="329" height="150" rx="24" fill="#506d4312"/><rect width="330" height="150" rx="19" fill="url(#cavmat)" stroke="#94aa88" stroke-width=".8"/>']
 cavities=[(80,70,23),(173,89,33),(263,51,18)]
 def deform(x,y):
  xx,yy=x,y
  for cx,cy,r in cavities:
   dx,dy=x-cx,y-cy;d=math.hypot(dx,dy)+.01;push=(r*r*0.65/d)*math.exp(-d*d/(r*r*5));xx+=dx/d*push;yy+=dy/d*push
  return max(4,min(326,xx)),max(4,min(146,yy))
 for vertical in (True,False):
  for fixed in range(10,330 if vertical else 150,12):
   pts=[]
   for u in range(5,146 if vertical else 326,3):
    x,y=(fixed,u) if vertical else (u,fixed);x,y=deform(x,y);pts.append(f'{x:.1f},{y:.1f}')
   parts.append(f'<polyline points="{" ".join(pts)}" fill="none" stroke="#6c9362" stroke-opacity=".4" stroke-width=".65"/>')
 for cx,cy,r in cavities:
  parts.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="url(#void)" stroke="#84a178" stroke-width="1"/><ellipse cx="{cx-5}" cy="{cy-5}" rx="{r*.45}" ry="{r*.25}" fill="#ffffff75" transform="rotate(-30 {cx} {cy})"/>')
 parts+=['</g>','<path d="M68 108H40m7-5-7 5 7 5M492 140h28m-7-5 7 5-7 5" stroke="#92a487" fill="none" stroke-width="1"/>']
 return svg_wrap(''.join(parts))
def art_tim():
 return svg_wrap('''<defs><linearGradient id="metal"><stop stop-color="#c3c9be"/><stop offset="1" stop-color="#e0e2d8"/></linearGradient><linearGradient id="pad"><stop stop-color="#8aa890"/><stop offset="1" stop-color="#b2c6a6"/></linearGradient><linearGradient id="chip"><stop stop-color="#ad6849"/><stop offset="1" stop-color="#d5966c"/></linearGradient></defs><ellipse cx="285" cy="211" rx="147" ry="18" fill="#4151320b"/><g stroke="#758b701f" stroke-width=".7"><path d="m116 164 175-47 154 46-175 54Z" fill="#627b67"/><path d="m116 164 154 46v9l-154-46Z" fill="#486353"/><path d="m270 210 175-47v9l-175 47Z" fill="#385340"/><path d="m127 132 163-44 144 43-163 47Z" fill="url(#pad)"/><path d="m127 132 144 46v16l-144-46Z" fill="#8aa883"/><path d="m271 178 163-47v16l-163 47Z" fill="#769877"/><path d="m226 135 61-17 56 17-62 19Z" fill="url(#chip)"/><path d="m226 135 55 19v6l-55-19Z" fill="#9e583e"/><path d="m281 154 62-19v6l-62 19Z" fill="#b1714c"/><path d="m106 91 184-47 165 47-184 52Z" fill="url(#metal)"/><path d="m106 91 165 52v8l-165-52Z" fill="#a4b09f"/><path d="m271 143 184-52v8l-184 52Z" fill="#8d9e8b"/></g><g stroke="#f8faf177" stroke-width=".8"><path d="m137 82 166 48m-134-57 166 48m-134-57 166 48m-134-57 166 48m-134-57 164 47"/></g><g stroke="#a8896b" stroke-width=".8" fill="none"><path d="M231 36v19m-4-5 4 5 4-5M298 17v20m-4-5 4 5 4-5M365 35v20m-4-5 4 5 4-5"/></g><path d="m475 108-5 21 4 22-5 20" stroke="#9da48f" stroke-width=".8" fill="none" stroke-dasharray="3 3"/>''')
def art_damping():
 return svg_wrap('''<defs><linearGradient id="frame"><stop stop-color="#809477"/><stop offset="1" stop-color="#b3c0a5"/></linearGradient><radialGradient id="lens"><stop stop-color="#47705e"/><stop offset=".25" stop-color="#759284"/><stop offset=".28" stop-color="#17362f"/><stop offset=".55" stop-color="#16342d"/><stop offset=".59" stop-color="#617d68"/><stop offset=".73" stop-color="#27483b"/><stop offset="1" stop-color="#102c24"/></radialGradient></defs><g transform="translate(282 124) rotate(-13)"><rect x="-100" y="-84" width="211" height="179" rx="32" fill="#455a360b"/><rect x="-105" y="-90" width="210" height="180" rx="29" fill="url(#frame)" stroke="#778d6d" stroke-width=".8"/><rect x="-94" y="-79" width="188" height="158" rx="24" fill="#ced8c3" stroke="#8da080" stroke-width=".8"/><rect x="-74" y="-63" width="148" height="126" rx="20" fill="#9ba993"/><g fill="#c58659" stroke="#b37348" stroke-width=".6"><rect x="-88" y="-41" width="18" height="82" rx="8"/><rect x="70" y="-41" width="18" height="82" rx="8"/><rect x="-42" y="-77" width="84" height="16" rx="7"/><rect x="-42" y="61" width="84" height="16" rx="7"/></g><circle r="61" fill="#8c9e86" stroke="#c7d6bc" stroke-width="2"/><circle r="53" fill="url(#lens)"/><circle r="30" fill="none" stroke="#8ca79188" stroke-width=".6"/><ellipse cx="-16" cy="-20" rx="14" ry="7" fill="#d7e9d344" transform="rotate(-28)"/><circle cx="17" cy="16" r="5" fill="#c5d9d02b"/><g fill="#64785b"><circle cx="-77" cy="-60" r="3"/><circle cx="77" cy="-60" r="3"/><circle cx="-77" cy="60" r="3"/><circle cx="77" cy="60" r="3"/></g></g><path d="M72 127c8-58 8 58 17 0s9 45 18 0 9 31 17 0 9 17 17 0" stroke="#a4b296" fill="none" stroke-width="1"/><path d="M423 119c8-17 8 17 17 0s9 31 18 0 9 45 17 0 9 58 17 0" stroke="#a4b296" fill="none" stroke-width="1"/>''')
def art_electrode():
 return svg_wrap('''<defs><linearGradient id="skin"><stop stop-color="#dfbaa0"/><stop offset="1" stop-color="#ecd2bb"/></linearGradient><linearGradient id="film"><stop stop-color="#8baa8d"/><stop offset="1" stop-color="#d0ddbf"/></linearGradient></defs><path d="M64 188c67-4 95-10 131-27s61-38 108-31 104 17 190-4v45c-109 23-145 3-190 0s-77 8-108 23-83 23-131 17Z" fill="#d3ac90"/><path d="M64 164c67-4 95-10 131-27s61-38 108-31 104 17 190-4v24c-86 21-143 11-190 4s-72 14-108 31-64 23-131 27Z" fill="url(#skin)"/><path d="M64 164c67-4 95-10 131-27s61-38 108-31 104 17 190-4" stroke="#b78766" stroke-width="1" fill="none"/><path d="M100 154c50-8 70-11 100-24s50-22 70-18 35 5 55-12 28-48 52-63l21 8c-18 11-29 49-52 69s-48 10-72 9-39 14-67 25-60 13-94 19Z" fill="url(#film)" stroke="#789875" stroke-width=".8"/><path d="M120 156c42-7 62-12 87-23s46-17 66-16 43 2 61-16 27-49 49-60" stroke="#476f5366" stroke-width="1" fill="none"/><path d="m155 141 10 11m14-18 10 10m10-19 10 11m16-20 8 12m18-20 6 13m20-13 1 12m18-11-3 11m21-17-7 11m19-25-9 9m19-25-11 8m20-25-10 6" stroke="#476f5366" stroke-width="1"/><path d="M381 22c29-4 40 14 42 33m-5-5 5 5 4-6" fill="none" stroke="#738b68" stroke-width="1"/><g stroke="#be977c" stroke-width=".6" opacity=".4"><path d="m85 194 4 11m27-15 4 11m25-17 5 11m25-20 6 10m28-27 8 9m26-30 8 8m26-10 3 10m29-8 3 10m30-8 2 10m29-9 1 11m32-11v10m30-12v9"/></g>''')
ARTS={'cavitation':art_cavitation,'tim':art_tim,'damping':art_damping,'electrode':art_electrode}

def project_cards():
 out=[]
 for i,p in enumerate(S['projects']):
  key=f'projects.{i}'
  tags=''.join(f'<span class="project-tag">{esc(tag)}</span>' for tag in p['tags'])
  out.append(f'<article class="project-card" data-category="{esc(p["category"])}"><div class="project-art">{ARTS[p["id"]]()}<span class="art-caption">{trans(key+".label")}</span><span class="art-index">PROJECT / {p["number"]}</span></div><div class="project-body"><div class="project-tags">{tags}</div><h3>{trans(key+".title")}</h3><p class="project-description">{trans(key+".description")}</p><div class="project-bottom"><span class="project-subtitle">{trans(key+".subtitle")}</span><button type="button" class="project-open" data-project="{p["id"]}" aria-label="{esc(p["title"]["zh"])}" data-aria-key="{key}.title">{trans("ui.detail")}{icon("arrow-ne")}</button></div></div></article>')
 return '\n'.join(out)
def skill_cards():
 return '\n'.join(f'<article class="skill"><div class="skill-meta"><span class="skill-letter">{esc(p["n"])}</span><span class="skill-type">{esc(p["tag"])}</span></div><h3>{trans(f"expertise.cards.{i}.title")}</h3><p>{trans(f"expertise.cards.{i}.text")}</p></article>' for i,p in enumerate(S['expertise']['cards']))
def publications():
 out=[]
 for i,p in enumerate(S['papers']['items']):
  authors=esc(p['authors']).replace('W. Zhou','<strong>W. Zhou</strong>')
  out.append(f'<article class="paper"><div class="paper-year">{p["year"]}</div><div class="paper-body"><div class="paper-journal">{esc(p["journal"])}<span class="author-badge">{trans(f"papers.items.{i}.badge")}</span></div><h3 class="paper-title"><a href="https://doi.org/{esc(p["doi"])}" target="_blank" rel="noopener noreferrer">{esc(p["title"])}</a></h3><p class="paper-authors">{authors}</p><div class="paper-details">{esc(p["detail"])} · DOI: {esc(p["doi"])}</div></div><span class="paper-arrow" aria-hidden="true">{icon("arrow-ne")}</span></article>')
 return '\n'.join(out)

def main():
 parser=argparse.ArgumentParser(description=__doc__)
 parser.add_argument('--site-url',default=None,help='Confirmed public HTTPS site URL, including project subpath')
 args=parser.parse_args()
 site_url=args.site_url if args.site_url is not None else json.loads((ROOT/'site.json').read_text(encoding='utf-8'))['url']
 if site_url:
  u=urlsplit(site_url)
  if u.scheme!='https' or not u.hostname or u.username or u.password or u.query or u.fragment or u.hostname in ('localhost','127.0.0.1','github.com'):
   raise ValueError('Use the public HTTPS website URL, not a preview or repository URL')
  site_url=site_url.rstrip('/')+'/'
 template=(ROOT/'src/index.template.html').read_text(encoding='utf-8')
 replacements={
  'CSS':(ROOT/'src/style.css').read_text(encoding='utf-8'),
  'JS':(ROOT/'src/app.js').read_text(encoding='utf-8'),
  'CONTENT':json.dumps(S,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c'),
  'SCHEMA':json.dumps({'@context':'https://schema.org','@type':'Person','name':S['identity']['english'],'alternateName':S['identity']['name']['zh'],'email':S['identity']['email'],'sameAs':[S['identity']['github']],'knowsAbout':['Solid Mechanics','Viscoelasticity','Finite Element Analysis','Soft Materials','Constitutive Modeling']},ensure_ascii=False),
  'PORTRAIT':data_uri(ROOT/'assets/portrait.png','image/png'),
  'PDF_ZH':data_uri(ROOT/'assets/Weiyu_Zhou_CV_ZH.pdf','application/pdf'),
  'PDF_EN':data_uri(ROOT/'assets/Weiyu_Zhou_CV_EN.pdf','application/pdf'),
  'PROJECTS':project_cards(),'PUBLICATIONS':publications(),'SKILLS':skill_cards(),
  'EMAIL':esc(S['identity']['email']),'GITHUB':esc(S['identity']['github']),'LOGO':LOGO,'ICONS':ICONS,
 }
 for key,name in [('ARROW_NE','arrow-ne'),('ARROW_E','arrow-e'),('ARROW_UP','arrow-up'),('DOWNLOAD','download'),('COPY','copy'),('MENU','menu'),('PAUSE','pause'),('CHECK','check'),('CLOSE','close'),('SHARE','share'),('FILE','file')]:replacements[key]=icon(name)
 template=re.sub(r'\{\{([\w.]+)\}\}',lambda m:trans(m.group(1)),template)
 def render(values):
  result=template
  for key,value in values.items():result=result.replace('@@'+key+'@@',value)
  unfilled=re.findall(r'@@[A-Z_]+@@',result)
  if unfilled:raise ValueError(f'Unfilled template keys: {unfilled}')
  return result
 offline=render(dict(replacements,PUBLIC_META='',PUBLIC_URL='""'))
 (ROOT/'index.html').write_text(offline,encoding='utf-8')
 # Never publish the source tree. Copy only these explicitly allowed assets.
 assets=['portrait.png','Weiyu_Zhou_CV_ZH.pdf','Weiyu_Zhou_CV_EN.pdf','share-card.png']
 allowed={'index.html','.nojekyll',*('assets/'+name for name in assets)}
 dist=ROOT/'dist'
 if dist.is_symlink():raise ValueError('dist must not be a symbolic link')
 if dist.exists():
  unexpected=[p.relative_to(dist).as_posix() for p in dist.rglob('*') if p.is_symlink() or (p.is_file() and p.relative_to(dist).as_posix() not in allowed)]
  if unexpected:raise ValueError(f'Unexpected files in dist; review before publishing: {unexpected}')
 (dist/'assets').mkdir(parents=True,exist_ok=True)
 for name in assets:shutil.copyfile(ROOT/'assets'/name,dist/'assets'/name)
 meta=''
 if site_url:
  meta=f'<link rel="canonical" href="{esc(site_url)}"><meta property="og:url" content="{esc(site_url)}"><meta property="og:image" content="{esc(site_url)}assets/share-card.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="Weiyu Zhou — Materials, Mechanics and Engineering">'
 online=dict(replacements,PORTRAIT='assets/portrait.png',PDF_ZH='assets/Weiyu_Zhou_CV_ZH.pdf',PDF_EN='assets/Weiyu_Zhou_CV_EN.pdf',PUBLIC_META=meta,PUBLIC_URL=json.dumps(site_url))
 (dist/'index.html').write_text(render(online),encoding='utf-8')
 (dist/'.nojekyll').write_text('',encoding='utf-8')
 print('Built offline index.html and allowlisted dist/ (public URL '+('configured' if site_url else 'pending')+')')
if __name__=='__main__':main()
