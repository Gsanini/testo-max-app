import type { Activity, Workspace } from './types'
import { addDays } from './dates'
import { chapters } from '@/content/journey'

export const JOURNEY_DAYS = 120
export const XP_PER_ACTION = 10
export function daysBetween(from:string,to:string) {return Math.round((Date.parse(`${to}T12:00:00Z`)-Date.parse(`${from}T12:00:00Z`))/86400000)}
export function journeyDay(startDate:string,today:string) {return Math.max(1,Math.min(JOURNEY_DAYS,daysBetween(startDate,today)+1))}
export function chapterForDay(day:number) {return chapters[Math.min(3,Math.max(0,Math.floor((day-1)/30)))]!}
export function unlockDate(startDate:string,day:number) {return addDays(startDate,day-1)}
export function isDayUnlocked(startDate:string,day:number,today:string,unlockedThrough=0) {return Number.isInteger(day) && day>=1 && day<=JOURNEY_DAYS && (day<=unlockedThrough || unlockDate(startDate,day)<=today)}
export function currentDayFor(state:Workspace,today:string) {return state.journey?Math.max(state.journey.unlockedThrough,journeyDay(state.journey.startDate,today)):1}
export function canExecute(activity:Activity,state:Workspace,today:string) {
  return state.profile.onboarded && (activity.journeyDay?Boolean(state.journey && isDayUnlocked(state.journey.startDate,activity.journeyDay,today,state.journey.unlockedThrough)):activity.date<=today)
}
export function missionsForDay(state:Workspace,day:number) {return state.activities.filter(a=>a.journeyDay===day)}
export function dayState(state:Workspace,day:number,today:string):'completed'|'current'|'available'|'locked' {
  if (!state.journey || !isDayUnlocked(state.journey.startDate,day,today,state.journey.unlockedThrough)) return 'locked'
  const activities=missionsForDay(state,day)
  if (activities.length && activities.every(a=>a.done)) return 'completed'
  return day===currentDayFor(state,today)?'current':'available'
}
export const dayStateNames = {completed:'Concluído',current:'Dia atual',available:'Disponível',locked:'Futuro bloqueado'}
export function participation(state:Workspace,today:string) {
  const rows=state.activities.filter(a=>a.journeyDay && canExecute(a,state,today))
  const done=rows.filter(a=>a.done)
  const completeDays=Array.from({length:JOURNEY_DAYS},(_,i)=>i+1).filter(d=>{const items=rows.filter(a=>a.journeyDay===d);return items.length>0&&items.every(a=>a.done)})
  const xp=done.length*XP_PER_ACTION
  const level=Math.floor(xp/200)+1
  return {xp,level,levelProgress:xp%200,actions:done.length,activeDates:[...new Set(done.map(a=>a.date))],completeDays}
}
export const achievementDefinitions = [
  {id:'first',name:'Primeiro passo',description:'Concluir sua primeira missão.',symbol:'spark'},
  {id:'three',name:'Presença em 3 dias',description:'Registrar ao menos uma missão em 3 dias.',symbol:'footprints'},
  {id:'seven',name:'Sete dias de participação',description:'Participar em 7 dias, sem precisar ser seguidos.',symbol:'flame'},
  {id:'fifty',name:'50 escolhas',description:'Concluir 50 missões da jornada.',symbol:'star'},
  ...chapters.map(c=>({id:`chapter-${c.id}`,name:c.name,description:`Concluir os 30 protocolos do capítulo ${c.id}.`,symbol:c.symbol})),
  {id:'hundred',name:'100 dias presentes',description:'Participar em 100 dias da jornada.',symbol:'flag'},
]
export function earnedAchievements(state:Workspace,today:string) {
  const stats=participation(state,today)
  return [stats.actions>=1?'first':null,stats.activeDates.length>=3?'three':null,stats.activeDates.length>=7?'seven':null,stats.actions>=50?'fifty':null,
    ...chapters.map(c=>stats.completeDays.filter(d=>d>=c.start&&d<=c.end).length===30?`chapter-${c.id}`:null),stats.activeDates.length>=100?'hundred':null].filter((id):id is string=>Boolean(id))
}
export function personalizationReasons(state: Pick<Workspace,'profile'>) {
  const p=state.profile
  const context=[p.age?`${p.age} anos`:null,p.weightKg?`${p.weightKg.toLocaleString('pt-BR')} kg`:null].filter(Boolean).join(' · ')
  const wakeFeeling={descansado:'costuma acordar descansado',variavel:'acorda com disposição variável',cansado:'costuma acordar cansado',prefiro_nao_responder:'não informou como costuma acordar'}[p.wakeFeeling]
  const concern={saude:'investigar a própria saúde',sexual:'cuidar da saúde sexual',energia:'recuperar energia',forca:'preservar força e massa muscular',peso:'cuidar do peso',constancia:'manter constância',prefiro_nao_responder:'nenhuma preocupação principal informada'}[p.mainConcern]
  return [`Até ${p.minutes} min para hábitos e movimento por dia; café, almoço e jantar aparecem como passos separados.`,
    `Até 3 sessões de força por semana nos dias escolhidos, com pausas de recuperação. Cardio leve diariamente ${p.location==='academia'?'na academia':p.location==='casa'?'em casa':'ao ar livre'}.`,
    `Receitas de até ${p.cookMinutes} min${p.budget==='economico'?', priorizando ingredientes econômicos':''}, filtradas pelas suas preferências e restrições.`,
    `Cada refeição, hábito e treino recebe um horário sugerido. Sono planejado das ${p.sleepTime} às ${p.wakeTime}${p.sleepQuality==='irregular'?' com um limite mínimo de 7 horas':''}.`,
    `${context?`Contexto informado: ${context}; `:'Contexto físico opcional não informado; '}${wakeFeeling}. Seu foco relatado é ${concern}.`,
    `${p.perceivedChanges.length?`${p.perceivedChanges.length} mudança${p.perceivedChanges.length===1?'':'s'} percebida${p.perceivedChanges.length===1?'':'s'} registrada${p.perceivedChanges.length===1?'':'s'}`:'Nenhuma mudança percebida registrada'}; esse relato serve para reflexão e não equivale a um diagnóstico.`,
    ...(p.testosteroneReason==='sintomas'||p.perceivedChanges.length?['Vale conversar com um profissional']:[])]
}
