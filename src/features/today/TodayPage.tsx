import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, Check, ChevronRight, ClipboardList, Flame, ShoppingBasket, Utensils, Sparkles } from 'lucide-react'
import { useWorkspace } from '@/app/providers'
import { ActivityDetails, ActivityList, EmptyState, MealDetails, PageHeading, Panel, Ring, WeekStrip } from '@/components/common'
import { Button } from '@/components/ui/button'
import { dayProgress, periodProgress, streaks } from '@/domain/progress'
import { addDays, formatDate, weekDays } from '@/domain/dates'

export default function TodayPage() {
  const {data, today, act, busy} = useWorkspace()
  const [details, setDetails] = useState(false)
  const [mealOpen, setMealOpen] = useState(false)
  const activities = data.activities.filter(a => a.date === today).sort((a,b) => a.time.localeCompare(b.time))
  const next = activities.find(a => !a.done)
  const progress = dayProgress(activities, today)
  const nextMeal = data.meals.filter(m => m.date === today).sort((a,b) => a.time.localeCompare(b.time)).find(m => !m.done)
  const weekly = periodProgress(data.activities, weekDays(today)[0]!, today)
  const streak = streaks(data.activities, today)
  const allDone = progress.total > 0 && progress.done === progress.total
  const tomorrow = data.activities.filter(a => a.date === addDays(today, 1))
  return <>
    <PageHeading eyebrow="SEU ESPAÇO PARA EVOLUIR" title="Bem-vindo." description="Vamos cuidar da sua rotina, um passo de cada vez." action={<div className="date-chip"><CalendarDays size={16}/>{formatDate(today, {day: 'numeric', month: 'long'})}</div>}/>
    <section className="focus-card">
      <div className="focus-main"><div className="focus-eyebrow"><span className="live-dot"/>{allDone ? 'DIA CONCLUÍDO' : 'SEU PRÓXIMO PASSO'}</div>
        <h2>{allDone ? 'Você cuidou de você hoje.' : next?.title ?? 'Sua rotina começa aqui.'}</h2>
        <p>{allDone ? `Amanhã, ${tomorrow.length} novas atividades esperam por você. Por hoje, aproveite sua conquista.` : next ? `${next.subtitle}. ${next.minutes} minutos para continuar.` : 'Seu conteúdo aparecerá aqui assim que o programa for disponibilizado.'}</p>
        <div className="focus-actions">{next && <><Button disabled={busy} onClick={() => void act({type: 'activity', id: next.id, done: true})}><Check size={18}/>Concluir atividade</Button><button className="text-link" onClick={() => setDetails(true)}>Ver instruções<ArrowRight size={16}/></button></>}{allDone && <span className="completed-label"><Sparkles size={17}/>Um dia completo. No seu ritmo.</span>}</div>
      </div>
      <div className="focus-progress"><Ring percent={progress.percent} size={126}><strong>{progress.percent}<small>%</small></strong><span>do seu dia</span></Ring><p><strong>{progress.done} de {progress.total}</strong> atividades concluídas</p></div>
    </section>
    <div className="today-columns">
      <div className="column-stack">
        <Panel title="Sua rotina de hoje" icon={ClipboardList} link={{to: '/protocolos', label: 'Ver protocolos'}} className="routine-panel">
          <div className="section-caption"><span>Pequenas ações. Um dia bem cuidado.</span><span>{progress.done}/{progress.total}</span></div>
          {activities.length ? <ActivityList activities={activities}/> : <EmptyState title="Sua rotina está sendo preparada" text="Quando houver atividades atribuídas, você poderá acompanhá-las por aqui."/>}
          <div className="panel-footnote"><span className="tiny-dot"/>Seu progresso fica salvo a cada conclusão.</div>
        </Panel>
        <Panel title="Uma semana de cada vez" icon={Flame} link={{to: '/progresso', label: 'Seu progresso'}} className="consistency-panel">
          <div className="consistency-summary"><div><strong>{streak.current}<span> {streak.current === 1 ? 'dia' : 'dias'} em sequência</span></strong><p>{streak.current ? 'Continue construindo sua rotina.' : 'Seu próximo passo pode começar uma sequência.'}</p></div><span className="subtle-badge">{weekly.done} concluídas na semana</span></div><WeekStrip compact/>
        </Panel>
      </div>
      <div className="column-stack">
        <Panel title="Sua próxima refeição" icon={Utensils} link={{to: '/alimentacao', label: 'Ver plano'}} className="next-meal-panel">
          {nextMeal ? <><button className="meal-image-button" onClick={() => setMealOpen(true)} aria-label={`Ver ${nextMeal.title}`}><img src={nextMeal.image} alt={nextMeal.description}/><span className="meal-time">{nextMeal.time}</span></button><div className="next-meal-copy"><span className="eyebrow">{nextMeal.title}</span><h3>{nextMeal.description}</h3><p>{nextMeal.ingredients.length} ingredientes · {nextMeal.demo ? 'Plano de demonstração' : 'Seu plano'}</p><button className="meal-cta" onClick={() => setMealOpen(true)}>Ver refeição<ArrowUpRightIcon/></button></div></> : <EmptyState title="Tudo em dia por aqui" text="As refeições do seu plano aparecem nesta área."/>}
        </Panel>
        <Link to="/alimentacao/compras" className="shopping-shortcut"><span className="shortcut-icon"><ShoppingBasket size={23}/></span><div><h3>Lista de compras</h3><p>{data.grocery.length ? `${data.grocery.filter(i => !i.checked).length} itens para comprar` : 'Organize as compras da semana'}</p></div><ChevronRight size={19}/></Link>
        <div className="quiet-note"><span className="quiet-note-line"/><p>Uma rotina que funciona<br/><strong>é uma rotina que cabe na sua vida.</strong></p><span>TESTOMAX · NO SEU RITMO</span></div>
      </div>
    </div>
    {details && next && <ActivityDetails activity={next} onClose={() => setDetails(false)}/>}
    {mealOpen && nextMeal && <MealDetails meal={nextMeal} onClose={() => setMealOpen(false)}/>}
  </>
}
function ArrowUpRightIcon() {return <ArrowRight size={17}/>}
