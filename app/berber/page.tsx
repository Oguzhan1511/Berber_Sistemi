import {requireChatGPTUser,chatGPTSignOutPath} from '../chatgpt-auth';
import {admin,readSettings} from '../settings';
import Panel from './panel';
import {listAppointments} from '../appointments';
import AppointmentList from './appointment-list';
import {listPhotos} from '../gallery';
import GalleryPanel from './gallery-panel';
export const dynamic='force-dynamic';
export default async function Berber(){await requireChatGPTUser('/berber');if(!await admin())return <main className="wrap section"><a href="/" className="logo">village barber.</a><h2>Berber girişi</h2><p>Bu hesap yönetici olarak yetkilendirilmemiş. İşletme sahibi hesabıyla giriş yap.</p><a className="btn" target="_top" href={chatGPTSignOutPath('/berber')}>Hesap değiştir ↗</a></main>;return <><Panel initial={await readSettings()}/><div className="wrap admin"><AppointmentList initial={await listAppointments()} employees={(await readSettings()).employees}/><GalleryPanel initial={await listPhotos()}/></div></>;}
