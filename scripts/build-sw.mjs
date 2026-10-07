import {createHash} from 'node:crypto'
import {readFile, readdir, writeFile} from 'node:fs/promises'
import {join} from 'node:path'
async function walk(dir) {const entries=await readdir(dir,{withFileTypes:true}); const paths=await Promise.all(entries.map(e => e.isDirectory() ? walk(join(dir,e.name)) : join(dir,e.name))); return paths.flat()}
const files=(await walk('dist')).filter(p => !p.endsWith('sw.js') && !p.endsWith('.map'))
const assets=files.map(p => '/'+p.replaceAll('\\','/').replace(/^dist\//,''))
const hash=createHash('sha256')
for (const file of files) hash.update(await readFile(file))
const version=hash.digest('hex').slice(0,12)
const sw=`const CACHE='testomax-shell-${version}';
const ASSETS=${JSON.stringify(assets)};
const PUBLIC=new Set(ASSETS);
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('testomax-shell-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()))});
self.addEventListener('message',event=>{if(event.data?.type==='ACTIVATE_UPDATE')self.skipWaiting()});
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request).catch(()=>caches.open(CACHE).then(cache=>cache.match('/index.html'))));return;
  }
  if(PUBLIC.has(url.pathname)&&!url.search){event.respondWith(caches.open(CACHE).then(cache=>cache.match(url.pathname)).then(cached=>cached||fetch(event.request)))}
});`
await writeFile('dist/sw.js',sw)
console.log(`Service worker ${version}: ${assets.length} arquivos públicos; APIs e dados privados fora do cache.`)
