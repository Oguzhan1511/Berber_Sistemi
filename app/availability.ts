export const toMinutes=(time:string)=>Number(time.slice(0,2))*60+Number(time.slice(3));
const formatTime=(value:number)=>`${String(Math.floor(value/60)).padStart(2,'0')}:${String(value%60).padStart(2,'0')}`;
export function availableTimes(config:any,date:string,employeeId:string,serviceName:string,bookings:any[],now=new Date()){
  const service=config.services.find((item:any)=>item.name===serviceName);
  const employee=config.employees.find((item:any)=>item.id===employeeId&&item.active);
  const day=config.days[new Date(date+'T12:00:00Z').getUTCDay()];
  if(!service||!employee||!config.hoursConfigured||!day?.open||config.closedDates.includes(date))return [];
  const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
  if(date<today)return [];
  const current=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Istanbul',hour:'2-digit',minute:'2-digit',hour12:false}).format(now);
  const duration=config.interval;
  const opening=toMinutes(day.start),closing=toMinutes(day.end);
  const occupied=bookings.filter(b=>b.date===date&&b.employeeId===employeeId).map(b=>({start:toMinutes(b.time),end:toMinutes(b.time)+b.minutes})).sort((a,b)=>a.start-b.start);
  const times:string[]=[];
  let cursor=opening;
  // Restart the cadence after each reservation, so an 11:00–11:40
  // booking makes 11:40 available even on a grid starting at 10:00.
  for(const booking of [...occupied,{start:closing,end:closing}]){
    const end=Math.min(booking.start,closing);
    for(let start=cursor;start+duration<=end;start+=config.interval){
      const time=formatTime(start);
      if(date!==today||time>current)times.push(time);
    }
    cursor=Math.max(cursor,booking.end);
    if(cursor>=closing)break;
  }
  return times;
}
