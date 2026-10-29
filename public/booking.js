// Set only to the business's confirmed international WhatsApp number, digits only.
let BUSINESS_WHATSAPP = '';
async function initialize(config){
BUSINESS_WHATSAPP=config.whatsapp;
if(/^[1-9]\d{9,14}$/.test(BUSINESS_WHATSAPP)){
 const url='https://wa.me/'+BUSINESS_WHATSAPP+'?text='+encodeURIComponent('Merhaba Village Barber! Bilgi almak istiyorum.');
 for(const selector of ['#whatsapp-contact','#contact-whatsapp']){const link=document.querySelector(selector);if(link){link.href=url;link.hidden=false;}}
}
const $ = s => document.querySelector(s);
const SERVICES = config.services;
const EMPLOYEES = (config.employees||[]).filter(employee=>employee.active);
const selectedEmployee=()=>EMPLOYEES.find(employee=>employee.id===$('#employee').value);
EMPLOYEES.forEach(employee=>{const option=document.createElement('option');option.value=employee.id;option.textContent=employee.name+(employee.title?' · '+employee.title:'');$('#employee').append(option);});
if(!EMPLOYEES.length){$('#employee').disabled=true;$('#employee-help').textContent='Henüz randevuya açık berber bulunmuyor.';$('#form button[type=submit]').disabled=true;}
const employeeCards=document.createElement('div');employeeCards.className='employee-options';employeeCards.setAttribute('role','group');employeeCards.setAttribute('aria-label','Berberini seç');
const employeeButtons=[];
for(const employee of EMPLOYEES){
 const button=document.createElement('button');button.type='button';button.className='employee-option';button.setAttribute('aria-pressed','false');
 if(employee.photoUrl){const image=document.createElement('img');image.src=employee.photoUrl;image.alt='';image.className='employee-avatar';image.loading='lazy';button.append(image);}else{const placeholder=document.createElement('span');placeholder.className='employee-avatar employee-avatar-empty';placeholder.textContent='✂';placeholder.setAttribute('aria-hidden','true');button.append(placeholder);}
 const text=document.createElement('span');text.textContent=employee.name;const title=document.createElement('small');title.textContent=employee.title||'Berber';text.append(title);button.append(text);
 button.onclick=()=>{$('#employee').value=employee.id;$('#employee').dispatchEvent(new Event('change'));};employeeCards.append(button);employeeButtons.push([employee.id,button]);
}
$('#employee').closest('label').after(employeeCards);
$('#employee').addEventListener('change',()=>{for(const [id,button] of employeeButtons)button.setAttribute('aria-pressed',String(id===$('#employee').value));updateSummary();renderTimes();$('#error').textContent='';});
const priceLabel = service => service.price === null ? 'Fiyat bilgisi yakında' : new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',maximumFractionDigits:0}).format(service.price);
const selectedService = () => SERVICES.find(service=>service.name===$('#service').value);
function updateSummary(){const service=selectedService();$('#service-summary').textContent=`${service.name} · Randevu süresi ${config.interval} dk. · ${priceLabel(service)}${selectedEmployee()?' · Berber: '+selectedEmployee().name:''}`;}
SERVICES.forEach((service,index)=>{
 const option=document.createElement('option');option.value=service.name;option.textContent=`${service.name} — ${priceLabel(service)}`;$('#service').append(option);
 const card=document.createElement('article');card.className='service';
 const number=document.createElement('span');number.className='num';number.textContent=`${String(index+1).padStart(2,'0')} / VILLAGE` ;
 const title=document.createElement('h3');title.textContent=service.name;
 const description=document.createElement('p');description.textContent=service.description;
 const price=document.createElement('div');price.className='service-price'+(service.price===null?' pending':'');price.textContent=priceLabel(service);
 const foot=document.createElement('div');foot.className='service-foot';const duration=document.createElement('span');duration.textContent=`Randevu süresi ${config.interval} dk.`;
 const link=document.createElement('a');link.href='#randevu';link.textContent='Randevu al ↗';link.setAttribute('aria-label',service.name+' için randevu al');link.onclick=()=>{$('#service').value=service.name;updateSummary();renderTimes();};foot.append(duration,link);card.append(number,title,description,price,foot);$('#service-list').append(card);
});
$('#service').addEventListener('change',()=>{updateSummary();renderTimes();});updateSummary();
const note=document.querySelector('#hizmetler .note');note.textContent=SERVICES.some(s=>s.price===null)?'Bazı hizmetlerin fiyatları henüz belirlenmedi.':'Fiyatlar Türk lirasıdır. Süreler yaklaşık uygulama süresidir.';
const contact=document.querySelector('#iletisim p');contact.replaceChildren();const address=document.createElement('span');address.textContent=config.address||'Adres bilgisi henüz eklenmedi.';contact.append(address,document.createElement('br'));const hours=document.createElement('span');hours.textContent=config.hoursConfigured?'Çalışma saatlerine göre randevu talebi oluşturabilirsin.':'Çalışma saatleri henüz belirlenmedi.';contact.append(hours);
const dateInput = $('#date');
const localDate = new Intl.DateTimeFormat('en-CA', {timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
dateInput.min=localDate;dateInput.value=localDate;
$('#year').textContent=new Date().getFullYear();
let selectedTime='',pending=false,lastPayload='',requestId='';
let timesRequest=0;
async function renderTimes(preserveSelection=false){
 const previous=preserveSelection===true?selectedTime:'';
 const version=++timesRequest;
 selectedTime='';$('.times').replaceChildren();
 if(!dateInput.value){$('.times').textContent='Uygun saatleri görmek için tarih seç.';return;}
 if(!selectedEmployee()){$('.times').textContent='Uygun saatleri görmek için berberini seç.';return;}
 $('.times').textContent='Uygun saatler yükleniyor…';$('.times').setAttribute('aria-busy','true');
 try{
  const params=new URLSearchParams({date:dateInput.value,employeeId:selectedEmployee().id,service:selectedService().name});
  const response=await fetch('/api/availability?'+params,{cache:'no-store'});
  const result=await response.json();
  if(version!==timesRequest)return;
  if(!response.ok)throw Error(result.error||'Saatler yüklenemedi.');
  $('.times').replaceChildren();
  for(const time of result.times){
   const b=document.createElement('button');b.type='button';b.className='time';b.textContent=time;b.setAttribute('aria-pressed','false');
   b.onclick=()=>{selectedTime=time;document.querySelectorAll('.time').forEach(t=>t.setAttribute('aria-pressed',String(t===b)));$('#error').textContent='';};$('.times').append(b);if(time===previous){selectedTime=time;b.setAttribute('aria-pressed','true');}
  }
  if(!result.times.length)$('.times').textContent='Bu tarihte uygun saat kalmadı veya işletme kapalı. Başka bir tarih ya da berber seçebilirsin.';
 }catch(error){if(version===timesRequest){$('.times').textContent=error.message||'Saatler yüklenemedi.';const retry=document.createElement('button');retry.type='button';retry.className='time';retry.textContent='Tekrar dene';retry.onclick=renderTimes;$('.times').append(retry);}}
 finally{if(version===timesRequest)$('.times').setAttribute('aria-busy','false');}
}
renderTimes();dateInput.addEventListener('change',renderTimes);window.addEventListener('focus',()=>renderTimes(true));setInterval(()=>{if(!document.hidden&&!pending&&dateInput.value&&selectedEmployee())renderTimes(true);},60000);

$('#form').addEventListener('submit',async e=>{e.preventDefault();if(pending)return;if(!selectedEmployee()){$('#error').textContent='Lütfen berberini seç.';return;}if(dateInput.value<localDate){$('#error').textContent='Lütfen bugünü veya gelecek bir tarihi seç.';return;}if(!selectedTime){$('#error').textContent='Devam etmek için bir saat seç.';return;}const payload={name:$('#name').value.trim(),phone:$('#phone').value.trim(),service:$('#service').value,employeeId:selectedEmployee().id,date:dateInput.value,time:selectedTime,note:$('#note').value.trim()};const fingerprint=JSON.stringify(payload);if(fingerprint!==lastPayload){requestId=crypto.randomUUID();lastPayload=fingerprint;}const button=$('#form button[type=submit]');pending=true;button.disabled=true;button.textContent='Talebin kaydediliyor…';$('#error').textContent='';try{const response=await fetch('/api/appointments',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:requestId,...payload})});const result=await response.json();if(!response.ok){if(response.status===409)renderTimes();throw Error(result.error||'Randevu kaydedilemedi.');}renderTimes();const date=new Date(payload.date+'T12:00:00').toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric'});$('#summary').textContent=`${payload.service} · Berber: ${selectedEmployee().name} · ${date} · ${payload.time} · Talep no: ${result.id}`;$('#whatsapp-link').href=result.whatsappUrl;$('#setup').showModal();window.location.assign(result.whatsappUrl);}catch(error){$('#error').textContent=error.message||'Bağlantı kurulamadı. Tekrar deneyebilirsin.';}finally{pending=false;button.disabled=!EMPLOYEES.length;button.innerHTML='Randevu oluştur <span>↗</span>';}});
$('#close').onclick=()=>$('#setup').close();

}
fetch('/api/settings',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error();return r.json();}).then(initialize).catch(()=>{document.querySelector('#error').textContent='Hizmetler yüklenemedi. Lütfen sayfayı yenile.';document.querySelector('#form button[type=submit]').disabled=true;});
