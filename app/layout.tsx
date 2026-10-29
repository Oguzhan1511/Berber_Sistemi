import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Village Berber — İyi bir kesim. Güzel bir muhabbet.',description:'Village Berber hizmetleri, fiyatları ve randevu talebi.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="tr"><head><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Oswald:wght@400;500;600;700&display=swap" rel="stylesheet"/></head><body>{children}</body></html>}
