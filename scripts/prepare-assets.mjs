import {mkdir, readFile, writeFile} from 'node:fs/promises'
import sharp from 'sharp'
await mkdir('public/icons',{recursive:true})
await mkdir('public/images',{recursive:true})
const svg = await readFile('public/icon.svg')
for (const size of [192,512]) await sharp(svg).resize(size,size).png().toFile(`public/icons/icon-${size}.png`)
await sharp(svg).resize(180,180).png().toFile('public/icons/apple-touch-icon.png')
await sharp({create:{width:512,height:512,channels:4,background:'#141517'}}).composite([{input:await sharp(svg).resize(360,360).toBuffer(),left:76,top:76}]).png().toFile('public/icons/maskable-512.png')
const photos = {
  mountain:'photo-1464822759023-fed622ff2c3b', breakfast:'photo-1722607571891-7ab5396a1b83',
  lunch:'photo-1762631383815-784c04533802', snack:'photo-1490474418585-ba9bad8fd0ea', dinner:'photo-1512621776951-a57141f2eefd',
}
for (const [name,id] of Object.entries(photos)) {
  if (process.argv.length>2 && !process.argv.slice(2).includes(name)) continue
  const response = await fetch(`https://images.unsplash.com/${id}?auto=format&fit=crop&w=${name === 'mountain' ? 1600 : 900}&q=82`,{signal:AbortSignal.timeout(20000)})
  if (!response.ok) throw new Error(`Falha na imagem ${name}: ${response.status}`)
  await writeFile(`public/images/${name}.jpg`,Buffer.from(await response.arrayBuffer()))
  console.log(`Imagem salva: ${name}`)
}
