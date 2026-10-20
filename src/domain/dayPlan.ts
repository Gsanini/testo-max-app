import type { Activity } from './types'

export const dayPeriods = [
  { id: 'manha', label: 'Manhã', range: '05h – 12h' },
  { id: 'tarde', label: 'Tarde', range: '12h – 18h' },
  { id: 'noite', label: 'Noite', range: '18h – 05h' },
] as const
export type DayPeriod = typeof dayPeriods[number]['id']

export function periodForTime(time: string): DayPeriod {
  const hour = Number(time.split(':')[0])
  return hour >= 5 && hour < 12 ? 'manha' : hour >= 12 && hour < 18 ? 'tarde' : 'noite'
}

export function localTime(timezone: string, now = new Date()) {
  return new Intl.DateTimeFormat('en-GB', { timeZone: timezone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(now)
}

const dailyOrder = ['journey:food:breakfast','journey:routine','journey:movement','journey:food','journey:cardio','journey:food:dinner','journey:sleep']

export function sortDailyActivities(activities: Activity[]) {
  return [...activities].sort((a,b) => {
    const aOrder=dailyOrder.indexOf(a.templateId),bOrder=dailyOrder.indexOf(b.templateId)
    return (aOrder<0?dailyOrder.length:aOrder)-(bOrder<0?dailyOrder.length:bOrder) || a.time.localeCompare(b.time)
  })
}

export function nextActivity(activities: Activity[], time: string, preferredPeriod?: DayPeriod) {
  const ordered=sortDailyActivities(activities)
  const dueMeal=ordered.filter(activity=>activity.role==='alimentacao'&&activity.time<=time).sort((a,b)=>a.time.localeCompare(b.time)).at(-1)
  if(dueMeal&&!dueMeal.done)return dueMeal
  const flexible=ordered.filter(activity=>!activity.done&&activity.role!=='alimentacao')
  const due=flexible.filter(activity=>activity.time<=time).sort((a,b)=>a.time.localeCompare(b.time))
  const dueWorkout=due.find(activity=>activity.role==='treino')
  const dueCardio=due.find(activity=>activity.role==='cardio')
  if(dueWorkout&&dueCardio&&dueWorkout.time<=dueCardio.time)return dueWorkout
  if(due.length)return due.at(-1)
  if(preferredPeriod===periodForTime(time)){
    const preferred=flexible.find(activity=>activity.role==='treino'||activity.role==='cardio')
    if(preferred)return preferred
  }
  return [...flexible].sort((a,b)=>a.time.localeCompare(b.time))[0]??ordered.find(activity=>!activity.done)
}
