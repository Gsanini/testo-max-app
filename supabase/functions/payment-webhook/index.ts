import {createClient} from 'npm:@supabase/supabase-js@2'
import {gatewayAdapter} from '../_shared/payments.ts'

// Um gateway privado normaliza os eventos do futuro checkout. Nenhum endpoint por e-mail.
Deno.serve(async (request: Request) => {
  const headers = {'Content-Type':'application/json','Cache-Control':'no-store'}
  const reply = (status: number, body: Record<string,unknown>) => new Response(JSON.stringify(body),{status,headers})
  if (request.method !== 'POST') return reply(405,{error:'Método não permitido'})
  const provider = Deno.env.get('PAYMENT_PROVIDER')
  const secret = Deno.env.get('PAYMENT_WEBHOOK_SECRET')
  if (provider !== 'gateway' || !secret || secret.length < 32) return reply(503,{error:'Checkout ainda não configurado'})
  if (Number(request.headers.get('content-length') ?? '0') > 65536) return reply(413,{error:'Evento muito grande'})
  // Limitado também durante a leitura para corpos sem Content-Length.
  const reader = request.body?.getReader()
  if (!reader) return reply(400,{error:'Corpo ausente'})
  const chunks: Uint8Array[]=[]; let length=0
  while (true) {
    const chunk=await reader.read(); if (chunk.done) break
    length+=chunk.value.length; if (length>65536) {await reader.cancel();return reply(413,{error:'Evento muito grande'})}
    chunks.push(chunk.value)
  }
  const body=new Uint8Array(length); let offset=0
  for (const chunk of chunks) {body.set(chunk,offset);offset+=chunk.length}
  const adapter=gatewayAdapter(secret)
  let event
  try {event=await adapter.verify(request,new TextDecoder().decode(body))}
  catch {return reply(401,{error:'Evento não autenticado ou inválido'})}
  const url=Deno.env.get('SUPABASE_URL'), key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !key) return reply(503,{error:'Backend não configurado'})
  const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}})
  const {data,error}=await client.rpc('apply_billing_event',{
    provider_name:adapter.provider,external_id:event.eventId,buyer_id:event.userId,product:event.productId,
    event_kind:event.kind,occurred:event.occurredAt,valid_until:event.expiresAt,
  })
  if (error) return reply(500,{error:'Evento não processado. Tente novamente.'})
  return reply(200,{received:true,processed:data})
})
