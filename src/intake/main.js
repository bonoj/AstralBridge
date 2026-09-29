import {listReceipts} from './store.js';
import {describeParcel} from './payload.js';
async function init(){
const $=id=>document.getElementById(id);
const BUILD='__INTAKE_BUILD__';
$('build').textContent=`build ${BUILD.slice(0,8)}`;
let selected,receipts=[],installEvent;
function download(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
function show(parcel){
  selected=parcel;$('receipt').hidden=false;
  $('verdict').textContent=describeParcel(parcel);
  $('provenance').textContent=`${parcel.receivedAt} · ${parcel.source} · ${(parcel.size/1024).toFixed(1)} KiB · receiver ${parcel.build.slice(0,8)}`;
  $('fields').replaceChildren();$('files').replaceChildren();
  for(const field of parcel.fields){const title=document.createElement('h3');title.textContent=field.name;const pre=document.createElement('pre');pre.textContent=field.value.length>6000?field.value.slice(0,6000)+'\n[Preview truncated; Save receipt keeps the complete field.]':field.value;$('fields').append(title,pre);}
  for(const file of parcel.files){const d=document.createElement('details');const s=document.createElement('summary');s.textContent=`${file.name} · ${file.size.toLocaleString()} bytes`;d.append(s);const pre=document.createElement('pre');pre.textContent=`Type: ${file.type||'(unspecified)'}\nField: ${file.field}\nSHA-256: ${file.sha256}`;const b=document.createElement('button');b.textContent='Download original';b.addEventListener('click',()=>download(file.blob,file.name));d.append(pre,b);$('files').append(d);}
}
async function refresh(id){
  try {receipts=await listReceipts();$('history').replaceChildren();
    if(!receipts.length){$('history').textContent='No parcels received yet.';return;}
    for(const r of receipts){const b=document.createElement('button');b.className='receipt-link';b.textContent=`${new Date(r.receivedAt).toLocaleTimeString()} · ${r.fields.length} fields · ${r.files.length} files · ${r.source==='synthetic-fixture'?'local test':'incoming'}`;b.addEventListener('click',()=>show(r));$('history').append(b);}
    const requested=receipts.find(r=>r.id===(id||new URL(location.href).searchParams.get('receipt')));
    if(requested)show(requested);
  }catch(error){$('history').textContent=`Cannot open local receipts: ${error.message}`;}
}
$('refresh').addEventListener('click',()=>refresh());
$('save').addEventListener('click',()=>{
  if(!selected)return;
  const data={...selected,files:selected.files.map(({blob,...metadata})=>metadata)};
  download(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),`astralbridge-receipt-${selected.id}.json`);
});
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installEvent=event;$('install').hidden=false;});
$('install').addEventListener('click',async()=>{if(!installEvent)return;try{await installEvent.prompt();await installEvent.userChoice;}finally{installEvent=null;$('install').hidden=true;}});
window.addEventListener('appinstalled',()=>{$('install-help').textContent='Installed. Select response text in AI Mode, then choose Share → AstralBridge Intake.';});
function ready(){
  if(!navigator.serviceWorker.controller)return;
  $('ready').textContent='Receiver ready. Incoming shares will be saved before this page opens.';
  for(const id of ['text-fixture','link-fixture','mixed-fixture'])$(id).disabled=false;
}
try{
  if(!('serviceWorker' in navigator))throw new Error('This browser cannot install a share receiver.');
  navigator.serviceWorker.addEventListener('controllerchange',ready);
  await navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'});
  await navigator.serviceWorker.ready;ready();
}catch(error){$('ready').textContent=`Receiver unavailable: ${error.message}`;}
await refresh();
async function fixture(kind){
  $('test-result').textContent='Sending local fixture…';
  const form=new FormData();
  if(kind==='link'){form.append('text','https://example.com/shared-thread');}
  else {form.append('title','Local synthetic fixture');form.append('text',kind==='mixed'?'فارسی 🧭\n  exact spacing  \n'.repeat(12000):'  Selected response fixture\nفارسی 🧭\n<script>inert text</script>  ');}
  if(kind==='mixed'){
    form.append('files',new File(['{"probe":true,"value":17}\n'],'data.json',{type:'application/json'}));
    form.append('files',new File(['<!doctype html><script>throw Error("must stay inert")</script>'],'artifact.html',{type:'text/html'}));
    for(const path of ['icon-192.png','fixture.zip']){const response=await fetch(`./${path}`);if(!response.ok)throw Error(`Missing fixture ${path}`);form.append('files',new File([await response.blob()],path,{type:path.endsWith('.zip')?'application/zip':'image/png'}));}
  }
  const response=await fetch('./probe-capture',{method:'POST',body:form});
  if(!response.ok)throw Error(await response.text());
  const id=new URL(response.url).searchParams.get('receipt');
  await refresh(id);
  const actual=receipts.find(r=>r.id===id);
  if(!actual)throw Error('Receipt missing after successful handoff.');
  const fields=[...form.entries()].filter(([,v])=>typeof v==='string').map(([name,value])=>({name,value}));
  if(JSON.stringify(fields)!==JSON.stringify(actual.fields))throw Error('Text fields changed in transit.');
  const original=[...form.values()].filter(v=>typeof v!=='string');
  for(let i=0;i<original.length;i++){
    const bytes=new Uint8Array(await original[i].arrayBuffer()),saved=new Uint8Array(await actual.files[i].blob.arrayBuffer());
    if(bytes.length!==saved.length || !bytes.every((b,j)=>b===saved[j]))throw Error('File bytes changed in transit.');
  }
  $('test-result').textContent=`PASS · ${actual.fields.length} exact fields, ${actual.files.length} byte-identical files · synthetic, not an Android share.`;
}
for(const kind of ['text','link','mixed'])$(`${kind}-fixture`).addEventListener('click',()=>fixture(kind).catch(e=>{$('test-result').textContent=`FAIL · ${e.message}`;}));

}
init().catch(error=>{document.getElementById("ready").textContent=`Receiver failed: ${error.message}`;});
