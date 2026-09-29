const $ = id => document.getElementById(id);
const key = 'astralbridge.crossings.v1';
const stamp = () => new Date().toISOString();
let state = {version:1, records:[], draft:'', returned:''};
try {
  const saved = JSON.parse(sessionStorage.getItem(key) || 'null');
  if (saved?.version === 1 && Array.isArray(saved.records)) state = saved;
} catch { $('storage-warning').hidden=false; $('storage-warning').textContent='Tab recovery unavailable. Save evidence before leaving.'; }
const pending = () => state.records.find(r => r.status === 'awaiting-return');
function save() {
  try { sessionStorage.setItem(key, JSON.stringify(state)); }
  catch { $('storage-warning').hidden=false; $('storage-warning').textContent='Tab recovery unavailable or full. Save evidence before leaving.'; }
}
const status = text => { $('status').textContent=text; };
function render() {
  const active = pending();
  $('outward').value = active ? active.outward : state.draft;
  $('outward').readOnly = !!active;
  $('returned').value = state.returned;
  $('return-panel').hidden = !active;
  $('step').textContent = active ? '02 · Awaiting return' : '01 · Prepare';
  $('number').textContent = `Crossing ${active?.id || state.records.length+1}`;
  $('begin').textContent = active ? 'Copy outward again' : 'Copy & begin crossing';
  controls();
  const ledger=$('ledger'); ledger.replaceChildren();
  if (!state.records.length) {const p=document.createElement('p');p.className='empty';p.textContent='No crossings yet.';ledger.append(p);}
  for (const r of [...state.records].reverse()) {
    const d=document.createElement('details'); const s=document.createElement('summary');
    s.textContent=`${String(r.id).padStart(2,'0')} · ${r.status === 'returned' ? 'Returned' : r.status === 'closed' ? 'Closed without return' : 'Awaiting return'}`;d.append(s);
    const meta=document.createElement('p');meta.textContent=`Began ${r.beganAt} · ${r.copyMethod || 'manual copy required'}${r.endedAt ? ` · Ended ${r.endedAt}` : ''}`;d.append(meta);
    for (const [title,text] of [['OUTWARD',r.outward],['RETURN',r.returned]]) {
      if (text === undefined) continue;
      const h=document.createElement('h3');h.textContent=title;const pre=document.createElement('pre');pre.textContent=text;d.append(h,pre);
    }
    ledger.append(d);
  }
}
function controls() {
  $('begin').disabled=!(pending()?.outward || state.draft).trim();
  $('finish').disabled=!state.returned.trim();
  $('export').disabled=!state.records.length;
}
$('outward').addEventListener('input',()=>{state.draft=$('outward').value;save();controls();});
$('returned').addEventListener('input',()=>{state.returned=$('returned').value;save();controls();});
$('begin').addEventListener('click',async()=>{
  let r=pending();
  if (!r) {r={id:state.records.length+1,outward:state.draft,status:'awaiting-return',beganAt:stamp(),build:globalThis.__CRUCIBLE_BUILD__};state.records.push(r);state.draft='';save();render();}
  $('begin').disabled=true;
  try {await navigator.clipboard.writeText(r.outward);r.copyMethod='clipboard';r.copiedAt=stamp();status('Copied. Switch to your AI Mode conversation, paste, and send.');}
  catch {r.copyMethod='manual';$('outward').focus();$('outward').select();status('Automatic copy unavailable. Copy the selected outward text, then paste and send it in AI Mode.');}
  save();controls();
});
$('paste').addEventListener('click',async()=>{
  const crossing=pending();
  if (!crossing) return;
  $('paste').disabled=true;
  try {const text=await navigator.clipboard.readText();if(pending() !== crossing) return;if(!text.trim()) {status('Clipboard is empty. Copy the AI Mode response first.');return;}state.returned=text;save();$('returned').value=text;controls();status('Response pasted. Check it, then record the return.');}
  catch {status('Clipboard access unavailable. Paste into the response box, then record the return.');$('returned').focus();}
  finally {$('paste').disabled=false;}
});
$('finish').addEventListener('click',()=>{
  const r=pending();if(!r || !state.returned.trim()) return;
  r.returned=state.returned;r.status='returned';r.endedAt=stamp();r.returnSource='human-supplied';state.returned='';save();render();status(`Crossing ${r.id} recorded. Write the next outward message and use the same AI Mode conversation.`);$('outward').focus();
});
$('cancel').addEventListener('click',()=>{
  const r=pending();if(!r) return;
  if (state.returned && !confirm('Close without recording this response? Its draft will be kept in the evidence.')) return;
  if(state.returned)r.unrecordedReturnDraft=state.returned;
  r.status='closed';r.endedAt=stamp();state.returned='';save();render();status('Crossing closed. Its outward text remains in the evidence.');$('outward').focus();
});
$('export').addEventListener('click',()=>{
  const url=URL.createObjectURL(new Blob([JSON.stringify({...state,exportedAt:stamp()},null,2)],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='astralbridge-crossings.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status('Evidence download requested.');
});
$('build').textContent=`build ${globalThis.__CRUCIBLE_BUILD__.slice(0,8)}`;
render();if(pending())status('Crossing restored. Continue in the same AI Mode conversation, then bring the response back.');
