import {sameOriginRequest} from '../../../request-origin';
import {cookies} from 'next/headers';
import {ADMIN_COOKIE,adminCredentials,adminLoginConfigured,consumeLoginAttempt,validPassword,createAdminSession,sessionCookieOptions} from '../../../admin-auth';
export const runtime='nodejs';
const json=(data:any,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function POST(request:Request){
  if(!sameOriginRequest(request))return json({error:'Geçersiz istek kaynağı.'},403);
  if(!request.headers.get('content-type')?.includes('application/json'))return json({error:'Geçersiz giriş isteği.'},415);
  if(Number(request.headers.get('content-length')||0)>4096)return json({error:'Giriş bilgileri çok uzun.'},413);
  try{
    if(!adminLoginConfigured())return json({error:'Yönetici girişi henüz yapılandırılmadı.'},503);
    const raw=await request.text();if(raw.length>4096)return json({error:'Giriş bilgileri çok uzun.'},413);
    let input;try{input=JSON.parse(raw);}catch{return json({error:'Giriş bilgilerini kontrol et.'},400);}
    if(!input||typeof input.username!=='string'||typeof input.password!=='string'||input.username.length>80||input.password.length>256)return json({error:'Giriş bilgilerini kontrol et.'},400);
    if(!await consumeLoginAttempt(request))return json({error:'Çok fazla giriş denemesi yaptın. 15 dakika sonra tekrar dene.'},429);
    const passwordValid=await validPassword(input.password);
    if(input.username.trim()!==adminCredentials().username||!passwordValid)return json({error:'Kullanıcı adı veya şifre hatalı.'},401);
    const token=await createAdminSession();
    (await cookies()).set(ADMIN_COOKIE,token,sessionCookieOptions());
    return json({ok:true});
  }catch{return json({error:'Giriş şu anda yapılamıyor. Lütfen tekrar dene.'},503);}
}
