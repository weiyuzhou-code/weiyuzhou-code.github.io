/* Local HTTP acceptance tests. npm install --no-save playwright, then node tests/browser.cjs. */
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=path.join(root,'qa');fs.mkdirSync(out,{recursive:true});
const mime={'.html':'text/html; charset=utf-8','.png':'image/png','.pdf':'application/pdf'};
const server=http.createServer((req,res)=>{
 let p=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 if(p.startsWith('/portfolio/'))p=p.slice('/portfolio'.length);
 const file=path.resolve(root,'dist','.'+(p==='/'?'/index.html':p));
 if(!file.startsWith(path.join(root,'dist')+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));
});
const results=[],errors=[],external=[];
async function test(name,fn){try{await fn();results.push({name,status:'PASS'});console.log('PASS',name);}catch(e){results.push({name,status:'FAIL',error:e.message});throw e;}}
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base=`http://127.0.0.1:${server.address().port}/`;
 const browser=await chromium.launch({headless:true,...(process.env.BROWSER_CHANNEL?{channel:process.env.BROWSER_CHANNEL}:{})});
 try{
 for(const width of [1440,768,390,360])for(const lang of ['zh','en']){
  await test(`${width}px ${lang}: layout, interactions, PDFs and screenshot`,async()=>{
   const context=await browser.newContext({viewport:{width,height:1000},acceptDownloads:true});
   const page=await context.newPage();
   page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
   page.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('data:'))external.push(r.url());});
   await page.goto(base,{waitUntil:'networkidle'});
   if(lang==='en')await page.locator('#language-toggle').click();
   assert.equal(await page.locator('html').getAttribute('lang'),lang==='zh'?'zh-CN':'en');
   assert.equal(await page.locator('.project-card:visible').count(),4);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'horizontal page overflow');
   for(const img of await page.locator('img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(i=>i.decode());}
   assert(await page.locator('img').evaluateAll(imgs=>imgs.every(i=>i.complete&&i.naturalWidth>0)),'image missing');
   await page.locator('#motion-toggle').click();assert.equal(await page.locator('#motion-toggle').getAttribute('aria-pressed'),'false');
   const before=await page.locator('canvas').evaluate(c=>c.toDataURL());
   await page.locator('#deformation').focus();await page.keyboard.press('ArrowRight');
   const after=await page.locator('canvas').evaluate(c=>c.toDataURL());assert.notEqual(before,after);
   if(width<741){
    await page.locator('#menu-toggle').click();assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'true');
    await page.locator('#main-nav a[href="#work"]').click();assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'false');
   }
   for(const category of ['research','engineering','all']){
    await page.locator(`[data-filter="${category}"]`).click();assert.equal(await page.locator('.project-card:visible').count(),category==='all'?4:2);
   }
   for(const id of ['cavitation','tim','damping','electrode']){
    const b=page.locator(`[data-project="${id}"]`);await b.focus();await page.keyboard.press('Enter');
    assert(await page.locator('#project-dialog').isVisible());
    assert(await page.locator('#project-dialog').evaluate(d=>d.scrollWidth<=d.clientWidth),'dialog overflow');
    // Wait for the native close event before opening the next dialog.
    await page.evaluate(()=>{window.dialogClosed=new Promise(resolve=>document.querySelector('#project-dialog').addEventListener('close',resolve,{once:true}));});
    await page.keyboard.press('Escape');
    await page.evaluate(()=>window.dialogClosed.then(()=>true));
    await page.locator('#project-dialog').waitFor({state:'hidden'});
    await page.waitForFunction(id=>document.activeElement?.dataset.project===id,id);
    assert.equal(await b.evaluate(b=>b===document.activeElement),true);
   }
   await page.locator('.cv-trigger').first().click();
   for(const language of ['ZH','EN']){
    const [download]=await Promise.all([page.waitForEvent('download'),page.locator(`.cv-choice[download="Weiyu_Zhou_CV_${language}.pdf"]`).click()]);
    assert.equal(download.suggestedFilename(),`Weiyu_Zhou_CV_${language}.pdf`);
    assert.deepEqual(fs.readFileSync(await download.path()),fs.readFileSync(path.join(root,'assets',download.suggestedFilename())));
   }
   await page.locator('#cv-dialog [data-close]').click();assert(!(await page.locator('#cv-dialog').isVisible()));
   assert.equal(await page.locator('.email-link').getAttribute('href'),'mailto:zhouweiyu1@qq.com');
   await context.grantPermissions(['clipboard-read','clipboard-write']);await page.locator('#copy-email').click();
   assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),'zhouweiyu1@qq.com');
   await page.locator('#share-site').click();assert.match(await page.locator('#toast').textContent(),/local preview|本地预览/);
   await page.locator('#toast').waitFor({state:'hidden'});
   await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
   await page.screenshot({path:path.join(out,`${lang}-${width}.png`),fullPage:true});
   if(width===1440||width===390)await page.screenshot({path:path.join(out,`${lang}-${width}-viewport.png`)});
   await context.close();
  });
 }
 await test('reduced motion, blocked clipboard/storage and keyboard fallback',async()=>{
  const c=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await c.addInitScript(()=>{
   Object.defineProperty(navigator,'clipboard',{value:{writeText:()=>Promise.reject(new Error('denied'))}});
   document.execCommand=()=>false;
   Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked');}});
  });
  const p=await c.newPage();await p.goto(base);
  assert.equal(await p.locator('#motion-toggle').getAttribute('aria-pressed'),'false');
  await p.locator('#copy-email').click();assert(await p.locator('#manual-copy').isVisible());
  assert.equal(await p.locator('#manual-copy').inputValue(),'zhouweiyu1@qq.com');
  assert(await p.locator('#manual-copy').evaluate(i=>i.selectionEnd-i.selectionStart===i.value.length));
  await p.locator('#language-toggle').focus();await p.keyboard.press('Enter');assert.equal(await p.locator('html').getAttribute('lang'),'en');
  await p.locator('#menu-toggle').click();await p.keyboard.press('Escape');assert.equal(await p.locator('#menu-toggle').getAttribute('aria-expanded'),'false');
  await c.close();
 });
 await test('no JavaScript: readable content and same-origin PDFs, including project subpath',async()=>{
  const c=await browser.newContext({javaScriptEnabled:false});const p=await c.newPage();
  await p.goto(base+'portfolio/');assert.equal(await p.locator('.project-card').count(),4);
  for(const a of await p.locator('.cv-direct a').all()){
   assert(await a.isVisible());const url=new URL(await a.getAttribute('href'),base+'portfolio/');
   const r=await c.request.get(url.href);assert.equal(r.status(),200);assert.match(r.headers()['content-type'],/application\/pdf/);
   assert((await r.body()).subarray(0,5).equals(Buffer.from('%PDF-')));
  }
  await c.close();
 });
 await test('offline file: language switching and embedded PDF downloads',async()=>{
  const c=await browser.newContext({acceptDownloads:true});const p=await c.newPage();
  await p.goto(require('node:url').pathToFileURL(path.join(root,'index.html')).href);
  await p.locator('#language-toggle').click();assert.equal(await p.locator('html').getAttribute('lang'),'en');
  await p.locator('.cv-trigger').first().click();
  for(const l of ['ZH','EN']){
   const [d]=await Promise.all([p.waitForEvent('download'),p.locator(`.cv-choice[download="Weiyu_Zhou_CV_${l}.pdf"]`).click()]);
   assert.deepEqual(fs.readFileSync(await d.path()),fs.readFileSync(path.join(root,'assets',d.suggestedFilename())));
  }
  await c.close();
 });
 await test('production sharing logic (mocked origin, not a live deployment)',async()=>{
  const c=await browser.newContext();
  const production='https://weiyuzhou-code.github.io/';
  await c.route(production+'**',async route=>{
   const u=new URL(route.request().url());
   const f=path.join(root,'dist',u.pathname==='/'?'index.html':u.pathname.slice(1));
   await route.fulfill({body:fs.readFileSync(f),contentType:mime[path.extname(f)]});
  });
  const p=await c.newPage();await p.goto(production+'?source=test#contact');
  await p.evaluate(url=>{
   window.PUBLIC_SITE_URL=url;
   Object.defineProperty(navigator,'share',{configurable:true,value:async data=>{window.shareTest=data;}});
  },production);
  await p.locator('#share-site').click();assert.equal(await p.evaluate(()=>window.shareTest.url),production);
  await p.evaluate(()=>{
   Object.defineProperty(navigator,'share',{configurable:true,value:undefined});
   Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.copyTest=text;}}});
  });
  await p.locator('#share-site').click();assert.equal(await p.evaluate(()=>window.copyTest),production);
  await p.evaluate(()=>{navigator.clipboard.writeText=async()=>{throw new Error('denied');};document.execCommand=()=>false;});
  await p.locator('#share-site').click();assert.equal(await p.locator('#manual-copy').inputValue(),production);
  await c.close();
 });
 await test('no page errors, missing resources or third-party background requests',async()=>{assert.deepEqual(errors,[]);assert.deepEqual(external,[]);});
 }finally{await browser.close();server.close();fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({browser:'Chromium / '+(process.env.BROWSER_CHANNEL||'bundled'),results,errors,external},null,2));}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
