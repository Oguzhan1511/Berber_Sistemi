'use client';
import {useEffect,useRef,useState} from 'react';

const links=[['yonetim-hizmetler','Hizmetler','✂'],['yonetim-calisanlar','Çalışanlar','♙'],['yonetim-saatler','Randevu saatleri','◷'],['randevu-talepleri','Randevular','▦'],['yonetim-iletisim','İletişim','↗'],['yonetim-vitrin','Vitrin','▧']];

export default function AdminNav(){
  const [active,setActive]=useState('yonetim-hizmetler');
  const navigationTarget=useRef<string|null>(null);

  useEffect(()=>{
    const syncScroll=()=>{
      // Keep the clicked destination selected throughout anchor scrolling,
      // including sections that cannot reach the top near the page's end.
      if(navigationTarget.current)return;
      let id=links[0][0];
      let nearestTop=-Infinity;
      for(const [key] of links){
        const section=document.getElementById(key);
        if(!section)continue;
        const top=section.getBoundingClientRect().top;
        if(top<=150&&top>nearestTop){nearestTop=top;id=key;}
      }
      setActive(id);
    };
    const syncHash=()=>{
      const id=window.location.hash.slice(1);
      if(links.some(([key])=>key===id)){
        navigationTarget.current=id;
        setActive(id);
      }else{
        navigationTarget.current=null;
        syncScroll();
      }
    };
    const resumeScrollTracking=()=>{navigationTarget.current=null;};
    const onKeyDown=(event:KeyboardEvent)=>{
      const target=event.target;
      if(target instanceof HTMLElement&&target.closest('input,textarea,select,[contenteditable="true"]'))return;
      if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(event.key))resumeScrollTracking();
    };
    syncHash();
    window.addEventListener('scroll',syncScroll,{passive:true});
    window.addEventListener('hashchange',syncHash);
    window.addEventListener('wheel',resumeScrollTracking,{passive:true});
    window.addEventListener('touchstart',resumeScrollTracking,{passive:true});
    window.addEventListener('pointerdown',resumeScrollTracking,{passive:true});
    window.addEventListener('keydown',onKeyDown);
    return()=>{
      window.removeEventListener('scroll',syncScroll);
      window.removeEventListener('hashchange',syncHash);
      window.removeEventListener('wheel',resumeScrollTracking);
      window.removeEventListener('touchstart',resumeScrollTracking);
      window.removeEventListener('pointerdown',resumeScrollTracking);
      window.removeEventListener('keydown',onKeyDown);
    };
  },[]);

  return <nav className="admin-dock" aria-label="Berber paneli bölümleri"><div className="admin-dock-track">{links.map(([id,label,icon])=><a key={id} href={'#'+id} className={active===id?'is-active':''} aria-current={active===id?'location':undefined} onClick={()=>{navigationTarget.current=id;setActive(id);}}><span className="dock-icon" aria-hidden="true">{icon}</span>{label}</a>)}</div></nav>;
}
