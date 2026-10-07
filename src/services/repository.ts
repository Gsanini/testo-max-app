import { workspaceSchema, type Access, type Action, type Workspace } from '@/domain/types'
import { supabase } from './supabase'

async function rpc(name: string, args?: Record<string, unknown>) {
  if (!supabase) throw new Error('Conexão não configurada.')
  const {data, error} = await supabase.rpc(name, args)
  if (error) throw new Error(error.code === '42501' ? 'Seu acesso não está ativo. Verifique a situação no perfil.' : 'Não foi possível sincronizar. Confira sua conexão e tente novamente.')
  return data as unknown
}
export async function getAccess(): Promise<Access> {
  if (!supabase) throw new Error('Conexão não configurada.')
  const {data, error} = await supabase.from('entitlements').select('status,expires_at').eq('product_id', 'testomax').maybeSingle()
  if (error) throw new Error('Não foi possível verificar seu acesso. Tente novamente.')
  if (!data) return {status: 'pending', expiresAt: null}
  const status = data.status as Access['status']
  return {status: status === 'active' && data.expires_at && new Date(data.expires_at as string) <= new Date() ? 'expired' : status, expiresAt: data.expires_at as string | null}
}
export async function loadWorkspace(demo: boolean): Promise<Workspace> {
  if (import.meta.env.DEV && demo) return (await import('@/demo/repository')).load()
  return workspaceSchema.parse(await rpc('load_workspace'))
}
export async function saveAction(action: Action, demo: boolean): Promise<void> {
  if (import.meta.env.DEV && demo) return (await import('@/demo/repository')).mutate(action)
  switch (action.type) {
    case 'activity': await rpc('set_activity_completion', {activity_id: action.id, completed: action.done}); break
    case 'meal': await rpc('set_meal_completion', {meal_id: action.id, completed: action.done}); break
    case 'time': await rpc('set_activity_time', {activity_id: action.id, new_time: action.time}); break
    case 'profile': await rpc('save_profile', {profile: action.profile}); break
    case 'groceries': await rpc('save_groceries', {items: action.items, replace_generated: action.replaceGenerated ?? false}); break
    case 'removeGrocery': await rpc('remove_grocery', {item_id: action.id}); break
  }
}
