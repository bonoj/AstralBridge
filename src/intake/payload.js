export const MAX_BYTES = 128 * 1024 * 1024;
export const MAX_FILES = 64;

// Preserve field order and repeated names. Files remain opaque, including archives/code.
export async function readParcel(form, {source, build, digest = b => crypto.subtle.digest('SHA-256', b)} = {}) {
  const entries = [...form.entries()];
  const size = entries.reduce((sum,[,v]) => sum + (typeof v === 'string' ? new TextEncoder().encode(v).length : v.size),0);
  const count = entries.filter(([,v]) => typeof v !== 'string').length;
  if (size > MAX_BYTES || count > MAX_FILES) throw new Error('This probe accepts up to 128 MiB and 64 files per parcel. Nothing was saved.');
  if (!entries.some(([,v]) => typeof v === 'string' ? v.length : v.name || v.size)) throw new Error('The parcel was empty. Nothing was saved.');
  const fields=[],files=[];
  for (const [name,value] of entries) {
    if (typeof value === 'string') fields.push({name,value});
    else {
      const hash = await digest(await value.arrayBuffer());
      files.push({field:name,name:value.name,type:value.type,size:value.size,sha256:[...new Uint8Array(hash)].map(n=>n.toString(16).padStart(2,'0')).join(''),blob:value});
    }
  }
  return {id:crypto.randomUUID(),receivedAt:new Date().toISOString(),source,build,fields,files,size};
}

export function describeParcel(receipt) {
  const text=receipt.fields.filter(f=>f.name==='text').map(f=>f.value).join('\n');
  const urlField=receipt.fields.some(f=>f.name==='url' && f.value.trim());
  const linkInText=/https?:\/\/\S+/i.test(text);
  if (!text.trim() && !receipt.files.length && !urlField) return 'Title or other fields only; no response body was received.';
  if (!receipt.files.length && (urlField || linkInText)) return 'Contains a link. A shared link is not evidence that the full response text arrived.';
  return receipt.files.length ? 'File bytes received. Contents are preserved without executing or unpacking them.' : 'Text received. Compare it with the selected response to check completeness.';
}
