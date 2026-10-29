import {sameOriginRequest} from '../../../request-origin';
import {findPhoto,deletePhoto,removePhoto} from '../../../store';
import {admin} from '../../../settings';
export const dynamic='force-dynamic';
export async function DELETE(request:Request,{params}:{params:Promise<{id:string}>}){if(!await admin())return Response.json({error:'Bu işlem için berber yetkisi gerekiyor.'},{status:403});if(!sameOriginRequest(request))return Response.json({error:'Geçersiz istek kaynağı.'},{status:403});const {id}=await params;try{const row=await findPhoto(id);if(!row)return Response.json({error:'Fotoğraf bulunamadı.'},{status:404});await deletePhoto(id);await removePhoto(row.object_key);return Response.json({ok:true});}catch{return Response.json({error:'Fotoğraf kaldırılamadı. Sayfayı yenileyip tekrar dene.'},{status:503});}}
