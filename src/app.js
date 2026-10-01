/* Vanilla JavaScript. Local-first: no APIs, analytics, remote assets or dependencies. */
'use strict';
(() => {
 const S=window.SITE;
 const $=(s,r=document)=>r.querySelector(s);
 const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
 let lang='zh', activeProject=null, lastFocused=null, toastTimer;
 const get=(path)=>path.split('.').reduce((v,k)=>v?.[k],S);
 const tr=(v)=>v&&typeof v==='object'?(v[lang]??v.zh??''):String(v??'');
 const t=(key)=>tr(get(key));
 const escapeHTML=(s)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const icon=(name)=>`<svg class="icon" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
 const toast=(message)=>{clearTimeout(toastTimer);const e=$('#toast');e.textContent=message;e.classList.add('visible');toastTimer=setTimeout(()=>e.classList.remove('visible'),3600);};
 function setLanguage(next){
  lang=next==='en'?'en':'zh';
  document.documentElement.lang=lang==='zh'?'zh-CN':'en';
  document.body.classList.toggle('en',lang==='en');
  $$('[data-i18n]').forEach(el=>{el.textContent=t(el.dataset.i18n);});
  $$('[data-aria-key]').forEach(el=>{el.setAttribute('aria-label',t(el.dataset.ariaKey));});
  $('#language-label').textContent=lang==='zh'?'EN':'中';
  $('#language-toggle').setAttribute('aria-label',lang==='zh'?'Switch to English':'切换为中文');
  $('#language-toggle').title=lang==='zh'?'Switch to English':'切换为中文';
  document.title=lang==='zh'?'周伟裕 Weiyu Zhou — 材料 · 力学 · 工程':'Weiyu Zhou — Materials, Mechanics & Engineering';
  $('meta[name="description"]').content=lang==='zh'?'周伟裕 Weiyu Zhou｜南方科技大学固体力学博士研究背景。专注粘弹性、软材料、界面失效、Abaqus 有限元与工程验证。开放研发与仿真岗位交流。':'Weiyu Zhou: doctoral research in solid mechanics at SUSTech. Experiments, constitutive modeling and finite element analysis for soft materials and engineering. Open to R&D roles.';
  $('#main-nav').setAttribute('aria-label',lang==='zh'?'主要导航':'Main navigation');
  if(activeProject)renderProject(activeProject);
  try{localStorage.setItem('weiyu-portfolio-language',lang);}catch{/* Browser privacy settings may disable localStorage. */}
 }
 $('#language-toggle').addEventListener('click',()=>setLanguage(lang==='zh'?'en':'zh'));
 try{setLanguage(localStorage.getItem('weiyu-portfolio-language')==='en'?'en':'zh');}catch{setLanguage('zh');}
 const menuButton=$('#menu-toggle'),nav=$('#main-nav');
 function closeMenu(){nav.classList.remove('open');menuButton.setAttribute('aria-expanded','false');menuButton.dataset.ariaKey='ui.menu';menuButton.setAttribute('aria-label',t('ui.menu'));}
 menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);menuButton.dataset.ariaKey=open?'ui.menuClose':'ui.menu';menuButton.setAttribute('aria-label',t(menuButton.dataset.ariaKey));});
 $$('#main-nav a').forEach(a=>a.addEventListener('click',closeMenu));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){closeMenu();menuButton.focus();}});
 document.addEventListener('click',e=>{if(!e.target.closest('.topbar'))closeMenu();});
 const narrow=matchMedia('(max-width:740px)');
 narrow.addEventListener('change',()=>closeMenu());
 $$('.filter').forEach(button=>button.addEventListener('click',()=>{
  const filter=button.dataset.filter;
  $$('.filter').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  $$('.project-card').forEach(card=>{card.hidden=filter!=='all'&&card.dataset.category!==filter;});
  $('#filter-status').textContent=`${$$('.project-card:not([hidden])').length} ${t('ui.results')}`;
 }));
 function renderProject(id){
  const p=S.projects.find(p=>p.id===id);if(!p)return;
  $('#project-dialog-body').innerHTML=`<span class="eyebrow">${escapeHTML(tr(p.label))}</span><h2 id="project-dialog-title">${escapeHTML(tr(p.title))}</h2><p class="lead">${escapeHTML(tr(p.description))}</p>${['challenge','methods','contribution'].map(k=>`<section class="detail-section"><h3>${escapeHTML(t('detail.'+k))}</h3><p>${escapeHTML(tr(p[k]))}</p></section>`).join('')}<div class="dialog-tools">${p.tools.map(k=>`<span>${escapeHTML(k)}</span>`).join('')}</div>${p.related?`<a class="button primary" style="margin-top:24px" href="${escapeHTML(p.related)}" target="_blank" rel="noopener noreferrer">${escapeHTML(t('ui.sourcePaper'))}${icon('arrow-ne')}</a>`:''}<p class="dialog-note">${escapeHTML(t('detail.note'))}</p>`;
 }
 function openDialog(d){lastFocused=document.activeElement;d.showModal();document.body.style.overflow='hidden';}
 $$('.project-open').forEach(button=>button.addEventListener('click',()=>{activeProject=button.dataset.project;renderProject(activeProject);openDialog($('#project-dialog'));}));
 $$('.cv-trigger').forEach(button=>button.addEventListener('click',()=>openDialog($('#cv-dialog'))));
 $$('dialog').forEach(d=>{
  $('[data-close]',d).addEventListener('click',()=>d.close());
  d.addEventListener('click',e=>{if(e.target!==d)return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();});
  d.addEventListener('close',()=>{document.body.style.overflow='';if(d.id==='project-dialog')activeProject=null;if(lastFocused?.isConnected)lastFocused.focus({preventScroll:true});});
 });
 async function copyText(value){
  try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(value);return true;}}catch{/* Fall back for local files and restricted contexts. */}
  const el=document.createElement('textarea');el.value=value;el.setAttribute('readonly','');el.style.cssText='position:fixed;left:-9999px;top:0';document.body.append(el);el.select();el.setSelectionRange(0,el.value.length);let ok=false;try{ok=document.execCommand('copy');}catch{}el.remove();return ok;
 }
 function manualCopy(value){const box=$('#copy-fallback'),field=$('#manual-copy');box.hidden=false;field.value=value;field.focus();field.select();}
 $('#copy-email').addEventListener('click',async()=>{if(await copyText(S.identity.email)){toast(t('ui.copied'));}else{manualCopy(S.identity.email);toast(t('ui.copyFail'));}});
 $('#share-site').addEventListener('click',async()=>{
  const url=window.PUBLIC_SITE_URL;
  // Only the configured production origin and path may be shared.
  if(!url||location.protocol!=='https:'||location.origin!==new URL(url).origin||![new URL(url).pathname,new URL(url).pathname+'index.html'].includes(location.pathname)){toast(t('ui.localShare'));return;}
  if(navigator.share){try{await navigator.share({title:document.title,text:'Weiyu Zhou · Materials, Mechanics & Engineering',url});return;}catch(e){if(e.name==='AbortError')return;}}
  if(await copyText(url))toast(t('ui.shareCopied'));else manualCopy(url);
 });
 if('IntersectionObserver' in window){
  const sections=$$('main section[id]');
  const activeObserver=new IntersectionObserver(entries=>{
   for(const entry of entries){if(!entry.isIntersecting)continue;const id=entry.target.id;$$('#main-nav a').forEach(a=>{const current=a.getAttribute('href')==='#'+id;a.classList.toggle('active',current);if(current)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}
  },{rootMargin:'-15% 0px -65% 0px',threshold:0});
  sections.forEach(s=>activeObserver.observe(s));
 }
 // Artistic mesh renderer. Geometry and controls are illustrative, not a solver.
 const canvas=$('#material-canvas'), ctx=canvas.getContext('2d');
 if(!ctx)return;
 const slider=$('#deformation'),motionButton=$('#motion-toggle');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const state={load:Number(slider.value)/100,time:0,width:0,height:0,play:!reduced.matches,visible:true,raf:0,last:0};
 function syncMotion(){const key=state.play?'ui.motionPause':'ui.motionPlay';motionButton.dataset.ariaKey=key;motionButton.setAttribute('aria-label',t(key));motionButton.innerHTML=icon(state.play?'pause':'play');motionButton.setAttribute('aria-pressed',String(state.play));}
 function sizeCanvas(){const r=canvas.getBoundingClientRect();state.width=r.width;state.height=r.height;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw();}
 function draw(){
  const W=state.width,H=state.height;if(!W||!H)return;
  ctx.clearRect(0,0,W,H);
  const scale=Math.min(W/5.05,H/3.6),cx=W*.5,cy=H*.49;
  const angle=.16+Math.sin(state.time*.42)*.065;
  const co=Math.cos(angle),si=Math.sin(angle);
  const project=([x,y,z])=>{const a=x*co-y*si,b=x*si+y*co;return[cx+(a-b)*.82*scale,cy+(a+b)*.38*scale-z*scale,a+b+z*.35];};
  const polygon=(points,fill,stroke,width=.5)=>{ctx.beginPath();points.forEach((p,i)=>{const [x,y]=project(p);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}};
  ctx.save();ctx.translate(cx,cy+scale*.81);ctx.scale(1,.27);const shadow=ctx.createRadialGradient(0,0,0,0,0,scale*2.1);shadow.addColorStop(0,'rgba(57,88,62,.17)');shadow.addColorStop(.55,'rgba(57,88,62,.07)');shadow.addColorStop(1,'rgba(57,88,62,0)');ctx.fillStyle=shadow;ctx.beginPath();ctx.arc(0,0,scale*2.1,0,Math.PI*2);ctx.fill();ctx.restore();
  const radius=.34+state.load*.38,thetaCount=64,ringCount=15,half=1.37,zbot=-.40;
  const point=(a,u,bottom=false)=>{const c=Math.cos(a),s=Math.sin(a),outer=half/Math.max(Math.abs(c),Math.abs(s));const r=radius+(outer-radius)*Math.pow(u,1.2);const z=bottom?zbot:.16+.19*(.3+state.load)*Math.exp(-Math.pow((r-radius)/.41,2))+.025*Math.sin(a*2+state.time*.4)*(1-u);return[r*c,r*s,z];};
  const faces=[];
  const add=(p,fill,stroke='rgba(42,94,64,.30)',lw=.45)=>{const depth=p.reduce((d,v)=>d+project(v)[2],0)/p.length;faces.push({p,fill,stroke,lw,depth});};
  for(let a=0;a<thetaCount;a++){
   const a1=2*Math.PI*a/thetaCount,a2=2*Math.PI*(a+1)/thetaCount;
   for(let j=0;j<ringCount;j++){
    const u=j/ringCount,v=(j+1)/ringCount,p=[point(a1,u),point(a2,u),point(a2,v),point(a1,v)];
    const light=Math.sin(a1-.5)*5+(1-u)*5;
    add(p,`rgba(${Math.round(178+light)},${Math.round(202+light)},${Math.round(177+light)},.92)`);
   }
   for(let j=0;j<4;j++){
    const p1=point(a1,1),p2=point(a2,1),z1=.16+(.40+.16)*(-j/4),z2=.16+(.40+.16)*(-(j+1)/4);
    add([[p1[0],p1[1],z1],[p2[0],p2[1],z1],[p2[0],p2[1],z2],[p1[0],p1[1],z2]],`rgba(${137+j*6},${168+j*5},${144+j*5},.86)`,'rgba(45,91,64,.26)',.45);
    const q1=point(a1,0),q2=point(a2,0),t1=j/4,t2=(j+1)/4;
    add([[q1[0],q1[1],q1[2]*(1-t1)+zbot*t1],[q2[0],q2[1],q2[2]*(1-t1)+zbot*t1],[q2[0],q2[1],q2[2]*(1-t2)+zbot*t2],[q1[0],q1[1],q1[2]*(1-t2)+zbot*t2]],'rgba(113,153,125,.75)','rgba(63,113,82,.34)',.4);
   }
  }
  // Pale cavity core underneath the mesh, with optical rather than physical shading.
  const cp=project([0,0,-.12]);ctx.save();ctx.translate(cp[0],cp[1]);ctx.scale(1,.72);const bubble=ctx.createRadialGradient(-radius*scale*.25,-radius*scale*.4,0,0,0,radius*scale*1.17);bubble.addColorStop(0,'#fffef8');bubble.addColorStop(.6,'#f5f7ec');bubble.addColorStop(1,'#d3e0c9');ctx.fillStyle=bubble;ctx.beginPath();ctx.arc(0,0,radius*scale*1.15,0,Math.PI*2);ctx.fill();ctx.restore();
  faces.sort((a,b)=>a.depth-b.depth).forEach(f=>polygon(f.p,f.fill,f.stroke,f.lw));
  // Outer contour and cavity rim.
  const loop=(arr,color,lw)=>{ctx.beginPath();arr.forEach((p,i)=>{const q=project(p);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]);});ctx.closePath();ctx.strokeStyle=color;ctx.lineWidth=lw;ctx.stroke();};
  loop(Array.from({length:thetaCount},(_,a)=>point(a*2*Math.PI/thetaCount,1)),'rgba(48,104,66,.5)',.8);
  loop(Array.from({length:thetaCount},(_,a)=>point(a*2*Math.PI/thetaCount,0)),'rgba(245,250,234,.95)',1.4);
  // Small schematic coordinate reference.
  const x0=28,y0=H-43;ctx.strokeStyle='rgba(73,109,83,.45)';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x0+24,y0+11);ctx.moveTo(x0,y0);ctx.lineTo(x0-13,y0+8);ctx.moveTo(x0,y0);ctx.lineTo(x0,y0-26);ctx.stroke();ctx.font='8px Consolas,monospace';ctx.fillStyle='rgba(73,109,83,.65)';ctx.fillText('x',x0+27,y0+14);ctx.fillText('y',x0-21,y0+13);ctx.fillText('z',x0-3,y0-30);
 }
 function frame(now){state.raf=0;if(!state.play||!state.visible||document.hidden)return;const dt=state.last?Math.min(now-state.last,100):33;if(dt>=30){state.time+=dt/1000;state.last=now;draw();}state.raf=requestAnimationFrame(frame);}
 function start(){if(state.play&&state.visible&&!document.hidden&&!state.raf){state.last=0;state.raf=requestAnimationFrame(frame);}}
 function stop(){if(state.raf){cancelAnimationFrame(state.raf);state.raf=0;}}
 slider.addEventListener('input',()=>{state.load=Number(slider.value)/100;slider.style.background=`linear-gradient(to right,var(--green) 0 ${slider.value}%,#d9e2d3 ${slider.value}% 100%)`;draw();});
 motionButton.addEventListener('click',()=>{state.play=!state.play;syncMotion();state.play?start():stop();});
 reduced.addEventListener('change',e=>{if(e.matches){state.play=false;syncMotion();stop();draw();}});
 document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
 if('ResizeObserver' in window)new ResizeObserver(sizeCanvas).observe(canvas);else window.addEventListener('resize',sizeCanvas);
 if('IntersectionObserver' in window)new IntersectionObserver(entries=>{state.visible=entries[0].isIntersecting;state.visible?start():stop();},{rootMargin:'100px'}).observe(canvas);
 syncMotion();sizeCanvas();start();
})();
