import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, demoAvailable } from '@/services/supabase'
import { loadWorkspace, saveAction } from '@/services/repository'
import { dateKey, defaultTimezone } from '@/domain/dates'
import type { Action, Workspace } from '@/domain/types'
import { messageOf } from '@/lib/utils'

export const queryClient = new QueryClient({defaultOptions: {queries: {retry: 1, staleTime: 20000, refetchOnWindowFocus: true}, mutations: {retry: 0, networkMode: 'always'}}})
// Somente RAM: mantém a intenção recuperável durante uma queda de conexão, sem cache privado offline.
const uncertainActions = new Map<string, Action>()
type AuthState = {session: Session | null; demo: boolean; ready: boolean; online: boolean; enterDemo: () => void; logout: () => Promise<void>}
const AuthContext = createContext<AuthState | null>(null)
export function useAuth() { const state = useContext(AuthContext); if (!state) throw new Error('AuthProvider ausente'); return state }
export function Providers({children}: {children: ReactNode}) {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(!supabase)
  const [demo, setDemo] = useState(demoAvailable && sessionStorage.getItem('testomax:demo-session') === 'true')
  const [online, setOnline] = useState(navigator.onLine)
  useEffect(() => {
    const offline = () => {setOnline(false); void queryClient.cancelQueries(); queryClient.clear()}
    const connected = () => {setOnline(true); void queryClient.invalidateQueries()}
    window.addEventListener('offline', offline); window.addEventListener('online', connected)
    let identity: string | undefined
    const {data} = supabase?.auth.onAuthStateChange((_event, next) => {
      if (identity !== next?.user.id) {queryClient.clear(); uncertainActions.clear(); identity = next?.user.id}
      setSession(next); setReady(true)
    }) ?? {data: null}
    return () => {data?.subscription.unsubscribe(); window.removeEventListener('offline', offline); window.removeEventListener('online', connected)}
  }, [])
  const logout = async () => {
    if (supabase && session) {
      const {error} = await supabase.auth.signOut({scope: 'local'})
      if (error) throw new Error('Não foi possível encerrar a sessão. Tente novamente com conexão.')
    }
    await queryClient.cancelQueries(); queryClient.clear(); uncertainActions.clear()
    if (import.meta.env.DEV && demo) (await import('@/demo/repository')).clear()
    sessionStorage.removeItem('testomax:demo-session'); setDemo(false); setSession(null)
    // O SW guarda somente arquivos públicos. Não existem caches de respostas privadas.
    if ('caches' in window) for (const key of await caches.keys()) if (key.startsWith('testomax-user-')) await caches.delete(key)
  }
  return <QueryClientProvider client={queryClient}><AuthContext.Provider value={{session, demo, ready, online, logout, enterDemo: () => {if (demoAvailable) {sessionStorage.setItem('testomax:demo-session', 'true'); setDemo(true)}}}}>{children}</AuthContext.Provider></QueryClientProvider>
}

type WorkspaceState = {data: Workspace; today: string; act: (action: Action) => Promise<boolean>; busy: boolean; feedback: {text: string; error: boolean} | null; dismiss: () => void; retry: () => void}
const WorkspaceContext = createContext<WorkspaceState | null>(null)
export function useWorkspace() {const context = useContext(WorkspaceContext); if (!context) throw new Error('WorkspaceProvider ausente'); return context}
export function WorkspaceProvider({children, loading, errorView}: {children: ReactNode; loading: ReactNode; errorView: (error: unknown, retry: () => void) => ReactNode}) {
  const {demo, session} = useAuth()
  const client = useQueryClient()
  const [clock, setClock] = useState(Date.now())
  const [timezone, setTimezone] = useState(defaultTimezone)
  useEffect(() => {const timer = setInterval(() => setClock(Date.now()), 30000); return () => clearInterval(timer)}, [])
  const today = dateKey(timezone, new Date(clock))
  const key = ['workspace', demo ? 'demo' : session?.user.id, today]
  const query = useQuery({queryKey: key, queryFn: () => loadWorkspace(demo), refetchInterval: 60000})
  useEffect(() => {if (query.data) setTimezone(query.data.profile.timezone)}, [query.data])
  const owner = demo ? 'demo' : session?.user.id ?? ''
  const [feedback, setFeedback] = useState<WorkspaceState['feedback']>(() => uncertainActions.has(owner) ? {text: 'Uma alteração não foi confirmada. Confira os registros ou tente salvar novamente.', error: true} : null)
  const [failed, setFailed] = useState<Action | null>(() => uncertainActions.get(owner) ?? null)
  const mutation = useMutation({
    mutationFn: (action: Action) => saveAction(action, demo),
    onMutate: async action => {
      uncertainActions.set(owner, action)
      await client.cancelQueries({queryKey: key})
      const previous = client.getQueryData<Workspace>(key)
      if (previous) {
        const next = structuredClone(previous)
        if (action.type === 'activity') next.activities = next.activities.map(a => a.id === action.id ? {...a, done: action.done} : a)
        if (action.type === 'meal') next.meals = next.meals.map(m => m.id === action.id ? {...m, done: action.done} : m)
        if (action.type === 'time') next.activities = next.activities.map(a => a.id === action.id ? {...a, time: action.time} : a)
        if (action.type === 'groceries') {if (action.replaceGenerated) next.grocery = next.grocery.filter(i => i.personal); for (const item of action.items) {next.grocery = next.grocery.filter(i => i.id !== item.id); next.grocery.push(item)}}
        if (action.type === 'removeGrocery') next.grocery = next.grocery.filter(i => i.id !== action.id)
        client.setQueryData(key, next)
      }
      return {previous}
    },
    onSuccess: (_data, action) => {uncertainActions.delete(owner); setFailed(null); setFeedback({text: action.type === 'activity' || action.type === 'meal' ? action.done ? 'Concluído. Mais um passo no seu dia!' : 'Conclusão desfeita.' : 'Alterações salvas.', error: false})},
    onError: (error, action, context) => {if (context?.previous) client.setQueryData(key, context.previous); setFailed(action); setFeedback({text: messageOf(error), error: true})},
    onSettled: () => {void client.invalidateQueries({queryKey: key}); void client.invalidateQueries({queryKey: ['access']})},
  })
  useEffect(() => {if (feedback && !feedback.error) {const timer = setTimeout(() => setFeedback(null), 4000); return () => clearTimeout(timer)}}, [feedback])
  const act = async (action: Action) => {if (mutation.isPending) return false; try {await mutation.mutateAsync(action); return true} catch {return false}}
  if (query.isPending) return loading
  if (!query.data || query.isError) return errorView(query.error, () => {void query.refetch()})
  return <WorkspaceContext.Provider value={{data: query.data, today, act, busy: mutation.isPending, feedback, dismiss: () => {setFeedback(null); setFailed(null); uncertainActions.delete(owner)}, retry: () => {if (failed) void act(failed)}}}>{children}</WorkspaceContext.Provider>
}
