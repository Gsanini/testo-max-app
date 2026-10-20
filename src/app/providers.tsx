import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { loadWorkspace, saveAction } from '@/services/repository'
import {grantSharedAccess, hasSharedAccess, revokeSharedAccess} from '@/services/sharedAccess'
import { dateKey, defaultTimezone } from '@/domain/dates'
import type { Action, Workspace } from '@/domain/types'
import { messageOf } from '@/lib/utils'

export const queryClient = new QueryClient({defaultOptions: {queries: {retry: 1, staleTime: 20000, refetchOnWindowFocus: true, networkMode:'always'}, mutations: {retry: 0, networkMode: 'always'}}})
// Somente RAM: mantém a intenção recuperável durante uma queda de conexão, sem cache privado offline.
const uncertainActions = new Map<string, Action>()
type AuthState = {authenticated: boolean; online: boolean; enter: () => void; logout: () => Promise<void>}
const AuthContext = createContext<AuthState | null>(null)
export function useAuth() { const state = useContext(AuthContext); if (!state) throw new Error('AuthProvider ausente'); return state }
export function Providers({children}: {children: ReactNode}) {
  const [authenticated, setAuthenticated] = useState(hasSharedAccess)
  const [online, setOnline] = useState(navigator.onLine)
  useEffect(() => {
    const offline = () => setOnline(false)
    const connected = () => setOnline(true)
    window.addEventListener('offline', offline); window.addEventListener('online', connected)
    return () => {window.removeEventListener('offline', offline); window.removeEventListener('online', connected)}
  }, [])
  const logout = async () => {
    await queryClient.cancelQueries(); queryClient.clear(); uncertainActions.clear()
    revokeSharedAccess(); setAuthenticated(false)
  }
  const enter = () => {grantSharedAccess(); setAuthenticated(true)}
  return <QueryClientProvider client={queryClient}><AuthContext.Provider value={{authenticated,online,enter,logout}}>{children}</AuthContext.Provider></QueryClientProvider>
}

type WorkspaceState = {data: Workspace; today: string; act: (action: Action) => Promise<boolean>; busy: boolean; feedback: {text: string; error: boolean} | null; dismiss: () => void; retry: () => void}
const WorkspaceContext = createContext<WorkspaceState | null>(null)
export function useWorkspace() {const context = useContext(WorkspaceContext); if (!context) throw new Error('WorkspaceProvider ausente'); return context}
export function WorkspaceProvider({children, loading, errorView}: {children: ReactNode; loading: ReactNode; errorView: (error: unknown, retry: () => void) => ReactNode}) {
  const client = useQueryClient()
  const submitting = useRef(false)
  const [clock, setClock] = useState(Date.now())
  const [timezone, setTimezone] = useState(defaultTimezone)
  useEffect(() => {const tick=()=>setClock(Date.now());const timer = setInterval(tick, 1000);window.addEventListener('focus',tick);document.addEventListener('visibilitychange',tick);return () => {clearInterval(timer);window.removeEventListener('focus',tick);document.removeEventListener('visibilitychange',tick)}}, [])
  useEffect(() => {const sync=(event:StorageEvent)=>{if(event.key==='testomax:local-workspace:v1')void client.invalidateQueries({queryKey:['workspace']})};window.addEventListener('storage',sync);return ()=>window.removeEventListener('storage',sync)},[client])
  const today = dateKey(timezone, new Date(clock))
  const key = ['workspace', 'local', today]
  const query = useQuery({queryKey: key, queryFn: loadWorkspace})
  useEffect(() => {if (query.data) setTimezone(query.data.profile.timezone)}, [query.data])
  const owner = 'local'
  const [feedback, setFeedback] = useState<WorkspaceState['feedback']>(() => uncertainActions.has(owner) ? {text: 'Uma alteração não foi confirmada. Confira os registros ou tente salvar novamente.', error: true} : null)
  const [failed, setFailed] = useState<Action | null>(() => uncertainActions.get(owner) ?? null)
  const mutation = useMutation({
    mutationFn: saveAction,
    onMutate: async action => {
      uncertainActions.set(owner, action)
      await client.cancelQueries({queryKey: key})
      const previous = client.getQueryData<Workspace>(key)
      if (previous) {
        const next = structuredClone(previous)
        if (action.type === 'activity') {
          const mealId=next.activities.find(a=>a.id===action.id)?.mealId
          next.activities = next.activities.map(a => a.id === action.id ? {...a, done: action.done} : a)
          if(mealId)next.meals=next.meals.map(meal=>meal.id===mealId?{...meal,done:action.done}:meal)
        }
        if (action.type === 'meal') {
          next.meals = next.meals.map(m => m.id === action.id ? {...m, done: action.done} : m)
          next.activities=next.activities.map(activity=>activity.mealId===action.id?{...activity,done:action.done}:activity)
        }
        if (action.type === 'time') next.activities = next.activities.map(a => a.id === action.id ? {...a, time: action.time} : a)
        if (action.type === 'groceries') {if (action.replaceGenerated) next.grocery = next.grocery.filter(i => i.personal); for (const item of action.items) {next.grocery = next.grocery.filter(i => i.id !== item.id); next.grocery.push(item)}}
        if (action.type === 'removeGrocery') next.grocery = next.grocery.filter(i => i.id !== action.id)
        client.setQueryData(key, next)
      }
      return {previous}
    },
    onSuccess: (_data, action) => {uncertainActions.delete(owner); setFailed(null); setFeedback({text: action.type === 'activity' || action.type === 'meal' ? action.done ? 'Concluído. Mais um passo no seu dia!' : 'Conclusão desfeita.' : 'Alterações salvas.', error: false})},
    onError: (error, action, context) => {if (context?.previous) client.setQueryData(key, context.previous); setFailed(action); setFeedback({text: messageOf(error), error: true})},
    onSettled: () => client.invalidateQueries({queryKey: ['workspace']}),
  })
  useEffect(() => {if (feedback && !feedback.error) {const timer = setTimeout(() => setFeedback(null), 4000); return () => clearTimeout(timer)}}, [feedback])
  const act = async (action: Action) => {if (submitting.current) return false;submitting.current=true;try {await mutation.mutateAsync(action); return true} catch {return false} finally {submitting.current=false}}
  if (query.isPending) return loading
  if (!query.data || query.isError) return errorView(query.error, () => {void query.refetch()})
  return <WorkspaceContext.Provider value={{data: query.data, today, act, busy: mutation.isPending, feedback, dismiss: () => {setFeedback(null); setFailed(null); uncertainActions.delete(owner)}, retry: () => {if (failed) void act(failed)}}}>{children}</WorkspaceContext.Provider>
}
