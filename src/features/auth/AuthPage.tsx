import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/app/providers'
import { Brand } from '@/components/common'
import { Button } from '@/components/ui/button'
import { configured, demoAvailable, supabase } from '@/services/supabase'

const loginSchema = z.object({email: z.string().email('Informe um e-mail válido.'), password: z.string().min(1, 'Informe sua senha.')})
const resetSchema = z.object({password: z.string().min(10, 'Use pelo menos 10 caracteres.'), confirm: z.string()}).refine(v => v.password === v.confirm, {message: 'As senhas precisam ser iguais.', path: ['confirm']})
export default function AuthPage() {
  const {session, demo, enterDemo} = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const reset = location.pathname === '/definir-senha'
  const recovery = location.pathname === '/recuperar-senha'
  const [visible, setVisible] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const form = useForm<z.infer<typeof loginSchema>>({resolver: zodResolver(recovery ? loginSchema.extend({password: z.string()}) : loginSchema), defaultValues: {email: '', password: ''}})
  const passwordForm = useForm<z.infer<typeof resetSchema>>({resolver: zodResolver(resetSchema)})
  if ((session || demo) && !reset && !recovery) return <Navigate to="/" replace/>
  const submit = form.handleSubmit(async values => {
    setError(''); setNotice('')
    if (!supabase) {setError('O ambiente ainda precisa ser conectado ao Supabase. Consulte as instruções de instalação do projeto.'); return}
    if (recovery) {
      const {error} = await supabase.auth.resetPasswordForEmail(values.email, {redirectTo: `${window.location.origin}/definir-senha`})
      if (error) setError('Não foi possível enviar o link. Tente novamente em alguns instantes.')
      else setNotice('Se este e-mail estiver cadastrado, você receberá um link para definir sua senha. Verifique também a caixa de spam.')
    } else {
      const {error} = await supabase.auth.signInWithPassword(values)
      if (error) setError('Não foi possível entrar. Confira seu e-mail e senha ou recupere seu acesso.')
      else navigate('/', {replace: true})
    }
  })
  return <main className="auth-shell"><section className="auth-story"><Link to="/entrar" aria-label="TestoMAX"><Brand/></Link><div className="auth-story-copy"><div className="eyebrow">SUA ROTINA. SUA EVOLUÇÃO.</div><h1>O próximo passo<br/>começa com você<span>.</span></h1><p>Movimento, alimentação e bons hábitos.<br/>Tudo no seu ritmo. Tudo em um só lugar.</p><div className="auth-story-line"/></div><span className="auth-story-footer">UM DIA DE CADA VEZ.</span></section><section className="auth-form-side"><div className="mobile-auth-brand"><Brand/></div><div className="auth-form-card"><span className="auth-icon"><LockKeyhole size={23}/></span><h2>{reset ? 'Defina sua senha' : recovery ? 'Recupere seu acesso' : 'Bom ter você por aqui.'}</h2><p className="auth-subtitle">{reset ? 'Crie uma senha para acessar sua rotina com segurança.' : recovery ? 'Vamos enviar um link para o e-mail da sua conta.' : 'Entre para continuar cuidando da sua rotina.'}</p>
    {!configured && <div className="configuration-note">{demoAvailable ? 'Ambiente de desenvolvimento. Explore a demonstração abaixo ou configure o Supabase para usar uma conta real.' : 'Este ambiente ainda não foi configurado. O responsável pelo TestoMAX precisa conectar a autenticação antes de liberar o acesso.'}</div>}
    {reset ? <>{!session ? <div className="inline-notice">Abra o link recebido por e-mail para definir sua senha. Se o link expirou, solicite outro em <Link to="/recuperar-senha">recuperar acesso</Link>.</div> : <form className="form-stack" onSubmit={passwordForm.handleSubmit(async values => {setError(''); if (!supabase) return; const {error} = await supabase.auth.updateUser({password: values.password}); if (error) setError('Não foi possível atualizar sua senha. Solicite um novo link e tente novamente.'); else {setNotice('Senha definida. Você já pode continuar.'); navigate('/', {replace: true})}})}><label>Nova senha<input type="password" autoComplete="new-password" {...passwordForm.register('password')}/><span className="field-error">{passwordForm.formState.errors.password?.message}</span></label><label>Confirme a senha<input type="password" autoComplete="new-password" {...passwordForm.register('confirm')}/><span className="field-error">{passwordForm.formState.errors.confirm?.message}</span></label><Button type="submit" disabled={passwordForm.formState.isSubmitting}>Salvar senha<ArrowRight size={17}/></Button></form>}</> : <form onSubmit={submit} className="form-stack"><label>E-mail<input type="email" autoComplete="email" placeholder="voce@exemplo.com" {...form.register('email')} aria-invalid={Boolean(form.formState.errors.email)}/><span className="field-error">{form.formState.errors.email?.message}</span></label>{!recovery && <label>Senha<div className="password-field"><input type={visible ? 'text' : 'password'} autoComplete="current-password" placeholder="Sua senha" {...form.register('password')}/><button type="button" className="icon-button" onClick={() => setVisible(!visible)} aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}>{visible ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div><span className="field-error">{form.formState.errors.password?.message}</span></label>}{!recovery && <Link className="forgot-link" to="/recuperar-senha">Esqueci minha senha</Link>}<Button type="submit" disabled={!configured || form.formState.isSubmitting}>{form.formState.isSubmitting ? 'Aguarde…' : recovery ? 'Enviar link de recuperação' : 'Entrar na minha rotina'}<ArrowRight size={17}/></Button></form>}
    {error && <p className="form-error" role="alert">{error}</p>}{notice && <p className="form-success" role="status">{notice}</p>}
    {recovery && <Link className="back-link" to="/entrar"><ArrowLeft size={15}/>Voltar para entrar</Link>}
    {demoAvailable && !reset && !recovery && <div className="demo-entry"><span>CONHEÇA O APLICATIVO</span><Button variant="secondary" className="full-width" onClick={() => {enterDemo(); navigate('/')}}>Explorar demonstração<ArrowRight size={17}/></Button><small>Dados de exemplo · somente neste navegador</small></div>}
    <div className="auth-secure"><ShieldCheck size={16}/><span>Acesso exclusivo para compradores</span></div>
    </div><p className="auth-copyright">© {new Date().getFullYear()} TestoMAX. No seu ritmo.</p></section></main>
  }
