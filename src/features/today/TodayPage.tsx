import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Check, ChevronRight, Clock3, Compass, LockKeyhole, Sparkles, Target, Trophy } from 'lucide-react'
import { useWorkspace } from '@/app/providers'
import { ActivityDetails, ActivityList, PageHeading } from '@/components/common'
import { Button } from '@/components/ui/button'
import { chapters, protocols } from '@/content/journey'
import { chapterForDay, daysBetween, isDayUnlocked, currentDayFor, missionsForDay, participation, personalizationReasons, unlockDate } from '@/domain/journey'
import { formatDate, weekDays } from '@/domain/dates'
import type { Activity } from '@/domain/types'

export default function TodayPage() {
  const {data,today,act,busy}=useWorkspace()
  const [params]=useSearchParams()
  const [selected,setSelected]=useState<Activity|null>(null)
  const [reasons,setReasons]=useState(false)
  const journey=data.journey!
  const current=currentDayFor(data,today)
  const requested=Number(params.get('dia'))
  const day=Number.isInteger(requested)&&requested>=1&&requested<=120?requested:current
  const protocol=protocols[day-1]!
  const chapter=chapterForDay(day)
  const unlocked=isDayUnlocked(journey.startDate,day,today,journey.unlockedThrough)
  const missions=missionsForDay(data,day).sort((a,b)=>a.time.localeCompare(b.time))
  const completed=missions.filter(a=>a.done).length
  const complete=completed===missions.length&&missions.length>0
  const stats=participation(data,today)
  const priority=data.profile.goal==='alimentacao'?'alimentacao':data.profile.goal==='energia'?'movimento':data.profile.goal==='forca'?'movimento':'bem-estar'
  const next=missions.find(a=>!a.done&&a.category===priority)??missions.find(a=>!a.done)
  const week=weekDays(today)
  const weekCount=stats.activeDates.filter(d=>d>=week[0]!&&d<=today).length
  const actual=missions.find(a=>a.id===selected?.id)??selected
  const ended=day>=120
  return <>
    <PageHeading eyebrow="SUA ROTINA. SUA EVOLUÇÃO." title={day===current?'Seu próximo passo começa aqui.':`Um passo da sua história.`} description={day===current?formatDate(today,{weekday:'long',day:'numeric',month:'long'}):`Você está revisitando o dia ${day}.`} action={<Link className="level-pill" to="/progresso"><Sparkles size={16}/>Nível {stats.level}<span>{stats.xp} XP</span></Link>}/>
    {journey.migrated&&!journey.transitionSeen&&<section className="transition-note"><Compass size={24}/><div><h2>Uma nova jornada, com sua história preservada.</h2><p>Seus registros anteriores continuam em Progresso. A nova experiência começou em {formatDate(journey.startDate)}. Confira suas preferências para adaptar as novas missões.</p><div className="inline-actions"><Link className="text-link" to="/perfil">Revisar preferências<ChevronRight size={16}/></Link><Button variant="ghost" disabled={busy} onClick={()=>void act({type:'acknowledgeTransition'})}>Entendi, vamos continuar</Button></div></div></section>}
    <section className={`journey-hero chapter-${chapter.id}`}>
      <div className="hero-image" aria-hidden="true"/>
      <div className="hero-content"><div className="chapter-kicker"><span>CAPÍTULO {String(chapter.id).padStart(2,'0')}</span><span>DIA {day} DE 120</span></div><h2>{chapter.name}<span>.</span></h2><p className="hero-focus">{protocol.focus}</p><div className="hero-track"><span style={{width:`${(day-chapter.start+1)/30*100}%`}}/></div><div className="hero-foot"><span>{day-chapter.start+1} / 30 dias neste capítulo</span><Link to="/jornada">Ver jornada<ArrowRight size={16}/></Link></div></div>
      <div className="hero-day" aria-hidden="true"><span>DIA</span><strong>{String(day).padStart(2,'0')}</strong><span>{protocol.title}</span></div>
    </section>
    {!unlocked?<section className="next-action"><LockKeyhole size={28}/><div><span className="eyebrow">PRÉVIA DO PROTOCOLO</span><h2>{protocol.title}</h2><p>Disponível em {formatDate(unlockDate(journey.startDate,day))}, à meia-noite ({data.profile.timezone}).</p></div><Button asChild><Link to="/">Voltar ao dia atual</Link></Button></section>:<>
      {daysBetween(journey.lastVisit,today)>1&&day===current&&<p className="return-note">Pode seguir por hoje. As etapas anteriores continuam disponíveis, sem precisar compensar o que ficou para trás.</p>}
      <section className={`next-action ${complete?'day-celebration':''}`}>
        <span className="next-action-symbol">{complete?<Check size={28}/>:<Sparkles size={25}/>}</span><div><span className="eyebrow">{complete?'MAIS UM DIA REGISTRADO':'SUA PRÓXIMA AÇÃO'}</span><h2>{complete?'Você fez espaço para cuidar de você.':next?.title}</h2><p>{complete?`${completed*10} XP de participação neste dia. ${day<120?'O próximo dia segue o calendário da jornada.':'Seu histórico e suas receitas continuam aqui.'}`:next?.purpose}</p>{next&&<span className="action-meta"><Clock3 size={14}/>{next.minutes} min<span>+10 XP ao concluir</span></span>}</div>{next&&<Button onClick={()=>setSelected(next)}>Começar missão<ArrowRight size={17}/></Button>}
      </section>
      <div className="journey-home-columns"><section className="panel mission-panel"><div className="panel-heading"><div><span className="eyebrow">UM PASSO DE CADA VEZ</span><h2>Suas missões {day===current?'de hoje':`do dia ${day}`}</h2></div><span className="mission-count">{completed}<span> / {missions.length}</span></span></div><progress className="native-progress" max={missions.length||1} value={completed} aria-label={`${completed} de ${missions.length} missões concluídas`}/><ActivityList activities={missions}/><button className="text-link personalization-toggle" aria-expanded={reasons} onClick={()=>setReasons(!reasons)}>Por que essa rotina?<ChevronRight size={15}/></button>{reasons&&<ul className="reason-list">{personalizationReasons(data).map(r=><li key={r}><Check size={16}/>{r}</li>)}</ul>}</section>
      <aside className="column-stack"><section className="weekly-goal"><span className="section-icon"><Target size={21}/></span><span className="eyebrow">SUA META DA SEMANA</span><h2>{weekCount}<span> / {data.profile.weeklyGoal} dias</span></h2><p>Com pelo menos uma missão registrada. Cada dia de participação conta.</p><div className="week-presence">{week.map(d=><span key={d} className={stats.activeDates.includes(d)?'present':''} aria-label={`${formatDate(d)}: ${stats.activeDates.includes(d)?'participou':'sem registro'}`}><small>{formatDate(d,{weekday:'short'}).slice(0,1)}</small><span>{stats.activeDates.includes(d)?<Check size={13}/>:<i/>}</span></span>)}</div><Link className="text-link" to="/progresso">Ver minha evolução<ArrowRight size={15}/></Link></section><Link className="food-shortcut" to="/alimentacao"><span><span className="eyebrow">MENOS IMPROVISO</span><strong>Sua semana à mesa</strong><small>Receitas e compras já disponíveis.</small></span><ArrowRight size={20}/></Link></aside></div>
    </>}
    {stats.completeDays.filter(d=>d>=chapter.start&&d<=chapter.end).length===30&&<div className="chapter-celebration" role="status"><Trophy size={26}/><div><h2>{chapter.name}: 30 dias concluídos.</h2><p>Uma conquista que faz parte da sua história.</p></div></div>}
    <section className="next-preview"><span className="preview-number">{ended?'✓':String(Math.min(120,day+1)).padStart(2,'0')}</span><div><span className="eyebrow">{ended?'O CAMINHO CONTINUA':'NO PRÓXIMO PASSO'}</span><h2>{ended?'Leve sua rotina com você.':protocols[Math.min(119,day)]!.title}</h2><p>{ended?'Revise os hábitos que quer manter. Você pode consultar todos os dias e continuar planejando suas refeições.':protocols[Math.min(119,day)]!.focus}</p><small>{day<120?`${isDayUnlocked(journey.startDate,day+1,today,journey.unlockedThrough)?'Já disponível':'Liberação'} · ${formatDate(unlockDate(journey.startDate,day+1))} · 00:00 · ${data.profile.timezone}`:'Os 120 dias permanecem acessíveis.'}</small></div><Link className="icon-button" to="/jornada" aria-label="Explorar os próximos passos"><ArrowRight size={21}/></Link></section>
    {day===chapter.end&&chapter.id<4&&<p className="chapter-teaser">{chapters[chapter.id-1]!.preview}</p>}
    {actual&&<ActivityDetails activity={actual} onClose={()=>setSelected(null)}/>}
  </>
}
