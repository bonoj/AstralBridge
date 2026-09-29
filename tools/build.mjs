import {mkdir,readFile,writeFile,copyFile,rm} from "node:fs/promises";
import {resolve} from "node:path";
import {build} from "esbuild";

const root=resolve(import.meta.dirname,".."),dist=resolve(root,"dist");
await rm(dist,{recursive:true,force:true});
await mkdir(dist,{recursive:true});
const commit=process.env.GITHUB_SHA||"local";

const js=await build({entryPoints:[resolve(root,"src/main.js")],bundle:true,write:false,format:"iife",platform:"browser",target:"es2022",minify:false});
let shell=await readFile(resolve(root,"src/shell.html"),"utf8");
const css=await readFile(resolve(root,"src/styles.css"),"utf8");
shell=shell.replace("{{BUILD_COMMIT}}",commit)
  .replace("<!-- CRUCIBLE:STYLE -->",`<style>${css}</style>`)
  .replace("<!-- CRUCIBLE:SCRIPT -->",`<script>${js.outputFiles[0].text}</script>`);
await writeFile(resolve(dist,"index.html"),shell,"utf8");
console.log(`Built AstralBridge dist/index.html (${Buffer.byteLength(shell)} bytes) at ${commit}`);

const intake=resolve(dist,"intake");
await mkdir(intake,{recursive:true});
const intakeBuild=await build({entryPoints:[resolve(root,"src/intake/main.js")],bundle:true,write:false,format:"iife",platform:"browser",target:"es2022"});
const intakeJS=intakeBuild.outputFiles[0].text.replaceAll('__INTAKE_BUILD__',commit).replaceAll('</script','<\\/script');
const intakeShell=(await readFile(resolve(root,'src/intake/shell.html'),'utf8'))
  .replace('<!-- INTAKE:STYLE -->',`<style>${css} .receipt-link{display:block;width:100%;text-align:left;margin:8px 0} .probe{padding:20px 0} .probe .actions{flex-wrap:wrap} h3{font-size:13px} #verdict{font-weight:600}</style>`)
  .replace('<!-- INTAKE:SCRIPT -->',`<script>${intakeJS}</script>`);
await writeFile(resolve(intake,'index.html'),intakeShell);
const worker=await build({entryPoints:[resolve(root,'src/intake/sw.js')],bundle:true,write:false,format:'iife',platform:'browser',target:'es2022'});
await writeFile(resolve(intake,'sw.js'),worker.outputFiles[0].text.replaceAll('__INTAKE_BUILD__',commit));
for(const file of ['manifest.webmanifest','icon-192.png','icon-512.png','fixture.zip'])await copyFile(resolve(root,'src/intake',file),resolve(intake,file));
console.log('Built scoped intake probe (HTML, service worker, manifest, icons, fixture).');
