// Contrato independente do checkout. Mapeie um provedor real APÓS verificar sua assinatura.
export type PaymentEvent = {
  eventId: string; userId: string; productId: 'testomax';
  kind: 'purchase_approved' | 'renewed' | 'refunded' | 'revoked';
  occurredAt: string; expiresAt: string | null;
}
export interface PaymentAdapter {
  readonly provider: string;
  verify(request: Request, rawBody: string): Promise<PaymentEvent>;
}

export function gatewayAdapter(secret: string): PaymentAdapter {
  return {
    provider: 'gateway',
    async verify(request, rawBody) {
      const timestamp = request.headers.get('x-testomax-timestamp') ?? ''
      const signature = request.headers.get('x-testomax-signature') ?? ''
      if (!/^\d{10}$/.test(timestamp) || Math.abs(Date.now()/1000 - Number(timestamp)) > 300 || !/^[0-9a-f]{64}$/i.test(signature)) throw new Error('Assinatura inválida')
      const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), {name:'HMAC',hash:'SHA-256'}, false, ['verify'])
      const bytes = new Uint8Array(signature.match(/.{2}/g)!.map(hex => parseInt(hex,16)))
      const verified = await crypto.subtle.verify('HMAC', key, bytes, new TextEncoder().encode(`${timestamp}.${rawBody}`))
      if (!verified) throw new Error('Assinatura inválida')
      const event: unknown = JSON.parse(rawBody)
      if (!event || typeof event !== 'object') throw new Error('Evento inválido')
      const value = event as Record<string,unknown>
      if (typeof value.eventId !== 'string' || value.eventId.length < 1 || value.eventId.length > 200
        || typeof value.userId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.userId)
        || value.productId !== 'testomax' || !['purchase_approved','renewed','refunded','revoked'].includes(String(value.kind))
        || typeof value.occurredAt !== 'string' || !Number.isFinite(Date.parse(value.occurredAt))
        || !(value.expiresAt === null || (typeof value.expiresAt === 'string' && Number.isFinite(Date.parse(value.expiresAt))))) throw new Error('Evento inválido')
      return value as PaymentEvent
    },
  }
}
