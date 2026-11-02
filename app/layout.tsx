import Script from 'next/script';
import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Burak Öztürk Hair Studio — İyi bir kesim. Güzel bir muhabbet.',description:'Burak Öztürk Hair Studio hizmetleri, fiyatları ve randevu talebi.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="tr"><head><Script id="studio-mobile-entry" strategy="beforeInteractive">{`if(location.pathname==='/'&&matchMedia('(max-width: 900px)').matches){history.scrollRestoration='manual';if(location.hash)history.replaceState(history.state,'',location.pathname+location.search);window.scrollTo({top:0,left:0,behavior:'instant'});}`}</Script><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Oswald:wght@400;500;600;700&display=swap" rel="stylesheet"/></head><body>{children}</body></html>}
