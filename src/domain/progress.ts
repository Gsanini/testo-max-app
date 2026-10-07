import type { Activity } from './types'
import { addDays } from './dates'

export function dayProgress(activities: Activity[], date: string) {
  const items = activities.filter(a => a.date === date)
  const done = items.filter(a => a.done).length
  return {done, total: items.length, percent: items.length ? Math.round(done / items.length * 100) : 0}
}
export function periodProgress(activities: Activity[], start: string, end: string) {
  const items = activities.filter(a => a.date >= start && a.date <= end)
  const done = items.filter(a => a.done).length
  return {done, total: items.length, percent: items.length ? Math.round(done / items.length * 100) : 0}
}
export function streaks(activities: Activity[], today: string) {
  // Um dia conta quando TODAS as atividades atribuídas estão concluídas.
  const dates = [...new Set(activities.filter(a => a.date <= today).map(a => a.date))].sort()
  const complete = new Set(dates.filter(d => {const p = dayProgress(activities, d); return p.total > 0 && p.done === p.total}))
  let cursor = complete.has(today) ? today : addDays(today, -1)
  let current = 0
  while (complete.has(cursor)) { current++; cursor = addDays(cursor, -1) }
  let best = 0, run = 0, last = ''
  for (const date of dates) {
    run = complete.has(date) ? (last === addDays(date, -1) ? run + 1 : 1) : 0
    best = Math.max(best, run); last = date
  }
  return {current, best}
}
