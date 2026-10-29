import LoginForm from './login-form';
import {adminLoginConfigured} from '../admin-auth';
import {requireChatGPTUser} from '../chatgpt-auth';
import {admin,readSettings} from '../settings';
import Panel from './panel';
import {listAppointments} from '../appointments';
import AppointmentList from './appointment-list';
import {listPhotos} from '../gallery';
import GalleryPanel from './gallery-panel';
export const dynamic='force-dynamic';
export default async function Berber(){
  if(adminLoginConfigured()||process.env.VERCEL){if(!await admin())return <LoginForm/>;}
  else{await requireChatGPTUser('/berber');if(!await admin())return <LoginForm/>;}
  const [settings,appointments,photos]=await Promise.all([readSettings(),listAppointments(),listPhotos()]);
  return <><Panel initial={settings}/><div className="wrap admin"><AppointmentList initial={appointments} employees={settings.employees}/><GalleryPanel initial={photos}/></div></>;
}
