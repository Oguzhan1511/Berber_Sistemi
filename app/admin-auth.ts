import {cookies} from 'next/headers';
import {env} from 'cloudflare:workers';
import {supabase} from './store';

export const ADMIN_COOKIE='village_admin';
export const SESSION_SECONDS=8*60*60;
const encode=(bytes:Uint8Array)=>Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
export const hashText=async(value:string)=>encode(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))));
export function adminCredentials(){
  const vars=env as any;
  return {username:String(vars.BARBER_ADMIN_USERNAME||''),passwordHash:String(vars.BARBER_ADMIN_PASSWORD_HASH||'')};
}
export function adminLoginConfigured(){const c=adminCredentials();return !!(c.username&&c.passwordHash);}
export async function validPassword(password:string){
  const [algorithm,rounds,salt,expected]=adminCredentials().passwordHash.split(':');
  if(algorithm!=='pbkdf2-sha256'||Number(rounds)!==600000||!/^[a-f0-9]{32}$/.test(salt)||!/^[a-f0-9]{64}$/.test(expected))return false;
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
  const actual=encode(new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',iterations:600000,salt:new TextEncoder().encode(salt)},key,256)));
  let different=0;for(let i=0;i<expected.length;i++)different|=expected.charCodeAt(i)^actual.charCodeAt(i);
  return different===0;
}
export async function currentAdmin(){
  if(!adminLoginConfigured())return false;
  const token=(await cookies()).get(ADMIN_COOKIE)?.value;
  if(!token||!/^[a-f0-9]{64}$/.test(token))return false;
  const client=supabase();if(!client)return false;
  const credentials=adminCredentials();
  const {data,error}=await client.from('village_admin_sessions').select('username,credential_version').eq('token_hash',await hashText(token)).gt('expires_at',new Date().toISOString()).maybeSingle();
  return !error&&data?.username===credentials.username&&data?.credential_version===await hashText(credentials.passwordHash);
}
export async function createAdminSession(){
  const client=supabase();if(!client)throw Error('Giriş hizmeti kullanılamıyor.');
  const token=encode(crypto.getRandomValues(new Uint8Array(32)));
  const c=adminCredentials();
  const {error}=await client.from('village_admin_sessions').insert({token_hash:await hashText(token),username:c.username,credential_version:await hashText(c.passwordHash),expires_at:new Date(Date.now()+SESSION_SECONDS*1000).toISOString()});
  if(error)throw Error('Oturum oluşturulamadı.');
  return token;
}
export async function consumeLoginAttempt(request:Request){
  const client=supabase();if(!client)throw Error('Giriş hizmeti kullanılamıyor.');
  const ip=(request.headers.get('x-vercel-forwarded-for')||request.headers.get('x-forwarded-for')||'local').split(',')[0].trim();
  const key=await hashText(adminCredentials().passwordHash+'|'+ip);
  const {data,error}=await client.rpc('village_consume_login_attempt',{p_key:key});
  if(error)throw Error('Giriş hizmeti kullanılamıyor.');
  return data===true;
}
export function sessionCookieOptions(){return {httpOnly:true,secure:!!process.env.VERCEL||process.env.NODE_ENV==='production',sameSite:'lax' as const,path:'/',maxAge:SESSION_SECONDS};}
