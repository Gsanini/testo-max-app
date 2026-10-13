import {useState} from 'react'
import {ChevronRight, Download, HelpCircle, LockKeyhole, LogOut, Settings2, ShieldCheck, UserRound} from 'lucide-react'
import {useAuth} from '@/app/providers'
import {PageHeading, Panel} from '@/components/common'
import {Button} from '@/components/ui/button'
import {Dialog} from '@/components/ui/dialog'
import {PreferencesForm} from './PreferencesForm'
import {usePwa} from '@/features/pwa/usePwa'

type ProfileDialog = 'install' | 'privacy' | 'help' | 'logout' | null

export default function ProfilePage() {
  const {logout} = useAuth()
  const pwa = usePwa()
  const [dialog, setDialog] = useState<ProfileDialog>(null)
  const [working, setWorking] = useState(false)
  const menu = [
    {id: 'install', icon: Download, title: 'Instalar aplicativo', subtitle: pwa.installed ? 'O TestoMAX já está instalado' : 'Sua rotina a um toque de distância'},
    {id: 'help', icon: HelpCircle, title: 'Ajuda', subtitle: 'Entenda como usar o TestoMAX'},
    {id: 'privacy', icon: LockKeyhole, title: 'Privacidade', subtitle: 'Como seus dados são tratados'},
  ] as const
  return (
    <>
      <PageHeading eyebrow='DO SEU JEITO' title='Suas preferências' description='Uma rotina que se adapta a você.' />
      <div className='profile-banner'>
        <span className='avatar avatar-large'><UserRound size={25} /></span>
        <div><h2>Bem-vindo ao TestoMAX</h2><p>Dados salvos neste dispositivo</p></div>
        <span className='access-badge'><ShieldCheck size={15} />Acesso liberado</span>
      </div>
      <div className='content-columns'>
        <Panel title='Preferências e rotina' icon={Settings2}><PreferencesForm /></Panel>
        <div className='column-stack'>
          <Panel title='Seu acesso' icon={ShieldCheck}>
            <div className='access-details'>
              <span>Produto</span><strong>TestoMAX</strong>
              <span>Situação</span><strong>Ativo</strong>
              <span>Armazenamento</span><strong>Neste navegador</strong>
            </div>
          </Panel>
          <Panel title='Aplicativo e acesso' icon={UserRound}>
            <div className='settings-menu'>
              {menu.map(item => (
                <button key={item.id} onClick={() => setDialog(item.id)}>
                  <item.icon size={20} /><div><strong>{item.title}</strong><span>{item.subtitle}</span></div><ChevronRight size={17} />
                </button>
              ))}
              <button className='logout-button' onClick={() => setDialog('logout')}>
                <LogOut size={20} /><div><strong>Sair</strong><span>Voltar para a tela de entrada</span></div><ChevronRight size={17} />
              </button>
            </div>
          </Panel>
          <p className='version-label'>TESTOMAX · VERSÃO 1.0.0</p>
        </div>
      </div>
      <Dialog
        open={dialog !== null}
        onOpenChange={open => {if (!open) setDialog(null)}}
        title={dialog === 'install' ? 'TestoMAX no seu dispositivo' : dialog === 'privacy' ? 'Sua privacidade' : dialog === 'help' ? 'Como podemos ajudar?' : 'Sair do aplicativo?'}
      >
        {dialog === 'install' && (
          <div className='copy info-copy'>
            {pwa.installed ? <p>O aplicativo já está instalado neste dispositivo.</p> : pwa.canInstall ? (
              <><p>Abra sua rotina diretamente pela tela inicial.</p><Button onClick={() => void pwa.install()}><Download size={18} />Instalar TestoMAX</Button></>
            ) : (
              <>
                <h3>iPhone ou iPad</h3><p>No Safari, toque em Compartilhar e depois em “Adicionar à Tela de Início”.</p>
                <h3>Android</h3><p>No menu do Chrome, procure “Instalar aplicativo” ou “Adicionar à tela inicial”.</p>
                <h3>No computador</h3><p>No Chrome ou Edge, procure o ícone de instalação na barra de endereço.</p>
                {import.meta.env.DEV && <div className='demo-note'>A instalação fica disponível no build de produção ou no preview.</div>}
              </>
            )}
          </div>
        )}
        {dialog === 'privacy' && (
          <div className='copy info-copy'>
            <h3>Dados que usamos</h3><p>Preferências de rotina e registros de atividades, refeições e compras. O acesso direto não identifica cada comprador.</p>
            <h3>Armazenamento</h3><p>Seus dados ficam somente no armazenamento local deste navegador. Eles não são enviados ao Supabase nem sincronizados com outros dispositivos.</p>
            <h3>Offline e saída</h3><p>Depois de carregado, o aplicativo pode continuar funcionando sem conexão. Sair encerra o acesso, mas preserva seus registros neste navegador.</p>
          </div>
        )}
        {dialog === 'help' && (
          <div className='copy info-copy'>
            <h3>Como registrar uma atividade?</h3><p>Na tela Hoje, toque no círculo ao lado da atividade. Toque novamente para desfazer.</p>
            <h3>Onde ajusto meus horários?</h3><p>Nos detalhes de uma atividade ou nas preferências do perfil.</p>
            <h3>Como funciona a lista de compras?</h3><p>Escolha o período e toque em Gerar lista. Seus itens pessoais permanecem.</p>
          </div>
        )}
        {dialog === 'logout' && (
          <>
            <p className='muted copy'>Seus registros continuarão salvos neste navegador para o próximo acesso.</p>
            <div className='dialog-actions'>
              <Button variant='secondary' onClick={() => setDialog(null)}>Continuar aqui</Button>
              <Button variant='destructive' disabled={working} onClick={async () => {setWorking(true);await logout();setWorking(false)}}>Sair</Button>
            </div>
          </>
        )}
      </Dialog>
    </>
  )
}
