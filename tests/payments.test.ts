import {describe,expect,it} from 'vitest'
import {gatewayAdapter} from '../supabase/functions/_shared/payments'
const secret='a-secure-test-secret-with-at-least-32-characters'
const payload=JSON.stringify({eventId:'evt1',userId:'a0000000-0000-4000-8000-000000000001',productId:'testomax',kind:'purchase_approved',occurredAt:new Date().toISOString(),expiresAt:null})
async function signed(timestamp=String(Math.floor(Date.now()/1000))) {
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign'])
  const signature=Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(`${timestamp}.${payload}`)))).map(n=>n.toString(16).padStart(2,'0')).join('')
  return new Request('https://example.test/webhook',{method:'POST',headers:{'x-testomax-timestamp':timestamp,'x-testomax-signature':signature},body:payload})
}
describe('autenticidade do gateway de pagamentos',()=>{
  it('aceita evento assinado com segredo do backend',async()=>{expect((await gatewayAdapter(secret).verify(await signed(),payload)).eventId).toBe('evt1')})
  it('rejeita assinatura ausente, corpo alterado e replay antigo',async()=>{
    await expect(gatewayAdapter(secret).verify(new Request('https://example.test'),payload)).rejects.toThrow()
    await expect(gatewayAdapter(secret).verify(await signed(),payload.replace('evt1','evt2'))).rejects.toThrow()
    await expect(gatewayAdapter(secret).verify(await signed(String(Math.floor(Date.now()/1000)-600)),payload)).rejects.toThrow()
  })
})
