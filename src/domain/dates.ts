export const defaultTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo'
export function dateKey(timezone = defaultTimezone, now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit'}).formatToParts(now)
  const value = (type: string) => parts.find(p => p.type === type)?.value ?? ''
  return `${value('year')}-${value('month')}-${value('day')}`
}
export function addDays(date: string, count: number) {
  const day = new Date(`${date}T12:00:00Z`)
  day.setUTCDate(day.getUTCDate() + count)
  return day.toISOString().slice(0, 10)
}
export function weekday(date: string) { return new Date(`${date}T12:00:00Z`).getUTCDay() }
export function weekDays(date: string) {
  const monday = addDays(date, -((weekday(date) + 6) % 7))
  return Array.from({length: 7}, (_, i) => addDays(monday, i))
}
export function formatDate(date: string, options: Intl.DateTimeFormatOptions = {day: 'numeric', month: 'long'}) {
  return new Intl.DateTimeFormat('pt-BR', {...options, timeZone: 'UTC'}).format(new Date(`${date}T12:00:00Z`))
}
