import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
function app({storage=new Map(),denyClipboard=false,denyStorage=false}={}) {
  class Element {
    value='';textContent='';hidden=false;disabled=false;children=[];listeners={};
    addEventListener(type,fn){this.listeners[type]=fn;}
    append(...els){this.children.push(...els);}
    replaceChildren(){this.children=[];}
    focus(){this.focused=true;}
    select(){this.selected=true;}
    click(){this.clicked=true;}
  }
  const els=new Map(),get=id=>{if(!els.has(id))els.set(id,new Element());return els.get(id);};
  let clip='',blob;
  const context={document:{getElementById:get,createElement:()=>new Element()},sessionStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>{if(denyStorage)throw Error('quota');storage.set(k,v);}},navigator:{clipboard:{writeText:async t=>{if(denyClipboard)throw Error('denied');clip=t;},readText:async()=>{if(denyClipboard)throw Error('denied');return clip;}}},Blob,URL:{createObjectURL:b=>{blob=b;return 'blob:test';},revokeObjectURL(){}},setTimeout:fn=>fn(),confirm:()=>true,__CRUCIBLE_BUILD__:'test-sha'};
  vm.runInNewContext(source,context);
  return {get,storage,click:async id=>get(id).listeners.click(),input:(id,text)=>{get(id).value=text;get(id).listeners.input();},state:()=>JSON.parse(storage.get('astralbridge.crossings.v1')),clipboard:()=>clip,setClipboard:t=>{clip=t;},exportText:async()=>blob.text()};
}
test('three bounded crossings preserve exact strings, IDs, and separate directions',async()=>{
  const a=app();assert.equal(a.get('begin').disabled,true);
  for(let i=1;i<=3;i++){
    const out=`  outward ${i}\nفارسی 🧭\n<script>not code</script>  `;
    const ret=` return ${i}\n\n  exact whitespace  `;
    a.input('outward',out);await a.click('begin');assert.equal(a.clipboard(),out);assert.equal(a.get('outward').readOnly,true);
    await a.click('begin');assert.equal(a.state().records.length,i);
    a.setClipboard(ret);await a.click('paste');await a.click('finish');
    const r=a.state().records[i-1];assert.equal(r.id,i);assert.equal(r.outward,out);assert.equal(r.returned,ret);assert.equal(r.status,'returned');assert.equal(a.get('outward').readOnly,false);
  }
  await a.click('export');assert.equal(JSON.parse(await a.exportText()).records.length,3);
});
test('reload recovers pending crossing and return draft',async()=>{
  const a=app();a.input('outward','pending');await a.click('begin');a.input('returned','unfinished response');
  const b=app({storage:a.storage});assert.equal(b.get('outward').value,'pending');assert.equal(b.get('returned').value,'unfinished response');assert.equal(b.get('outward').readOnly,true);
  await b.click('finish');assert.equal(b.state().records[0].returned,'unfinished response');
});
test('clipboard refusal leaves a usable manual crossing',async()=>{
  const a=app({denyClipboard:true});a.input('outward','manual');await a.click('begin');assert.equal(a.get('outward').selected,true);assert.match(a.get('status').textContent,/Automatic copy unavailable/);
  await a.click('paste');assert.match(a.get('status').textContent,/Paste into/);a.input('returned','manual return');await a.click('finish');assert.equal(a.state().records[0].returned,'manual return');
});
test('whitespace cannot complete; closing preserves unfinished evidence',async()=>{
  const a=app();a.input('outward','  \n');assert.equal(a.get('begin').disabled,true);a.input('outward','hello');await a.click('begin');a.input('returned',' \n');assert.equal(a.get('finish').disabled,true);await a.click('finish');assert.equal(a.state().records[0].status,'awaiting-return');
  a.input('returned','partial');await a.click('cancel');assert.equal(a.state().records[0].unrecordedReturnDraft,'partial');assert.equal(a.state().records[0].status,'closed');assert.equal(a.state().records[0].returned,undefined);
});
test('storage quota failure does not prevent in-memory crossing or export',async()=>{
  const a=app({denyStorage:true});a.input('outward','quota test');await a.click('begin');assert.equal(a.get('storage-warning').hidden,false);a.input('returned','still works');await a.click('finish');await a.click('export');assert.equal(JSON.parse(await a.exportText()).records[0].returned,'still works');
});
