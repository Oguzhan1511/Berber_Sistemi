import {getPhoto} from '../../../store';
export const dynamic='force-dynamic';
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  if(!/^[0-9a-f-]{36}$/i.test(id))return new Response('Fotoğraf bulunamadı',{status:404});
  try{
    const object=await getPhoto('employees/'+id);
    if(!object)return new Response('Fotoğraf bulunamadı',{status:404});
    return new Response(object.body,{headers:{'Content-Type':object.type,'Cache-Control':'public, max-age=31536000, immutable','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'"}});
  }catch{return new Response('Fotoğraf yüklenemedi',{status:503});}
}
