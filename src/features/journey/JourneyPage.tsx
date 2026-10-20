import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, ChevronRight, LockKeyhole } from 'lucide-react'
import { useWorkspace } from '@/app/providers'
import { PageHeading } from '@/components/common'
import { JourneyProgress } from '@/components/JourneyProgress'
import { Button } from '@/components/ui/button'
import { chapters } from '@/content/journey'
import { chapterForDay, dayState, currentDayFor, participation, unlockDate } from '@/domain/journey'
import { formatDate } from '@/domain/dates'
import { cn } from '@/lib/utils'

export default function JourneyPage() {
  const { data, today } = useWorkspace()
  const current = currentDayFor(data, today)
  const currentChapter = chapterForDay(current)
  const [chosenChapter, setChosenChapter] = useState<number | null>(null)
  const chapterId = chosenChapter ?? currentChapter.id
  const chapter = chapters[chapterId - 1]!
  const days = Array.from({ length: 30 }, (_, i) => chapter.start + i)
  const stats = participation(data, today)
  const chapterDone = stats.completeDays.filter(day => day >= chapter.start && day <= chapter.end).length
  return <div className="journey-dashboard">
    <PageHeading eyebrow="UM DIA DE CADA VEZ" title="Sua jornada" description="Siga a rotina de hoje. Os próximos dias abrem automaticamente, na data indicada." action={<Button asChild><Link to="/">Ir para o dia atual<ArrowRight size={17}/></Link></Button>}/>
    <div className="journey-summary-grid"><JourneyProgress completedDays={stats.completeDays.length}/><section className="journey-current-card"><span className="eyebrow">VOCÊ ESTÁ AQUI</span><h2>Dia {current}<span> de 120</span></h2><p>Capítulo {currentChapter.id} · {currentChapter.name}</p><Link className="text-link" to="/">Continuar minha rotina<ArrowRight size={16}/></Link></section></div>
    <nav className="journey-chapter-tabs" aria-label="Capítulos da jornada">{chapters.map(ch => <button key={ch.id} aria-pressed={chapterId === ch.id} className={cn(chapterId === ch.id && 'selected')} onClick={() => setChosenChapter(ch.id)}><span className="chapter-tab-number">{ch.start > current ? <LockKeyhole size={17}/> : String(ch.id).padStart(2, '0')}</span><span><small>CAPÍTULO {ch.id}</small><strong>{ch.name}</strong><small>Dias {ch.start} a {ch.end}</small></span></button>)}</nav>
    <section className="journey-days-panel" aria-label={`Dias do capítulo ${chapterId}`}>
      <header className="journey-days-heading"><div><span className="eyebrow">CAPÍTULO {String(chapter.id).padStart(2, '0')}</span><h2>{chapter.name}</h2></div><span>{chapterDone} de 30 dias concluídos</span></header>
      <div className="journey-day-legend"><span><span className="legend-dot legend-today"/>Dia atual</span><span><Check size={14}/>Concluído</span><span><LockKeyhole size={14}/>Bloqueado</span></div>
      <ol className="journey-day-grid">{days.map(day => {
        const state = dayState(data, day, today)
        const isCurrent = day === current
        const locked = state === 'locked'
        const date = unlockDate(data.journey!.startDate, day)
        const content = <><span className="day-tile-top"><span>DIA</span>{locked ? <LockKeyhole size={17}/> : state === 'completed' ? <Check size={18}/> : isCurrent ? <span className="live-dot"/> : <ChevronRight size={16}/>}</span><strong>{String(day).padStart(2, '0')}</strong><span className="day-tile-status">{locked ? 'Bloqueado' : isCurrent ? 'Sua rotina de hoje' : state === 'completed' ? 'Concluído' : 'Ver registros'}</span><small>{locked ? `Libera ${formatDate(date, { day: 'numeric', month: 'short' })}` : isCurrent ? 'Você está aqui' : formatDate(date, { day: 'numeric', month: 'short' })}</small></>
        return <li key={day} className={cn('journey-day-tile', `tile-${state}`, isCurrent && 'tile-today')}>{locked ? <button disabled aria-label={`Dia ${day}: bloqueado. Libera em ${formatDate(date)}`}>{content}</button> : <Link to={isCurrent ? '/' : `/?dia=${day}`} aria-current={isCurrent ? 'step' : undefined} aria-label={`Dia ${day}: ${isCurrent ? 'sua rotina de hoje' : state === 'completed' ? 'concluído' : 'ver registros'}`}>{content}</Link>}</li>
      })}</ol>
      <div className="journey-unlock-help"><LockKeyhole size={19}/><p>Os próximos dias ficam bloqueados até a meia-noite da data indicada, no seu fuso. Concluir hoje não antecipa a liberação. Seus dias anteriores continuam no histórico.</p></div>
    </section>
  </div>
}
