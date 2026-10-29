import {appointmentRows} from '../../store';
import {readSettings} from '../../settings';
import {availableTimes} from '../../availability';
export const dynamic='force-dynamic';
export async function GET(request:Request){
  const params=new URL(request.url).searchParams;
  const date=params.get('date')||'',employeeId=params.get('employeeId')||'',service=params.get('service')||'';
  const json=(data:any,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date+'T12:00:00Z'))||new Date(date+'T12:00:00Z').toISOString().slice(0,10)!==date||employeeId.length>80||service.length>80)return json({error:'Geçerli bir tarih, hizmet ve berber seç.'},400);
  try{
    const config=await readSettings();
    const rows=await appointmentRows(date,employeeId);
    return json({times:availableTimes(config,date,employeeId,service,rows.map(row=>row.details)),interval:config.interval});
  }catch{return json({error:'Uygun saatler yüklenemedi. Lütfen tekrar dene.'},503);}
}
