import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {readParcel,describeParcel,MAX_BYTES} from '../src/intake/payload.js';
test('parcel preserves repeated fields, large Unicode text, binary files and original names',async()=>{
 const f=new FormData(),text='فارسی 🧭\n  exact spacing  \n'.repeat(180000);
 f.append('text',text);f.append('text','second field');f.append('title','<script>inert</script>');
 const binary=Uint8Array.from({length:1024*1024},(_,i)=>i%256);
 f.append('files',new File([binary],'same.zip',{type:'application/zip'}));
 f.append('files',new File(['another file'],'same.zip',{type:'application/octet-stream'}));
 const r=await readParcel(f,{source:'unit-test',build:'test'});
 assert.equal(r.fields[0].value,text);assert.equal(r.fields[1].value,'second field');assert.equal(r.fields[2].value,'<script>inert</script>');assert.equal(r.files.length,2);
 assert.deepEqual(new Uint8Array(await r.files[0].blob.arrayBuffer()),binary);
 assert.equal(r.files[0].sha256,createHash('sha256').update(binary).digest('hex'));assert.equal(r.files[0].name,r.files[1].name);
 assert.notEqual(r.files[0].sha256,r.files[1].sha256);assert.equal(r.source,'unit-test');assert.ok(r.size>5*1024*1024);
});
test('links in Android text field are visibly distinguished from response body evidence',async()=>{
 const f=new FormData();f.append('text','AI Mode: https://example.com/thread');const r=await readParcel(f,{});assert.match(describeParcel(r),/not evidence/);
 const other=new FormData();other.append('url','https://example.com/thread');assert.match(describeParcel(await readParcel(other,{})),/not evidence/);
});
test('empty, over-size and excessive-file submissions reject before saving',async()=>{
 await assert.rejects(readParcel(new FormData(),{}),/empty/);
 await assert.rejects(readParcel({entries:()=>[['files',{size:MAX_BYTES+1}]]},{}),/128 MiB/);
 const f=new FormData();for(let i=0;i<65;i++)f.append('files',new File(['x'],`f${i}.txt`));await assert.rejects(readParcel(f,{}),/64 files/);
});
test('unsupported archives and HTML remain opaque; no parsing or execution is introduced',async()=>{
 const f=new FormData();f.append('files',new File(['not even a valid zip'],'test.zip'));f.append('files',new File(['<script>throw Error("must never execute")</script>'],'test.html',{type:'text/html'}));const r=await readParcel(f,{});assert.equal(await r.files[0].blob.text(),'not even a valid zip');assert.match(await r.files[1].blob.text(),/must never execute/);
});
test('manifest and worker target stay scoped and use POST for file delivery',()=>{
 const m=JSON.parse(readFileSync(new URL('../src/intake/manifest.webmanifest',import.meta.url)));assert.equal(m.share_target.method,'POST');assert.equal(m.share_target.enctype,'multipart/form-data');assert.equal(m.scope,'./');assert.equal(m.share_target.action,'./capture');assert.ok(m.share_target.params.files[0].accept.includes('*/*'));
});
