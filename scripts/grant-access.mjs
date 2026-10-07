import {createClient} from '@supabase/supabase-js'
// Executar somente em terminal administrativo confiável. Nunca importar no frontend.
const {SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY,BUYER_ID,ACCESS_UNTIL,PROTOCOL_ID,PHASE_ID}=process.env
if(!SUPABASE_URL||!SUPABASE_SERVICE_ROLE_KEY||!BUYER_ID) throw new Error('Defina SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY e BUYER_ID no ambiente administrativo.')
if(!/^[\da-f-]{36}$/i.test(BUYER_ID)) throw new Error('BUYER_ID deve ser o UUID de uma conta verificada no Supabase Auth.')
if(Boolean(PROTOCOL_ID)!==Boolean(PHASE_ID)) throw new Error('Informe PROTOCOL_ID e PHASE_ID juntos, ou nenhum deles.')
const client=createClient(SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}})
const {error:userError}=await client.auth.admin.getUserById(BUYER_ID)
if(userError) throw new Error('Conta não encontrada. Crie ou convide o comprador pelo painel administrativo antes de conceder acesso.')
const {error}=await client.rpc('admin_grant_access',{buyer_id:BUYER_ID,valid_until:ACCESS_UNTIL||null})
if(error) throw new Error('A concessão falhou. Verifique as migrations e os parâmetros no ambiente administrativo.')
if(PROTOCOL_ID&&PHASE_ID){const {error:assignmentError}=await client.rpc('admin_assign_protocol',{buyer_id:BUYER_ID,selected_protocol:PROTOCOL_ID,selected_phase:PHASE_ID});if(assignmentError)throw new Error('Acesso concedido, mas a atribuição do protocolo falhou. Corrija o protocolo/fase e repita a atribuição no painel SQL.')}
console.log('Acesso concedido pelo backend. Nenhuma chave administrativa foi enviada ao navegador.')
