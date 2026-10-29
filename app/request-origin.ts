export function sameOriginRequest(request:Request){
  const origin=request.headers.get('origin');if(!origin)return false;
  try{
    const source=new URL(origin);
    if(!['http:','https:'].includes(source.protocol)||source.origin!==origin)return false;
    const url=new URL(request.url);
    return source.origin===url.origin||source.host.toLowerCase()===(request.headers.get('host')||'').toLowerCase();
  }catch{return false;}
}
