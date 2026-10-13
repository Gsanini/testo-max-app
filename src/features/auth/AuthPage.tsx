import {Link, Navigate, useNavigate} from 'react-router-dom'
import {ArrowRight, LockKeyhole, ShieldCheck} from 'lucide-react'
import {useAuth} from '@/app/providers'
import {Brand} from '@/components/common'
import {Button} from '@/components/ui/button'

export default function AuthPage() {
  const {authenticated, enter} = useAuth()
  const navigate = useNavigate()

  if (authenticated) return <Navigate to='/' replace />

  const handleEnter = () => {
    enter()
    navigate('/', {replace: true})
  }

  return (
    <main className='auth-shell'>
      <section className='auth-story'>
        <Link to='/entrar' aria-label='TestoMAX'><Brand /></Link>
        <div className='auth-story-copy'>
          <div className='eyebrow'>SUA ROTINA. SUA EVOLUÇÃO.</div>
          <h1>O próximo passo<br />começa com você<span>.</span></h1>
          <p>Movimento, alimentação e bons hábitos.<br />Tudo no seu ritmo. Tudo em um só lugar.</p>
          <div className='auth-story-line' />
        </div>
        <span className='auth-story-footer'>UM DIA DE CADA VEZ.</span>
      </section>
      <section className='auth-form-side'>
        <div className='mobile-auth-brand'><Brand /></div>
        <div className='auth-form-card'>
          <span className='auth-icon'><LockKeyhole size={23} /></span>
          <h2>Bom ter você por aqui.</h2>
          <p className='auth-subtitle'>Entre para começar a sua rotina.</p>
          <Button className='full-width' onClick={handleEnter}>
            Entrar na minha rotina<ArrowRight size={17} />
          </Button>
          <div className='auth-secure'><ShieldCheck size={16} /><span>Seus dados ficam neste dispositivo</span></div>
        </div>
        <p className='auth-copyright'>© {new Date().getFullYear()} TestoMAX. No seu ritmo.</p>
      </section>
    </main>
  )
}
