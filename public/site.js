(()=>{
 const button=document.getElementById('menu-toggle'),menu=document.getElementById('studio-menu');
 if(!button||!menu)return;
 const setOpen=open=>{menu.classList.toggle('is-collapsed',!open);button.setAttribute('aria-expanded',String(open));document.getElementById('menu-label').textContent=open?'Menüyü kapat':'Menüyü aç';button.querySelector('.menu-symbol').textContent=open?'−':'+';};
 button.addEventListener('click',()=>setOpen(button.getAttribute('aria-expanded')!=='true'));
 menu.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',()=>{if(window.matchMedia('(max-width: 900px)').matches)setOpen(false);}));
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&button.getAttribute('aria-expanded')==='true'){setOpen(false);button.focus();}});
})();
