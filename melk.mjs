import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:390,height:844}});
for (const u of process.argv.slice(2)) {
  await p.goto('http://localhost:8766'+u, {waitUntil:'networkidle'});
  const r = await p.evaluate(() => { const vis=e=>{const s=getComputedStyle(e),b=e.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&b.width>0&&b.height>0};
    return [...document.querySelectorAll('a,button,[role=button],input,select')].filter(vis).filter(e=>{const b=e.getBoundingClientRect();return (b.height<44||b.width<44)&&!e.closest('p,li p,figcaption')}).map(e=>{const b=e.getBoundingClientRect();return e.tagName+'.'+e.className+' "'+e.textContent.trim().slice(0,30)+'" '+Math.round(b.width)+'x'+Math.round(b.height)}) });
  console.log(u, r);
}
await b.close();
