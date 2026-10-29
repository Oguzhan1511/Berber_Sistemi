import {sameOriginRequest} from '../../../request-origin';
import {cookies} from 'next/headers';
import {supabase} from '../../../store';
import {ADMIN_COOKIE,hashText,sessionCookieOptions} from '../../../admin-auth';
export async function POST(request:Request){
  if(!sameOriginRequest(request))return new Response('Geçersiz istek',{status:403});
  const jar=await cookies(),token=jar.get(ADMIN_COOKIE)?.value;
  try{
    if(token){const client=supabase();if(!client)throw Error();const {error}=await client.from('village_admin_sessions').delete().eq('token_hash',await hashText(token));if(error)throw error;}
    jar.set(ADMIN_COOKIE,'',{...sessionCookieOptions(),maxAge:0});
    return Response.redirect(new URL('/berber',request.url),303);
  }catch{return Response.json({error:'Çıkış yapılamadı. Lütfen tekrar dene.'},{status:503});}
}
