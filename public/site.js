(()=>{
 const button=document.getElementById('menu-toggle'),menu=document.getElementById('studio-menu');
 if(!button||!menu)return;
 const mobile=window.matchMedia('(max-width: 900px)');
 let interacted=false;
 const setOpen=open=>{menu.classList.toggle('is-collapsed',!open);button.setAttribute('aria-expanded',String(open));document.getElementById('menu-label').textContent=open?'Menüyü kapat':'Menüyü aç';button.querySelector('.menu-symbol').textContent=open?'−':'+';};
 const openAtTop=()=>{
  if(!mobile.matches||interacted)return;
  history.scrollRestoration='manual';
  if(location.hash)history.replaceState(history.state,'',location.pathname+location.search);
  setOpen(true);
  window.scrollTo({top:0,left:0,behavior:'instant'});
 };
 // Only restore the landing position during document entry. Once a visitor
 // touches, scrolls or uses the keyboard, normal section navigation takes over.
 for(const event of ['pointerdown','touchstart','wheel','keydown'])window.addEventListener(event,()=>{interacted=true;},{passive:true});
 openAtTop();
 requestAnimationFrame(()=>requestAnimationFrame(openAtTop));
 window.addEventListener('load',openAtTop,{once:true});
 window.addEventListener('pageshow',()=>{interacted=false;openAtTop();requestAnimationFrame(openAtTop);});
 button.addEventListener('click',()=>setOpen(button.getAttribute('aria-expanded')!=='true'));
 menu.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',()=>{if(mobile.matches)setOpen(false);}));
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&button.getAttribute('aria-expanded')==='true'){setOpen(false);button.focus();}});
})();
