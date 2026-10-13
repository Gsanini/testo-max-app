import {PGlite} from '@electric-sql/pglite'
import {readFile} from 'node:fs/promises'
import {afterAll,beforeAll,describe,expect,it} from 'vitest'
import {workspaceSchema} from '../src/domain/types'

// PostgreSQL real via WASM; auth.uid é a única função Supabase simulada.
const db=new PGlite()
const alice='a0000000-0000-4000-8000-000000000001'
const bob='b0000000-0000-4000-8000-000000000002'
const blocked='c0000000-0000-4000-8000-000000000003'
async function user(id:string) {await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);await db.exec('set role authenticated')}
async function admin() {await db.exec('reset role')}
async function workspace() {const r=await db.query<{data:unknown}>('select public.load_workspace() as data');return workspaceSchema.parse(r.rows[0]!.data)}
beforeAll(async()=>{
  await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;grant usage on schema public,auth to anon,authenticated,service_role;grant execute on function auth.uid() to anon,authenticated,service_role;`)
  for (const path of ['supabase/migrations/202610060001_core.sql','supabase/migrations/202610060002_billing.sql','supabase/seed.sql']) await db.exec(await readFile(path,'utf8'))
  await db.query('insert into auth.users(id) values ($1),($2),($3)',[alice,bob,blocked])
  for (const id of [alice,bob]) {
    await db.query('select public.admin_grant_access($1)',[id])
    await db.query("select public.admin_assign_protocol($1,'10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001')",[id])
    await user(id);const initial=await workspace();expect(initial.activities).toHaveLength(0);await db.query('select public.save_profile($1::jsonb)',[JSON.stringify({...initial.profile,name:'Visitante',onboarded:true})]);await workspace();await admin()
  }
},60000)
afterAll(async()=>{await db.close()})
describe('isolamento, autorização e persistência no PostgreSQL',()=>{
  it('filtra todas as tabelas pessoais e o conteúdo atribuído por RLS',async()=>{
    await user(alice)
    for (const table of ['profiles','daily_activities','daily_meals','enrollments']) {
      const result=await db.query<{user_id:string}>(`select user_id from public.${table}`)
      expect(result.rows.length).toBeGreaterThan(0)
      expect(result.rows.every(r=>r.user_id===alice)).toBe(true)
    }
    const content=await db.query('select * from public.activity_templates');expect(content.rows.length).toBeGreaterThan(0)
  })
  it('nega a usuários comuns alterar permissões ou chamar funções administrativas',async()=>{
    await user(alice)
    await expect(db.query("update public.entitlements set status='active' where user_id=$1",[blocked])).rejects.toThrow(/permission denied/)
    await expect(db.query('select public.admin_grant_access($1)',[blocked])).rejects.toThrow(/permission denied/)
    await expect(db.query("select public.apply_billing_event('fake','e1',$1,'testomax','purchase_approved',now(),null)",[blocked])).rejects.toThrow(/permission denied/)
    await expect(db.query("insert into public.activity_completions(user_id,activity_id) values($1,gen_random_uuid())",[alice])).rejects.toThrow(/permission denied/)
  })
  it('bloqueia leitura protegida e RPC de quem não tem direito ativo',async()=>{
    await user(blocked)
    for (const table of ['profiles','daily_activities','daily_meals','protocols','activity_templates','meal_templates','ingredients','shopping_items']) expect((await db.query(`select * from public.${table}`)).rows).toHaveLength(0)
    await expect(workspace()).rejects.toThrow(/Acesso não autorizado/)
    await expect(db.query("select public.save_groceries('[]'::jsonb,false)")).rejects.toThrow(/Acesso não autorizado/)
  })
  it('conclusões são idempotentes, persistentes e só aceitam atividades do titular',async()=>{
    await user(alice);const first=await workspace();const today=new Intl.DateTimeFormat('en-CA',{timeZone:first.profile.timezone}).format(new Date())
    const activity=first.activities.find(a=>a.date===today)!
    expect(activity).toBeDefined()
    await db.query('select public.set_activity_completion($1,true)',[activity.id]);await db.query('select public.set_activity_completion($1,true)',[activity.id])
    expect((await db.query('select * from public.activity_completions')).rows).toHaveLength(1)
    await user(bob)
    await expect(db.query('select public.set_activity_completion($1,true)',[activity.id])).rejects.toThrow(/Atividade indisponível/)
    await expect(db.query("select public.set_activity_time($1,'12:00')",[activity.id])).rejects.toThrow(/Atividade não editável/)
    expect((await db.query('select * from public.activity_completions')).rows).toHaveLength(0)
    await user(alice)
    expect((await workspace()).activities.find(a=>a.id===activity.id)?.done).toBe(true)
    await db.query('select public.set_activity_completion($1,false)',[activity.id])
    expect((await workspace()).activities.find(a=>a.id===activity.id)?.done).toBe(false)
    const future=first.activities.find(a=>a.date>today)!
    await expect(db.query('select public.set_activity_completion($1,true)',[future.id])).rejects.toThrow(/Atividade indisponível/)
  })
  it('preserva refeições, marcações e itens pessoais entre sessões; nega IDs de outra conta',async()=>{
    await user(alice);const state=await workspace();const meal=state.meals[0]!
    await db.query('select public.set_meal_completion($1,true)',[meal.id])
    const item={id:crypto.randomUUID(),name:'Café',quantity:1,unit:'un',category:'Outros',checked:true,personal:true,sourceKey:null}
    await db.query('select public.save_groceries($1::jsonb,false)',[JSON.stringify([item])])
    await user(bob)
    await expect(db.query('select public.set_meal_completion($1,true)',[meal.id])).rejects.toThrow(/Refeição indisponível/)
    await expect(db.query('select public.save_groceries($1::jsonb,false)',[JSON.stringify([item])])).rejects.toThrow(/Item não autorizado/)
    await expect(db.query('select public.remove_grocery($1)',[item.id])).rejects.toThrow(/Item indisponível/)
    await user(alice)
    expect((await workspace()).grocery[0]).toEqual(item)
    await db.query("select public.save_groceries('[]'::jsonb,true)")
    expect((await workspace()).grocery[0]).toEqual(item)
    expect((await workspace()).meals.find(m=>m.id===meal.id)?.done).toBe(true)
  })
  it('ajusta somente o futuro, respeita perfil e não apaga o histórico',async()=>{
    await user(alice);const state=await workspace()
    const first=state.activities[0]!
    await db.query('select public.set_activity_completion($1,true)',[first.id])
    const profile={...state.profile,name:'Alice',onboarded:true,goal:'energia',experience:'avancado',diet:'vegetariana',sleepTime:'23:00'}
    await db.query('select public.save_profile($1::jsonb)',[JSON.stringify(profile)])
    const after=await workspace()
    expect(after.profile.goal).toBe('energia')
    expect(after.activities.find(a=>a.id===first.id)?.done).toBe(true)
    expect(after.activities.some(a=>a.title==='Uma pausa para você')).toBe(true)
    expect(after.activities.filter(a=>a.date>first.date&&a.icon==='moon').every(a=>a.time==='23:00')).toBe(true)
    expect(after.meals.filter(m=>m.date>first.date).every(m=>!m.ingredients.some(i=>i.name==='Peito de frango'))).toBe(true)
  })
  it('revogação e expiração valem imediatamente, mesmo com a sessão existente',async()=>{
    await admin();await db.query("update public.entitlements set status='revoked' where user_id=$1",[bob]);await user(bob)
    expect((await db.query('select * from public.daily_activities')).rows).toHaveLength(0)
    await expect(workspace()).rejects.toThrow(/Acesso não autorizado/)
    await admin();await db.query("update public.entitlements set status='active',expires_at=now()-interval '1 minute' where user_id=$1",[bob]);await user(bob)
    await expect(workspace()).rejects.toThrow(/Acesso não autorizado/)
  })
  it('anon não pode acessar o produto, dados ou funções',async()=>{
    await admin();await db.exec('set role anon')
    await expect(db.query('select * from public.entitlements')).rejects.toThrow(/permission denied/)
    await expect(db.query('select public.load_workspace()')).rejects.toThrow(/permission denied/)
  })
  it('eventos de pagamento são idempotentes e um evento antigo não desfaz uma revogação',async()=>{
    await admin()
    const args=['gateway','event-1',blocked,'testomax','purchase_approved',new Date(Date.now()-3000).toISOString(),null]
    expect((await db.query<{applied:boolean}>('select public.apply_billing_event($1,$2,$3,$4,$5,$6,$7) as applied',args)).rows[0]!.applied).toBe(true)
    expect((await db.query<{applied:boolean}>('select public.apply_billing_event($1,$2,$3,$4,$5,$6,$7) as applied',args)).rows[0]!.applied).toBe(false)
    await db.query("select public.apply_billing_event('gateway','refund',$1,'testomax','refunded',now(),null)",[blocked])
    await db.query("select public.apply_billing_event('gateway','old',$1,'testomax','renewed',now()-interval '1 minute',null)",[blocked])
    await user(blocked);await expect(workspace()).rejects.toThrow(/Acesso não autorizado/)
  })
})
