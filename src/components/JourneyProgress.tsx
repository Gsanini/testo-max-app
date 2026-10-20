import { Check, Flag } from 'lucide-react'
import { useWorkspace } from '@/app/providers'
import { Ring } from './common'
import { currentDayFor, JOURNEY_DAYS, missionsForDay, participation } from '@/domain/journey'

export function JourneyProgress({ completedDays }: { completedDays: number }) {
  const percent = completedDays / JOURNEY_DAYS * 100
  return <section className="routine-progress-card total-progress" aria-label="Progresso total">
    <div className="progress-card-label"><Flag size={17}/><h2>Progresso total</h2><strong>{percent.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%</strong></div>
    <p className="progress-card-value"><strong>{completedDays}</strong><span>de {JOURNEY_DAYS} dias concluídos</span></p>
    <progress className="native-progress" value={completedDays} max={JOURNEY_DAYS} aria-label="Dias concluídos na jornada"/>
    <p className="progress-card-note">Cada dia conta quando todos os seus passos estão concluídos.</p>
  </section>
}

export function RoutineProgress({ day }: { day?: number }) {
  const { data, today } = useWorkspace()
  const current = currentDayFor(data, today)
  const selectedDay = day ?? current
  const activities = missionsForDay(data, selectedDay)
  const done = activities.filter(activity => activity.done).length
  const percent = activities.length ? Math.round(done / activities.length * 100) : 0
  const completedDays = participation(data, today).completeDays.length
  return <div className="routine-progress-grid">
    <section className="routine-progress-card daily-progress" aria-label="Progresso do dia">
      <div><div className="progress-card-label"><Check size={17}/><h2>{selectedDay === current ? 'Progresso de hoje' : `Progresso do dia ${selectedDay}`}</h2></div>
        <p className="progress-card-value"><strong>{done}<span>/{activities.length}</span></strong><span>passos concluídos</span></p>
        <p className="progress-card-note">{percent === 100 ? 'Tudo feito. Seu dia está completo!' : done ? 'Você já começou. Continue no seu ritmo.' : 'Seu primeiro passo já está pronto abaixo.'}</p>
      </div>
      <div role="progressbar" aria-label="Progresso do dia" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-valuetext={`${done} de ${activities.length} passos concluídos`}><Ring percent={percent} size={80}><strong>{percent}<small>%</small></strong></Ring></div>
    </section>
    <JourneyProgress completedDays={completedDays}/>
  </div>
}
