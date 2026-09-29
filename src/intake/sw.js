import {readParcel} from './payload.js';
import {saveReceipt} from './store.js';
const BUILD = '__INTAKE_BUILD__';
const base = self.registration.scope;
const cachePrefix = `astralbridge-intake:${new URL(base).pathname}:`;
const cacheName = cachePrefix + BUILD;
const assets = ['./','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>event.waitUntil((async()=>{
  const cache=await caches.open(cacheName);
  await cache.addAll(assets.map(p=>new URL(p,base).href));
  await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  for(const key of await caches.keys()) if(key.startsWith(cachePrefix) && key!==cacheName)await caches.delete(key);
  await self.clients.claim();
})()));
async function receive(request, source) {
  try {
    const parcel=await readParcel(await request.formData(),{source,build:BUILD});
    await saveReceipt(parcel);
    return Response.redirect(new URL(`./?receipt=${encodeURIComponent(parcel.id)}`,base).href,303);
  } catch(error) {
    // Do not interpolate incoming content or platform exceptions into HTML.
    const reason=error?.name==='QuotaExceededError' ? 'Device storage is full. Nothing was saved.' : String(error?.message||'Unable to save this parcel.');
    return new Response(`Parcel not saved. ${reason}\nReturn to the sender and try again.`,{status:400,headers:{'Content-Type':'text/plain;charset=utf-8','Cache-Control':'no-store'}});
  }
}
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if (event.request.method==='POST' && (url.href===new URL('capture',base).href || url.href===new URL('probe-capture',base).href)) {
    event.respondWith(receive(event.request,url.pathname.endsWith('/probe-capture')?'synthetic-fixture':'share-endpoint; sender-unverified'));
    return;
  }
  if(event.request.method==='GET' && url.origin===new URL(base).origin && url.pathname.startsWith(new URL(base).pathname)) {
    if(event.request.mode==='navigate')event.respondWith(fetch(event.request).catch(async()=>{
      const cached=await (await caches.open(cacheName)).match(new URL('./',base).href);
      return cached||new Response('Open the intake once while online, then try again.',{status:503});
    }));
    else if(assets.slice(1).some(p=>url.href===new URL(p,base).href))event.respondWith(fetch(event.request).catch(()=>caches.match(event.request)));
  }
});
