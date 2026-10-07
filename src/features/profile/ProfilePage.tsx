import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, HelpCircle, KeyRound, LogOut, Settings2, ShieldCheck, UserRound, ChevronRight, LockKeyhole } from 'lucide-react'
import { useAuth, useWorkspace } from '@/app/providers'
import { PageHeading, Panel } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { PreferencesForm } from './PreferencesForm'
import { usePwa } from '@/features/pwa/usePwa'
import { getAccess } from '@/services/repository'
import { supabase } from '@/services/supabase'
import { messageOf } from '@/lib/utils'

export default function ProfilePage() {
  const {data} = useWorkspace()
  const {demo, logout, session} = useAuth()
  const pwa = usePwa()
  const [dialog, setDialog] = useState<'install' | 'privacy' | 'help' | 'security' | 'logout' | null>(null)
  const [notice, setNotice] = useState('')
  const [working, setWorking] = useState(false)
  const access = useQuery({queryKey:['access',session?.user.id], queryFn:getAccess, enabled: !demo})
  const secure = async () => {setWorking(true); setNotice(''); if (supabase && session?.user.email) {const {error} = await supabase.auth.resetPasswordForEmail(session.user.email,{redirectTo:`${window.location.origin}/definir-senha`}); setNotice(error ? 'Não foi possível enviar. Tente novamente.' : 'Link enviado para o e-mail da sua conta.')} setWorking(false)}
  const menu = [
    {id:'install', icon:Download, title:'Instalar aplicativo', subtitle:pwa.installed ? 'O TestoMAX já está instalado' : 'Sua rotina a um toque de distância'},
    {id:'security', icon:KeyRound, title:'Segurança da conta', subtitle:'Gerencie sua senha'},
    {id:'help', icon:HelpCircle, title:'Ajuda', subtitle:'Entenda como usar o TestoMAX'},
    {id:'privacy', icon:LockKeyhole, title:'Privacidade', subtitle:'Como seus dados são tratados'},
  ] as const
  return <><PageHeading eyebrow="DO SEU JEITO" title="Seu perfil" description="Uma rotina que se adapta a você."/>
    <div className="profile-banner"><span className="avatar avatar-large">{data.profile.name.slice(0,2).toUpperCase()}</span><div><h2>{data.profile.name}</h2><p>{demo ? 'Perfil de demonstração' : session?.user.email}</p></div><span className="access-badge"><ShieldCheck size={15}/>{demo ? 'Demonstração' : 'Acesso ativo'}</span></div>
    <div className="content-columns"><Panel title="Preferências e rotina" icon={Settings2}><PreferencesForm/></Panel><div className="column-stack"><Panel title="Seu acesso" icon={ShieldCheck}><div className="access-details"><span>Produto</span><strong>TestoMAX</strong><span>Situação</span><strong>{demo ? 'Demonstração de desenvolvimento' : 'Ativo'}</strong><span>Validade</span><strong>{demo ? 'Somente neste navegador' : access.data?.expiresAt ? new Date(access.data.expiresAt).toLocaleDateString('pt-BR',{timeZone:data.profile.timezone}) : 'Sem data de expiração'}</strong></div></Panel><Panel title="Aplicativo e conta" icon={UserRound}><div className="settings-menu">{menu.map(item => <button key={item.id} onClick={() => {setNotice(''); setDialog(item.id)}}><item.icon size={20}/><div><strong>{item.title}</strong><span>{item.subtitle}</span></div><ChevronRight size={17}/></button>)}<button className="logout-button" onClick={() => {setNotice(''); setDialog('logout')}}><LogOut size={20}/><div><strong>Sair da conta</strong><span>Encerrar esta sessão com segurança</span></div><ChevronRight size={17}/></button></div></Panel><p className="version-label">TESTOMAX · VERSÃO 1.0.0</p></div></div>
    <Dialog open={dialog !== null} onOpenChange={open => {if (!open) setDialog(null)}} title={dialog === 'install' ? 'TestoMAX no seu dispositivo' : dialog === 'privacy' ? 'Sua privacidade' : dialog === 'help' ? 'Como podemos ajudar?' : dialog === 'logout' ? 'Sair da conta?' : 'Segurança da conta'}>
      {dialog === 'install' && <div className="copy info-copy">{pwa.installed ? <p>O aplicativo já está instalado neste dispositivo.</p> : pwa.canInstall ? <><p>Abra sua rotina diretamente pela tela inicial.</p><Button onClick={() => void pwa.install()}><Download size={18}/>Instalar TestoMAX</Button></> : <><h3>iPhone ou iPad</h3><p>No Safari, toque em Compartilhar e depois em “Adicionar à Tela de Início”.</p><h3>Android</h3><p>No menu do Chrome, procure “Instalar aplicativo” ou “Adicionar à tela inicial”.</p><h3>No computador</h3><p>No Chrome ou Edge, procure o ícone de instalação na barra de endereço. A opção depende do navegador e de uma versão publicada em HTTPS.</p>{import.meta.env.DEV && <div className="demo-note">O service worker fica ativo no build de produção. Execute o preview para testar a instalação.</div>}</>}</div>}
      {dialog === 'privacy' && <div className="copy info-copy"><h3>Dados que usamos</h3><p>Nome, e-mail da conta, preferências de rotina e registros de atividades, refeições e compras. Não coletamos níveis hormonais nem informações clínicas.</p><h3>Armazenamento e acesso</h3><p>{demo ? 'Nesta demonstração, os exemplos e alterações são salvos no armazenamento local deste navegador. Sair da demonstração limpa esses dados.' : 'Os dados ficam no Supabase. Políticas no banco restringem o acesso ao titular com direito ativo. A sessão é mantida neste dispositivo até você sair.'}</p><h3>Offline e sessão</h3><p>Apenas os arquivos públicos do aplicativo são guardados para uso offline. Dados protegidos precisam de conexão. Ao sair, os estados da conta são limpos.</p><h3>Responsável pelo tratamento</h3><p>O contato do responsável e o canal para solicitações de dados ainda precisam ser configurados antes do lançamento comercial.</p></div>}
      {dialog === 'help' && <div className="copy info-copy"><h3>Como registrar uma atividade?</h3><p>Na tela Hoje, toque no círculo ao lado da atividade. Toque novamente para desfazer. Abra os detalhes para consultar as instruções.</p><h3>Onde ajusto meus horários?</h3><p>Nos detalhes de uma atividade ou nas preferências do perfil. Mudanças nas preferências valem para os próximos dias.</p><h3>Como funciona a lista de compras?</h3><p>Escolha o período e toque em Gerar lista. Ingredientes compatíveis são somados. Seus itens pessoais permanecem.</p><h3>Contato de suporte</h3><p>O canal de atendimento ainda não foi configurado. Nenhum canal fictício é apresentado neste ambiente.</p></div>}
      {dialog === 'security' && <div className="copy info-copy"><p>{demo ? 'A demonstração não utiliza senha nem conta real. Conecte o Supabase para testar a autenticação.' : `Enviaremos um link para ${session?.user.email} para você definir uma nova senha.`}</p>{!demo && <Button disabled={working} onClick={() => void secure()}>Enviar link para alterar senha</Button>}</div>}
      {dialog === 'logout' && <><p className="muted copy">{demo ? 'Os dados locais da demonstração serão removidos.' : 'Seus registros permanecem salvos na sua conta.'}</p><div className="dialog-actions"><Button variant="secondary" onClick={() => setDialog(null)}>Continuar aqui</Button><Button variant="destructive" disabled={working} onClick={async () => {setWorking(true); try {await logout()} catch (error) {setNotice(messageOf(error))} finally {setWorking(false)}}}>Sair da conta</Button></div></>}
      {notice && <p className="inline-notice" role="status">{notice}</p>}
    </Dialog>
  </>
}
