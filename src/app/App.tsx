import { Component, lazy, Suspense, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Providers, useAuth, useWorkspace, WorkspaceProvider } from './providers'
import Layout from './Layout'
import AuthPage from '@/features/auth/AuthPage'
import { OnboardingPage } from '@/features/profile/PreferencesForm'
import { Brand, EmptyState, ErrorState, Loading } from '@/components/common'
import { Button } from '@/components/ui/button'

const TodayPage = lazy(() => import('@/features/today/TodayPage'))
const ProtocolsPage = lazy(() => import('@/features/protocols/ProtocolsPage'))
const NutritionPage = lazy(() => import('@/features/nutrition/NutritionPage'))
const ShoppingPage = lazy(() => import('@/features/nutrition/ShoppingPage'))
const ProgressPage = lazy(() => import('@/features/progress/ProgressPage'))
const ProfilePage = lazy(() => import('@/features/profile/ProfilePage'))

function Gate({children}: {children: ReactNode}) {
  const {authenticated} = useAuth()
  if (!authenticated) return <Navigate to="/entrar" replace/>
  return <WorkspaceProvider loading={<Loading/>} errorView={(_error, retry) => <div className="gate-screen"><Brand/><ErrorState retry={retry}/></div>}><OnboardingGate>{children}</OnboardingGate></WorkspaceProvider>
}
function OnboardingGate({children}: {children: ReactNode}) {const {data} = useWorkspace(); return data.profile.onboarded ? children : <OnboardingPage/>}
function RouteFocus() {return <Suspense fallback={<Loading/>}><Routes><Route path="/entrar" element={<AuthPage/>}/><Route element={<Gate><Layout/></Gate>}><Route index element={<TodayPage/>}/><Route path="protocolos" element={<ProtocolsPage/>}/><Route path="alimentacao" element={<NutritionPage/>}/><Route path="alimentacao/compras" element={<ShoppingPage/>}/><Route path="progresso" element={<ProgressPage/>}/><Route path="perfil" element={<ProfilePage/>}/></Route><Route path="*" element={<Navigate to="/" replace/>}/></Routes></Suspense>}
class AppBoundary extends Component<{children:ReactNode},{failed:boolean}> {
  state = {failed:false}
  static getDerivedStateFromError() {return {failed:true}}
  render() {return this.state.failed ? <div className="gate-screen"><Brand/><EmptyState title="Precisamos tentar mais uma vez" text="O aplicativo encontrou um problema ao abrir esta tela. Recarregue para tentar novamente."><Button onClick={() => window.location.reload()}>Recarregar aplicativo</Button></EmptyState></div> : this.props.children}
}
export default function App() {return <AppBoundary><Providers><BrowserRouter><RouteFocus/></BrowserRouter></Providers></AppBoundary>}
