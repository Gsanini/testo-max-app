import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronRight,
  Clock3,
  Compass,
  Flame,
  ListChecks,
  LockKeyhole,
  ShoppingCart,
  Trophy,
  Utensils,
} from 'lucide-react'
import { useWorkspace } from '@/app/providers'
import { ActivityDetails, ActivityIcon, PageHeading, activityName } from '@/components/common'
import { RoutineProgress } from '@/components/JourneyProgress'
import { Button } from '@/components/ui/button'
import {
  chapterForDay,
  currentDayFor,
  daysBetween,
  dayState,
  isDayUnlocked,
  JOURNEY_DAYS,
  missionsForDay,
  participation,
  unlockDate,
} from '@/domain/journey'
import { localTime, nextActivity, sortDailyActivities } from '@/domain/dayPlan'
import { formatDate } from '@/domain/dates'
import { recipeForMeal } from '@/domain/nutrition'
import { streaks } from '@/domain/progress'
import { cn } from '@/lib/utils'

const goalMessages = {
  consistencia: 'Hoje você só precisa cumprir o próximo passo.',
  forca: 'Força se constrói com treino, comida e recuperação.',
  energia: 'Organize o básico de hoje para recuperar sua energia.',
  alimentacao: 'Seu plano alimentar já está organizado para hoje.',
} as const

export default function TodayPage() {
  const { data, today, act, busy } = useWorkspace()
  const [params] = useSearchParams()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const journey = data.journey!
  const current = currentDayFor(data, today)
  const requested = Number(params.get('dia'))
  const day = Number.isInteger(requested) && requested >= 1 && requested <= JOURNEY_DAYS ? requested : current
  const unlocked = isDayUnlocked(journey.startDate, day, today, journey.unlockedThrough)
  const chapter = chapterForDay(day)
  const missions = sortDailyActivities(missionsForDay(data, day))
  const completed = missions.filter(activity => activity.done).length
  const complete = completed === missions.length && missions.length > 0
  const time = localTime(data.profile.timezone)
  const next = day === current ? nextActivity(missions, time, data.profile.activityPeriod) : missions.find(activity => !activity.done)
  const mealFocus = next?.role === 'alimentacao'
  const actual = unlocked ? missions.find(activity => activity.id === selectedId) : undefined
  const stats = participation(data, today)
  const streak = streaks(data.activities.filter(activity => activity.journeyDay), today).current
  const visibleStart = Math.min(Math.max(day - 1, 1), JOURNEY_DAYS - 6)
  const visibleDays = Array.from({length: 7}, (_, index) => visibleStart + index)
  const meals = missions.filter(activity => activity.role === 'alimentacao')
  const checkedGroceries = data.grocery.filter(item => item.checked).length
  const totalMinutes = missions.reduce((sum, activity) => sum + activity.minutes, 0)
  const progressPercent = missions.length ? Math.round(completed / missions.length * 100) : 0

  if (!unlocked) return (
    <div className="daily-dashboard">
      <PageHeading eyebrow="UM DIA DE CADA VEZ" title={`Dia ${day} bloqueado`} description="Este conteúdo estará disponível quando chegar o seu dia."/>
      <section className="locked-day-message">
        <span className="locked-emblem"><LockKeyhole size={30}/></span>
        <h2>Seu foco agora é o dia {current}.</h2>
        <p>O dia {day} será liberado em <strong>{formatDate(unlockDate(journey.startDate, day))}</strong>, à meia-noite no fuso {data.profile.timezone}.</p>
        <Button asChild><Link to="/">Voltar ao dia atual<ArrowRight size={17}/></Link></Button>
      </section>
    </div>
  )

  return (
    <div className="daily-dashboard today-redesign">
      <section className="today-hero" aria-labelledby="today-title">
        <div className="today-hero-shade"/>
        <div className="today-hero-copy">
          <span className="eyebrow">{formatDate(today,{weekday:'long',day:'numeric',month:'long'}).toLocaleUpperCase('pt-BR')}</span>
          <h1 id="today-title">{day === current ? <>Olá! <span aria-hidden="true">👋</span></> : `Dia ${day}`}</h1>
          <p>{day === current ? goalMessages[data.profile.goal] : `Consulte os registros e os passos planejados para o dia ${day}.`}</p>
          <div className="today-hero-meta">
            <span>DIA {day} DE {JOURNEY_DAYS}</span>
            <span>CAPÍTULO {String(chapter.id).padStart(2,'0')} · {chapter.name}</span>
          </div>
        </div>
        <div className="today-hero-focus">
          <span>FOCO DE HOJE</span>
          <strong>{chapter.objective}</strong>
          <small>{totalMinutes} min de atividades · refeições com horário</small>
        </div>
      </section>

      {day !== current && <Link className="back-link" to="/">Voltar para a rotina de hoje<ArrowRight size={16}/></Link>}

      <nav className="day-window daily-day-window today-day-window" aria-label="Dias da jornada">
        {visibleDays.map(number => {
          const state = dayState(data,number,today)
          const locked = state === 'locked'
          const content = <><span>{number === current ? 'Hoje' : `Dia ${number}`}</span>{locked ? <LockKeyhole size={14}/> : state === 'completed' ? <Check size={14}/> : <span className="day-window-dot"/>}</>
          return locked
            ? <button key={number} disabled aria-label={`Dia ${number}: bloqueado. Libera em ${formatDate(unlockDate(journey.startDate,number))}`}>{content}</button>
            : <Link key={number} to={number === current ? '/' : `/?dia=${number}`} className={cn(number === day&&'selected',state === 'completed'&&'done')} aria-current={number === day?'step':undefined} aria-label={`Dia ${number}${number === current?': hoje':state === 'completed'?': concluído':': disponível'}`}>{content}</Link>
        })}
      </nav>

      <div className="today-primary-grid">
        <section className="today-protocol" aria-labelledby="today-protocol-title">
          <header className="today-card-heading">
            <div><span className="today-heading-icon"><ListChecks size={19}/></span><div><span className="eyebrow">SEU PLANO DE AÇÃO</span><h2 id="today-protocol-title">Protocolo de hoje</h2><p>Toque no círculo para concluir. Abra a linha para ver como fazer.</p></div></div>
            <div className="today-card-progress"><span>{completed}/{missions.length} concluídos</span><div><i style={{width:`${progressPercent}%`}}/></div></div>
          </header>
          <ol className="day-steps daily-checklist">
            {missions.map((activity,index) => (
              <li className={cn('day-step','activity-row',activity.done&&'is-done',next?.id===activity.id&&'step-next')} key={activity.id}>
                <button className="step-completion" aria-label={`${activity.done?'Desfazer':'Concluir'} ${activity.title}`} aria-pressed={activity.done} disabled={busy} onClick={() => void act({type:'activity',id:activity.id,done:!activity.done})}>
                  {activity.done ? <Check size={19}/> : <span>{index+1}</span>}
                </button>
                <span className={`today-activity-icon symbol-${activity.icon}`} aria-hidden="true"><ActivityIcon name={activity.icon}/></span>
                <button className="step-content" onClick={() => setSelectedId(activity.id)} aria-label={`Abrir detalhes de ${activity.title}`}>
                  <span className="step-meta">
                    <span className={activity.role === 'alimentacao'?'meal-time':'flexible-time'}>{activity.role === 'alimentacao'?`Refeição · ${activity.time}`:`Horário sugerido · ${activity.time}`}</span>
                    {activity.role !== 'alimentacao'&&<span>{activity.minutes} min</span>}
                    <span className="step-role-label">{activityName(activity)}</span>
                    {activity.done ? <span className="step-done-label">Feito</span> : next?.id===activity.id&&<span className="step-next-label">Agora</span>}
                  </span>
                  <strong>{activity.title}</strong>
                  <span className="step-instruction">{activity.instructions[0]}</span>
                </button>
                <button className="today-row-open" aria-label={`Detalhes de ${activity.title}`} onClick={() => setSelectedId(activity.id)}><ChevronRight size={17}/></button>
              </li>
            ))}
          </ol>
        </section>

        <section className={cn('next-action focus-action today-focus-card',complete&&'day-celebration')} aria-labelledby="next-step-title">
          <div className="focus-action-top">
            <span className="focus-kicker">{complete?<Check size={16}/>:<span className="live-dot"/>}{complete?'ROTINA CONCLUÍDA':mealFocus?'REFEIÇÃO DA VEZ':'PRÓXIMO PASSO'}</span>
            <span className="focus-step">{complete?`${completed} de ${missions.length}`:next?.time}</span>
          </div>
          <div className="focus-action-body">
            <span className="focus-symbol">{complete?<Trophy size={30}/>:next?<ActivityIcon name={next.icon}/>:<Check size={28}/>}</span>
            <div>
              <div className="focus-period">{complete?'DIA FINALIZADO':mealFocus?'REFEIÇÃO PROGRAMADA':'FAÇA AGORA'}</div>
              <h2 id="next-step-title">{complete?'Tudo feito por hoje. Muito bem!':next?.title??'Sua rotina está sendo preparada.'}</h2>
              <p>{complete?day<JOURNEY_DAYS?'Seu progresso está salvo. Amanhã um novo dia será liberado.':'Você concluiu sua jornada. Continue acompanhando sua evolução.':next?.instructions[0]}</p>
              {next&&<span className="action-meta"><Clock3 size={15}/>{mealFocus?next.time:`${next.minutes} min`}<span>{activityName(next)}</span></span>}
              {next?<Button onClick={() => setSelectedId(next.id)}>Ver passo a passo<ArrowRight size={18}/></Button>:complete?<Button variant="secondary" asChild><Link to="/progresso">Ver meu progresso<ArrowRight size={17}/></Link></Button>:null}
            </div>
          </div>
          <div className="today-focus-mantra"><strong>DISCIPLINA</strong><span>é fazer o básico mesmo quando o dia muda.</span></div>
        </section>
      </div>

      <div className="today-food-grid">
        <section className="today-meals-card" aria-labelledby="today-meals-title">
          <header className="today-section-heading"><div><Utensils size={19}/><div><span className="eyebrow">PLANO ALIMENTAR</span><h2 id="today-meals-title">Refeições de hoje</h2></div></div><Link to="/alimentacao">Ver plano completo<ChevronRight size={15}/></Link></header>
          <div className="today-meal-list">
            {meals.map(activity => {
              const meal = data.meals.find(item => item.id === activity.mealId)
              return <button key={activity.id} onClick={() => setSelectedId(activity.id)} aria-label={`Abrir detalhes de ${activity.title}`}>
                <span className="today-meal-icon" aria-hidden="true"><Utensils size={22}/></span>
                <div><span>{meal?.title??activityName(activity)}</span><strong>{meal?.description??activity.title}</strong><small>{meal ? recipeForMeal(meal)?.sourcePortions ?? meal.ingredients.map(item=>`${item.name} ${item.quantity} ${item.unit}`).join('; ') : ''}</small></div>
                <time>{activity.time}</time><ChevronRight size={16}/>
              </button>
            })}
          </div>
        </section>

        <section className="today-shopping-card" aria-labelledby="today-shopping-title">
          <div className="today-shopping-image"/>
          <header><ShoppingCart size={19}/><span className="eyebrow">LISTA DE MERCADO</span></header>
          <div className="today-shopping-copy"><h2 id="today-shopping-title">Sua semana já está organizada.</h2><p>{data.grocery.length} itens calculados pelo seu cardápio. {checkedGroceries ? `${checkedGroceries} já marcados.` : 'Pronta para usar.'}</p></div>
          <Link to="/alimentacao/compras">Ver lista pronta<ChevronRight size={16}/></Link>
        </section>
      </div>

      <section className="today-progress-section" aria-labelledby="today-progress-title">
        <header className="today-section-heading"><div><BarChart3 size={19}/><div><span className="eyebrow">SUA EVOLUÇÃO</span><h2 id="today-progress-title">Progresso direto ao ponto</h2></div></div><Link to="/progresso">Ver detalhes<ChevronRight size={15}/></Link></header>
        <div className="today-progress-layout">
          <RoutineProgress day={day}/>
          <article className="today-streak-card">
            <Flame size={29}/><span className="eyebrow">SEQUÊNCIA ATUAL</span><strong>{streak}<small>{streak===1?' dia':' dias'}</small></strong>
            <p>{streak?'Continue fazendo pelo menos uma escolha por dia.':'Sua sequência começa com a primeira conclusão de hoje.'}</p>
            <div className="level-pill">Nível {stats.level}<span>{stats.xp} XP</span></div>
          </article>
        </div>
      </section>

      {journey.migrated&&!journey.transitionSeen&&<section className="transition-note"><Compass size={24}/><div><h2>Uma nova jornada, com sua história preservada.</h2><p>Seus registros anteriores continuam em Progresso. Confira suas preferências para adaptar as novas missões.</p><div className="inline-actions"><Link className="text-link" to="/perfil">Revisar preferências<ChevronRight size={16}/></Link><Button variant="ghost" disabled={busy} onClick={() => void act({type:'acknowledgeTransition'})}>Entendi, vamos continuar</Button></div></div></section>}
      {daysBetween(journey.lastVisit,today)>1&&day===current&&<p className="return-note">Pode seguir por hoje. Seus registros anteriores continuam no histórico.</p>}
      {actual&&<ActivityDetails key={actual.id} activity={actual} onClose={() => setSelectedId(null)}/>}
    </div>
  )
}
