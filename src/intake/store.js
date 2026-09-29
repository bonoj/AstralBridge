const dbName = () => `astralbridge-intake:${new URL('./', self.location.href).pathname}`;
export function openStore() {
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open(dbName(),1);
    request.onupgradeneeded=()=>request.result.createObjectStore('receipts',{keyPath:'id'});
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error);
    request.onblocked=()=>reject(new Error('Close other intake windows and try again.'));
  });
}
export async function saveReceipt(receipt) {
  const db=await openStore();
  try {await new Promise((resolve,reject)=>{
    const tx=db.transaction('receipts','readwrite');tx.objectStore('receipts').add(receipt);
    tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('Storage transaction aborted.'));
  });} finally {db.close();}
}
export async function listReceipts() {
  const db=await openStore();
  try {return await new Promise((resolve,reject)=>{
    const request=db.transaction('receipts').objectStore('receipts').getAll();
    request.onsuccess=()=>resolve(request.result.sort((a,b)=>b.receivedAt.localeCompare(a.receivedAt)));
    request.onerror=()=>reject(request.error);
  });} finally {db.close();}
}
