import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const code=readFileSync(new URL('../public/site.js',import.meta.url),'utf8');
function start(mobile=true){
 const handlers={},frames=[],attrs={'aria-expanded':'true'},label={},symbol={},links=[];
 let scroll=630,collapsed=false;
 const history={state:{preserved:true},scrollRestoration:'auto',replaceState(state,title,url){this.url=url;location.hash='';}};
 const location={pathname:'/',search:'?test=1',hash:'#randevu'};
 const button={setAttribute:(k,v)=>attrs[k]=v,getAttribute:k=>attrs[k],querySelector:()=>symbol,addEventListener:(name,fn)=>handlers['button:'+name]=fn,focus(){}};
 const menu={classList:{toggle(name,v){collapsed=v;}},querySelectorAll:()=>[{addEventListener(name,fn){links.push(fn);}}]};
 const document={getElementById:id=>({'menu-toggle':button,'studio-menu':menu,'menu-label':label}[id]),addEventListener(){}};
 const window={matchMedia:()=>({matches:mobile}),scrollTo({top}){scroll=top;},addEventListener:(name,fn)=>handlers[name]=fn};
 vm.runInNewContext(code,{document,window,history,location,requestAnimationFrame:fn=>frames.push(fn)});
 return {handlers,history,location,attrs,frames,links,get scroll(){return scroll;},get collapsed(){return collapsed;},move:y=>scroll=y};
}
const mobile=start();assert.equal(mobile.scroll,0);assert.equal(mobile.history.scrollRestoration,'manual');assert.equal(mobile.history.url,'/?test=1');assert.equal(mobile.attrs['aria-expanded'],'true');
mobile.handlers.pointerdown();mobile.links[0]();mobile.move(900);mobile.handlers.load();while(mobile.frames.length)mobile.frames.shift()();assert.equal(mobile.scroll,900);assert.equal(mobile.collapsed,true);
mobile.handlers.pageshow();assert.equal(mobile.scroll,0);assert.equal(mobile.collapsed,false);
const desktop=start(false);assert.equal(desktop.scroll,630);assert.equal(desktop.location.hash,'#randevu');assert.equal(desktop.history.scrollRestoration,'auto');
console.log('Mobil giriş: eski konum/hash temizliği, kullanıcı gezinmesi, geri dönüş ve masaüstü kontrolleri geçti.');
