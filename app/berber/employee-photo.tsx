'use client';
import {useState} from 'react';
export default function EmployeePhoto({name,url,onChange,onBusy}:{name:string,url?:string,onChange:(url:string)=>void,onBusy:(busy:boolean)=>void}){
  const [error,setError]=useState('');
  async function upload(file:File){
    setError('');
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)){setError('JPG, PNG veya WebP fotoğraf seç.');return;}
    if(file.size>8*1024*1024){setError('Fotoğraf en fazla 8 MB olabilir.');return;}
    onBusy(true);
    try{
      const form=new FormData();form.append('photo',file);
      const response=await fetch('/api/employee-photos',{method:'POST',body:form});
      const result=await response.json() as {error?:string,photoUrl:string};
      if(!response.ok)throw Error(result.error||'Fotoğraf yüklenemedi.');
      onChange(result.photoUrl);
    }catch(e:any){setError(e.message||'Fotoğraf yüklenemedi. Tekrar dene.');}
    finally{onBusy(false);}
  }
  return <div className="employee-photo-editor">
    {url?<img className="employee-avatar" src={url} alt={(name||'Berber')+' fotoğrafı'}/>:<span className="employee-avatar employee-avatar-empty" aria-hidden="true">✂</span>}
    <label>Çalışan fotoğrafı<input type="file" accept="image/jpeg,image/png,image/webp" onChange={event=>{const file=event.currentTarget.files?.[0];event.currentTarget.value='';if(file)void upload(file);}}/><small>JPG, PNG veya WebP · En fazla 8 MB. Fotoğrafı seçtikten sonra değişiklikleri kaydet.</small></label>
    {url&&<button type="button" className="remove" onClick={()=>onChange('')}>Fotoğrafı kaldır</button>}
    {error&&<p role="alert">{error}</p>}
  </div>;
}
