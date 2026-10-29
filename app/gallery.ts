import {galleryRows} from './store';
export type Photo={id:string,caption:string,createdAt:number};
export async function listPhotos():Promise<Photo[]>{return (await galleryRows()).map(row=>({id:row.id,caption:row.caption,createdAt:row.created_at}));}
export const photoUrl=(id:string)=>'/photos/'+encodeURIComponent(id);
export function imageType(bytes:Uint8Array):string|null{if(bytes.length<12)return null;if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return 'image/jpeg';if([137,80,78,71,13,10,26,10].every((n,i)=>bytes[i]===n))return 'image/png';if(String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP')return 'image/webp';return null;}
