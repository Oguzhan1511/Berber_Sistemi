'use client';
import {useState} from 'react';
export default function LoginForm(){
  const [error,setError]=useState(''),[busy,setBusy]=useState(false);
  async function login(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();setBusy(true);setError('');
    const values=new FormData(event.currentTarget);
    try{
      const response=await fetch('/api/berber/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:values.get('username'),password:values.get('password')})});
      const result=await response.json() as {error?:string};
      if(!response.ok)throw Error(result.error||'Giriş yapılamadı.');
      window.location.assign('/berber');
    }catch(e:any){setError(e.message||'Bağlantı kurulamadı. Tekrar dene.');setBusy(false);}
  }
  return <main className="wrap section"><a href="/" className="logo">village barber.</a><section className="admin-login"><div className="eyebrow">BERBER PANELİ</div><h2>Dükkânın<br/>kontrolü sende.</h2><p>Çalışanlarını, randevularını ve hizmetlerini yönetmek için giriş yap.</p><form onSubmit={login}><label>Kullanıcı adı<input name="username" autoComplete="username" required maxLength={80} autoCapitalize="none" spellCheck={false} disabled={busy}/></label><label>Şifre<input name="password" type="password" autoComplete="current-password" required maxLength={256} disabled={busy}/></label><button className="btn" type="submit" disabled={busy}>{busy?'Giriş yapılıyor…':'Panele giriş yap ↗'}</button><p role="alert" className="error">{error}</p></form><a href="/">← Müşteri sitesine dön</a></section></main>;
}
