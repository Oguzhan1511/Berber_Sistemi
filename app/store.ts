import {env} from 'cloudflare:workers';
import {createClient} from '@supabase/supabase-js';

// Imported by server routes only. Never expose this key through NEXT_PUBLIC_*.
export function supabase(){
  const vars=env as any;
  const key=vars.SUPABASE_SECRET_KEY;
  if(!key)return null;
  const url=vars.SUPABASE_URL;
  if(!url||!key.startsWith('sb_secret_'))throw Error('Supabase sunucu ayarlarını kontrol et.');
  return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
}
export async function getStoredSettings(){
  const client=supabase();
  if(!client)return env.DB!.prepare('SELECT payload,revision FROM shop_settings WHERE id=?').bind('village').first<{payload:string,revision:number}>().then(row=>row?{payload:JSON.parse(row.payload),revision:row.revision}:null);
  const {data,error}=await client.from('village_shop_settings').select('payload,revision').eq('id','village').maybeSingle();if(error)throw error;return data;
}
export async function saveStoredSettings(payload:any,revision:number){
  const client=supabase();
  if(!client){const r=await env.DB!.prepare('INSERT INTO shop_settings (id,payload,revision) VALUES (?, ?, 1) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload,revision=shop_settings.revision+1 WHERE shop_settings.revision=?').bind('village',JSON.stringify(payload),revision).run();return !!r.meta.changes;}
  const {data,error}=await client.rpc('village_save_settings',{p_payload:payload,p_revision:revision});if(error)throw error;return data===true;
}
export async function appointmentRows(date?:string,employeeId?:string):Promise<any[]>{
  const client=supabase();
  if(!client){const statement=date&&employeeId?env.DB!.prepare("SELECT id,request_payload,details,created_at FROM appointments WHERE json_extract(details,'$.date')=? AND json_extract(details,'$.employeeId')=? ORDER BY created_at DESC").bind(date,employeeId):env.DB!.prepare('SELECT id,request_payload,details,created_at FROM appointments ORDER BY created_at DESC');const r=await statement.all<any>();return r.results.map(row=>({...row,details:JSON.parse(row.details)}));}
  const rows:any[]=[];
  for(let offset=0;;offset+=1000){
    let query=client.from('village_appointments').select('id,request_payload,details,created_at').order('created_at',{ascending:false}).order('id').range(offset,offset+999);
    if(date)query=query.eq('booking_date',date);if(employeeId)query=query.eq('employee_id',employeeId);
    const {data,error}=await query;if(error)throw error;rows.push(...data);if(data.length<1000)return rows;
  }
}
export async function findAppointment(id:string){
  const client=supabase();
  if(!client){const row=await env.DB!.prepare('SELECT request_payload,details FROM appointments WHERE id=?').bind(id).first<any>();return row?{...row,details:JSON.parse(row.details)}:null;}
  const {data,error}=await client.from('village_appointments').select('request_payload,details').eq('id',id).maybeSingle();if(error)throw error;return data;
}
export async function insertAppointment(appointment:any,payload:string){
  const client=supabase();
  if(client){const {error}=await client.from('village_appointments').insert({id:appointment.id,request_payload:payload,details:appointment,created_at:appointment.createdAt});if(error){if(['23505','23P01'].includes(error.code))return false;throw error;}return true;}
  const start=Number(appointment.time.slice(0,2))*60+Number(appointment.time.slice(3));
  const r=await env.DB!.prepare(`INSERT INTO appointments(id,request_payload,details,created_at) SELECT ?,?,?,? WHERE NOT EXISTS (
    SELECT 1 FROM appointments WHERE json_extract(details,'$.date')=? AND json_extract(details,'$.employeeId')=?
    AND (CAST(substr(json_extract(details,'$.time'),1,2) AS INTEGER)*60+CAST(substr(json_extract(details,'$.time'),4,2) AS INTEGER)) < ?
    AND (CAST(substr(json_extract(details,'$.time'),1,2) AS INTEGER)*60+CAST(substr(json_extract(details,'$.time'),4,2) AS INTEGER)+json_extract(details,'$.minutes')) > ?
  ) ON CONFLICT(id) DO NOTHING`).bind(appointment.id,payload,JSON.stringify(appointment),appointment.createdAt,appointment.date,appointment.employeeId,start+appointment.minutes,start).run();return !!r.meta.changes;
}
export async function galleryRows(){
  const client=supabase();if(!client){const r=await env.DB!.prepare('SELECT id,object_key,caption,created_at FROM gallery_photos ORDER BY created_at DESC,id DESC').all<any>();return r.results;}
  const {data,error}=await client.from('village_gallery_photos').select('*').order('created_at',{ascending:false}).order('id',{ascending:false});if(error)throw error;return data;
}
export async function findPhoto(id:string){
  const client=supabase();if(!client)return env.DB!.prepare('SELECT object_key FROM gallery_photos WHERE id=?').bind(id).first<{object_key:string}>();
  const {data,error}=await client.from('village_gallery_photos').select('object_key').eq('id',id).maybeSingle();if(error)throw error;return data;
}
export async function addPhoto(id:string,key:string,caption:string,created:number){
  const client=supabase();if(!client){const r=await env.DB!.prepare('INSERT INTO gallery_photos (id,object_key,caption,created_at) SELECT ?,?,?,? WHERE (SELECT COUNT(*) FROM gallery_photos)<30').bind(id,key,caption,created).run();return !!r.meta.changes;}
  const {data,error}=await client.rpc('village_add_gallery_photo',{p_id:id,p_key:key,p_caption:caption,p_created:created});if(error)throw error;return data===true;
}
export async function deletePhoto(id:string){
  const client=supabase();if(!client){await env.DB!.prepare('DELETE FROM gallery_photos WHERE id=?').bind(id).run();return;}
  const {error}=await client.from('village_gallery_photos').delete().eq('id',id);if(error)throw error;
}
export function photoStorageReady(){return !!supabase()||!!env.BUCKET;}
export async function putPhoto(key:string,bytes:Uint8Array,type:string){
  const client=supabase();if(!client){await env.BUCKET!.put(key,bytes,{httpMetadata:{contentType:type}});return;}
  const {error}=await client.storage.from('village-photos').upload(key,bytes,{contentType:type,upsert:false});if(error)throw error;
}
export async function getPhoto(key:string){
  const client=supabase();if(!client){const object=await env.BUCKET!.get(key);return object?{body:object.body,type:object.httpMetadata?.contentType||'image/jpeg'}:null;}
  const {data,error}=await client.storage.from('village-photos').download(key);if(error){if(String((error as any).status)==='404'||error.message.toLowerCase().includes('not found'))return null;throw error;}return {body:data,type:data.type||'image/jpeg'};
}
export async function removePhoto(key:string){
  const client=supabase();if(!client){await env.BUCKET!.delete(key);return;}
  const {error}=await client.storage.from('village-photos').remove([key]);if(error)throw error;
}
