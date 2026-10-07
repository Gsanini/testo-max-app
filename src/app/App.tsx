import { Component, lazy, Suspense, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { LockKeyhole, WifiOff } from 'lucide-react'
import { Providers, useAuth, useWorkspace, WorkspaceProvider } from './providers'
import Layout from './Layout'
import AuthPage from '@/features/auth/AuthPage'
import { OnboardingPage } from '@/features/profile/PreferencesForm'
import { Brand, EmptyState, ErrorState, Loading } from '@/components/common'
import { Button } from '@/components/ui/button'
import { getAccess } from '@/services/repository'

const TodayPage = lazy(() => import('@/features/today/TodayPage'))
const ProtocolsPage = lazy(() => import('@/features/protocols/ProtocolsPage'))
const NutritionPage = lazy(() => import('@/features/nutrition/NutritionPage'))
const ShoppingPage = lazy(() => import('@/features/nutrition/ShoppingPage'))
const ProgressPage = lazy(() => import('@/features/progress/ProgressPage'))
const ProfilePage = lazy(() => import('@/features/profile/ProfilePage'))

function Gate({children}: {children: ReactNode}) {
  const {ready, session, demo, online, logout} = useAuth()
  const access = useQuery({queryKey:['access',session?.user.id], queryFn:getAccess, enabled:Boolean(session) && online && !demo, refetchInterval:60000, staleTime:0})
  if (!online) return <div className="gate-screen"><Brand/><EmptyState icon={WifiOff} title="Sua rotina espera por você" text="Conecte-se à internet para verificar seu acesso e carregar seus dados protegidos. Se havia um registro em andamento, mantenha esta aba aberta e confira a confirmação ao reconectar."><Button onClick={() => {window.dispatchEvent(new Event(navigator.onLine ? 'online' : 'offline'))}}>Verificar conexão</Button></EmptyState></div>
  if (!ready) return <Loading/>
  if (!session && !demo) return <Navigate to="/entrar" replace/>
  if (!demo && access.isPending) return <Loading/>
  if (!demo && access.isError) return <div className="gate-screen"><Brand/><ErrorState retry={() => {void access.refetch()}}/></div>
  if (!demo && access.data?.status !== 'active') {
    const status = access.data?.status ?? 'pending'
    const labels = {pending:['Seu acesso está pendente','Sua conta foi identificada, mas ainda não há um direito de acesso ativo ao TestoMAX. A confirmação da compra ou liberação administrativa é necessária.'],expired:['Seu período de acesso terminou','Seus registros permanecem salvos. Após a renovação ser confirmada pelo responsável, seu acesso será restabelecido.'],revoked:['Acesso indisponível','O acesso a este produto foi revogado. Consulte o responsável pela sua compra.'],active:['','']}
    return <div className="gate-screen"><Brand/><EmptyState icon={LockKeyhole} title={labels[status][0]!} text={labels[status][1]!}><Button onClick={() => {void access.refetch()}} disabled={access.isFetching}>Verificar novamente</Button><Button variant="ghost" onClick={() => {void logout().catch(() => window.location.reload())}}>Sair da conta</Button></EmptyState></div>
  }
  return <WorkspaceProvider loading={<Loading/>} errorView={(_error, retry) => <div className="gate-screen"><Brand/><ErrorState retry={retry}/></div>}><OnboardingGate>{children}</OnboardingGate></WorkspaceProvider>
}
function OnboardingGate({children}: {children: ReactNode}) {const {data} = useWorkspace(); return data.profile.onboarded ? children : <OnboardingPage/>}
function RouteFocus() {return <Suspense fallback={<Loading/>}><Routes><Route path="/entrar" element={<AuthPage/>}/><Route path="/recuperar-senha" element={<AuthPage/>}/><Route path="/definir-senha" element={<AuthPage/>}/><Route element={<Gate><Layout/></Gate>}><Route index element={<TodayPage/>}/><Route path="protocolos" element={<ProtocolsPage/>}/><Route path="alimentacao" element={<NutritionPage/>}/><Route path="alimentacao/compras" element={<ShoppingPage/>}/><Route path="progresso" element={<ProgressPage/>}/><Route path="perfil" element={<ProfilePage/>}/></Route><Route path="*" element={<Navigate to="/" replace/>}/></Routes></Suspense>}
class AppBoundary extends Component<{children:ReactNode},{failed:boolean}> {
  state = {failed:false}
  static getDerivedStateFromError() {return {failed:true}}
  render() {return this.state.failed ? <div className="gate-screen"><Brand/><EmptyState title="Precisamos tentar mais uma vez" text="O aplicativo encontrou um problema ao abrir esta tela. Recarregue para tentar novamente."><Button onClick={() => window.location.reload()}>Recarregar aplicativo</Button></EmptyState></div> : this.props.children}
}
export default function App() {return <AppBoundary><Providers><BrowserRouter><RouteFocus/></BrowserRouter></Providers></AppBoundary>}
