import { useState } from 'react'
import { CalendarDays, Check, ChevronLeft, ChevronRight, Flag, Repeat2, SlidersHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useWorkspace } from '@/app/providers'
import { ActivityIcon, ActivityList, EmptyState, PageHeading, Panel, WeekStrip, categoryNames } from '@/components/common'
import { Button } from '@/components/ui/button'
import { addDays, formatDate, weekDays } from '@/domain/dates'
import { dayProgress } from '@/domain/progress'
import { cn } from '@/lib/utils'

export default function ProtocolsPage() {
  const {data, today} = useWorkspace()
  const [tab, setTab] = useState<'today' | 'week' | 'habits'>('today')
  const [selected, setSelected] = useState(today)
  const date = tab === 'today' ? today : selected
  const activities = data.activities.filter(a => a.date === date).sort((a,b) => a.time.localeCompare(b.time))
  const progress = dayProgress(activities, date)
  const habits = [...new Map(data.activities.filter(a => a.date === today).map(a => [a.templateId, a])).values()]
  return <><PageHeading eyebrow="ORGANIZE SEU DIA" title="Protocolos" description="Clareza para saber o que fazer. Liberdade para ajustar." action={<Button variant="secondary" asChild><Link to="/perfil"><SlidersHorizontal size={16}/>Ajustar rotina</Link></Button>}/>
    <div className="tabs" aria-label="Visões dos protocolos">{([{id: 'today', label: 'Hoje', icon: CalendarDays}, {id: 'week', label: 'Semana', icon: CalendarDays}, {id: 'habits', label: 'Hábitos', icon: Repeat2}] as const).map(t => <button className={cn(tab === t.id && 'active')} aria-pressed={tab === t.id} key={t.id} onClick={() => setTab(t.id)}><t.icon size={17}/>{t.label}</button>)}</div>
    <div className="content-columns"><div className="column-stack">
      {tab === 'week' && <section className="panel week-selector"><div className="week-heading"><Button size="icon" variant="ghost" aria-label="Semana anterior" onClick={() => setSelected(addDays(selected,-7))} disabled={selected < addDays(today,-83)}><ChevronLeft size={18}/></Button><strong>{formatDate(weekDays(selected)[0]!)} – {formatDate(weekDays(selected)[6]!)}</strong><Button size="icon" variant="ghost" aria-label="Próxima semana" onClick={() => setSelected(addDays(selected,7))} disabled={selected >= today}><ChevronRight size={18}/></Button></div><WeekStrip selected={selected} onSelect={setSelected}/></section>}
      {tab === 'habits' ? <Panel title="Hábitos da sua rotina" icon={Repeat2}>{habits.length ? habits.map(h => {
        const assigned = data.activities.filter(a => a.templateId === h.templateId && a.date >= weekDays(today)[0]! && a.date <= today)
        const completed = assigned.filter(a => a.done).length
        return <div key={h.id} className="habit-row"><span className={`activity-symbol symbol-${h.icon}`}><ActivityIcon name={h.icon}/></span><div><h3>{h.title}</h3><p>{categoryNames[h.category]} · {h.minutes} min</p></div><strong>{completed}<span>/{assigned.length}</span></strong></div>
      }) : <EmptyState title="Seus hábitos aparecerão aqui" text="As atividades atribuídas formam sua lista de hábitos."/>}</Panel> : <Panel title={date === today ? 'Atividades de hoje' : formatDate(date, {weekday: 'long', day: 'numeric', month: 'long'})} icon={CalendarDays}><div className="section-caption"><span>{progress.done} de {progress.total} concluídas</span><span>{progress.percent}%</span></div><div className="progress-track"><span style={{width: `${progress.percent}%`}}/></div>{activities.length ? <ActivityList activities={activities}/> : <EmptyState title="Nenhuma atividade neste dia" text="O histórico preserva o que foi atribuído. Novas atividades aparecem a partir do início da sua rotina."/>}</Panel>}
    </div><div className="column-stack"><Panel title="Fases do programa" icon={Flag}>{data.phases.length ? <ol className="phase-list">{data.phases.map((phase, i) => <li key={phase.id} className={cn(phase.current && 'phase-current')}><span>{phase.current ? <Check size={16}/> : String(i+1).padStart(2,'0')}</span><div><h3>{phase.name}</h3>{phase.current && <small>FASE ATUAL</small>}<p>{phase.description}</p></div></li>)}</ol> : <EmptyState title="Programa em preparação" text="As fases aparecerão após a atribuição de um programa."/>}</Panel><div className="info-card"><h3>Uma rotina que acompanha você</h3><p>Os ajustes de preferências valem para os próximos dias. O que você já registrou permanece no histórico.</p></div></div></div>
  </>
}
