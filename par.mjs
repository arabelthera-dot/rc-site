import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:390,height:844}});
await p.goto('http://localhost:8766/rc-site/muzei/sport/den/01-01/');
console.log(await p.evaluate(()=>[...document.querySelectorAll('a')].filter(a=>/Город-музей|Календарь/.test(a.textContent)&&a.getBoundingClientRect().height>0).map(a=>a.outerHTML.slice(0,120)+' <- '+a.parentElement.outerHTML.slice(0,200))));
await b.close();
