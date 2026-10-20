import { Sun, Dumbbell, Droplets, BookOpen, Moon, Heart, Check, ChevronRight, Clock3, ArrowUpRight, LoaderCircle, CircleAlert, CalendarDays, ClipboardList, PersonStanding, Utensils, LockKeyhole, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Button } from './ui/button'
import { Dialog } from './ui/dialog'
import { useWorkspace } from '@/app/providers'
import type { Activity, Category, Meal } from '@/domain/types'
import { dayProgress } from '@/domain/progress'
import { formatDate, weekDays } from '@/domain/dates'
import { canExecute } from '@/domain/journey'
import { recipeForMeal } from '@/domain/nutrition'
import { RecipeContent } from '@/features/nutrition/RecipeContent'

export const categoryNames: Record<Category, string> = {movimento: 'Movimento', alimentacao: 'Alimentação', sono: 'Sono', 'bem-estar': 'Bem-estar'}
export const activityRoleNames: Record<NonNullable<Activity['role']>,string> = {habito:'Hábito',treino:'Treino',cardio:'Cardio',alimentacao:'Alimentação',sono:'Sono'}
export const activityName = (activity:Activity) => activity.role === 'treino' && !activity.exercises.length ? 'Recuperação' : activity.role ? activityRoleNames[activity.role] : categoryNames[activity.category]
const icons: Record<string, LucideIcon> = {sun: Sun, dumbbell: Dumbbell, droplet: Droplets, book: BookOpen, moon: Moon, clipboard: ClipboardList, stretch: PersonStanding, utensils: Utensils}
export function ActivityIcon({name, className}: {name: string; className?: string}) {const Icon = icons[name] ?? Heart; return <Icon className={className} size={21} strokeWidth={1.7}/>}
export function Brand({small = false}: {small?: boolean}) {return <span className={cn('brand', small && 'brand-small')}>TESTO<span>MAX</span><i/></span>}
export function PageHeading({eyebrow, title, description, action}: {eyebrow?: string; title: string; description: string; action?: ReactNode}) {
  return <header className="page-heading"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1><p>{description}</p></div>{action}</header>
}
export function Panel({title, icon: Icon, link, children, className}: {title: string; icon?: LucideIcon; link?: {to: string; label: string}; children: ReactNode; className?: string}) {
  return <section className={cn('panel', className)}><div className="panel-heading"><h2>{Icon && <Icon size={19}/>} {title}</h2>{link && <Link className="text-link" to={link.to}>{link.label}<ChevronRight size={15}/></Link>}</div>{children}</section>
}
export function EmptyState({title, text, icon: Icon = CalendarDays, children}: {title: string; text: string; icon?: LucideIcon; children?: ReactNode}) {
  return <div className="empty-state"><span className="empty-icon"><Icon size={28}/></span><h3>{title}</h3><p>{text}</p>{children}</div>
}
export function Loading() {return <div className="loading-screen" role="status"><Brand/><LoaderCircle className="spin"/><p>Preparando sua rotina…</p></div>}
export function ErrorState({retry}: {retry: () => void}) {return <EmptyState title="Não conseguimos carregar seus dados" text="Seus registros continuam salvos. Confira a conexão e tente novamente." icon={CircleAlert}><Button onClick={retry}>Tentar novamente</Button></EmptyState>}
export function Ring({percent, size = 112, children}: {percent: number; size?: number; children: ReactNode}) {
  return <div className="progress-ring" style={{width: size, height: size}}><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="51" className="ring-track"/><circle cx="60" cy="60" r="51" className="ring-value" strokeDasharray={`${Math.min(100, Math.max(0, percent)) * 3.2044} 320.44`}/></svg><div className="ring-label">{children}</div></div>
}
export function WeekStrip({selected, onSelect, compact = false}: {selected?: string; onSelect?: (date: string) => void; compact?: boolean}) {
  const {today, data} = useWorkspace()
  return <div className={cn('week-strip', compact && 'week-compact')}>{weekDays(selected ?? today).map(date => {
    const progress = dayProgress(data.activities, date)
    const locked = date > today && !data.activities.some(activity => activity.date === date && canExecute(activity, data, today))
    const complete = progress.total > 0 && progress.done === progress.total
    const inner = <><span>{formatDate(date, {weekday: 'short'}).replace('.', '')}</span><span className={cn('day-number', complete && !locked && 'day-complete', date === today && 'day-today')}>{locked ? <LockKeyhole size={16}/> : complete ? <Check size={16}/> : Number(date.slice(-2))}</span>{!compact && <span className={cn('day-dot', progress.done > 0 && !locked && 'has-progress')}/>}</>
    return onSelect ? <button key={date} disabled={locked} onClick={() => onSelect(date)} className={cn('week-day', selected === date && 'selected')} aria-label={`${formatDate(date, {weekday: 'long', day: 'numeric', month: 'long'})}${locked ? ': bloqueado' : ''}`} aria-pressed={selected === date}>{inner}</button> : <div key={date} className="week-day" aria-label={locked ? `${formatDate(date)}: bloqueado` : `${formatDate(date)}: ${progress.done} de ${progress.total} concluídas`}>{inner}</div>
  })}</div>
}
export function ActivityList({activities}: {activities: Activity[]}) {
  const {act, busy, today, data} = useWorkspace()
  const [selected, setSelected] = useState<Activity | null>(null)
  const available = activities.filter(activity => canExecute(activity, data, today))
  const actual = available.find(a => a.id === selected?.id)
  return <><div className="activity-list">{available.map(activity => <div className={cn('activity-row', activity.done && 'is-done')} key={activity.id}>
    <button className="completion" aria-label={`${activity.done ? 'Desfazer' : 'Concluir'} ${activity.title}`} aria-pressed={activity.done} disabled={busy || !canExecute(activity,data,today)} onClick={() => void act({type: 'activity', id: activity.id, done: !activity.done})}>{activity.done && <Check size={17} strokeWidth={3}/>}</button>
    <span className={`activity-symbol symbol-${activity.icon}`}><ActivityIcon name={activity.icon}/></span>
    <button className="activity-detail" aria-label={`Abrir detalhes de ${activity.title}`} onClick={() => setSelected(activity)}><strong>{activity.title}</strong><span>{activityName(activity)}<i/> {activity.minutes} min</span></button>
    <span className="activity-time">{activity.time}</span><button className="icon-button row-arrow" aria-label={`Detalhes de ${activity.title}`} onClick={() => setSelected(activity)}><ChevronRight size={17}/></button>
  </div>)}</div>{actual && <ActivityDetails activity={actual} onClose={() => setSelected(null)}/>}</>
}
export function ActivityDetails({activity, onClose}: {activity: Activity; onClose: () => void}) {
  const {act, busy, today, data} = useWorkspace()
  const [time, setTime] = useState(activity.time)
  if (!canExecute(activity, data, today)) return <Dialog open onOpenChange={open => {if (!open) onClose()}} title="Passo bloqueado" description="Este passo estará disponível na data indicada."><div className="unlock-notice"><LockKeyhole size={20}/><p>Volte à rotina de hoje para continuar.</p></div></Dialog>
  return <Dialog open onOpenChange={open => {if (!open) onClose()}} title={activity.title} description={activity.role==='alimentacao' ? `${activityName(activity)} · ${activity.time}` : `${activityName(activity)} · ${activity.time} · ${activity.minutes} minutos`}>
    {activity.demo && <div className="demo-note">Conteúdo de demonstração. Adapte sua rotina com orientação profissional quando necessário.</div>}
    <ol className="instruction-list">{activity.instructions.map((text, i) => <li key={i}>{text}</li>)}</ol>
    {activity.purpose && <div className="mission-purpose"><h3>Por que fazer</h3><p>{activity.purpose}</p></div>}
    {activity.alternative && <div className="mission-alternative"><h3>Se hoje precisar ser diferente</h3><p>{activity.alternative}</p></div>}
    {activity.category==='alimentacao'&&<Link className="text-link" to="/alimentacao">Abrir refeições e receitas<ChevronRight size={16}/></Link>}
    {activity.exercises.length > 0 && <div className="exercise-list">{activity.exercises.map((exercise, i) => <div key={i}><span className="exercise-number">{String(i+1).padStart(2,'0')}</span><div><h3>{exercise.name}</h3><p>{exercise.sets} séries · {exercise.reps} repetições · {exercise.rest} de descanso</p><small>{exercise.note}</small></div></div>)}</div>}
    {activity.editable && !activity.journeyDay && activity.date >= today && canExecute(activity,data,today) && <form className="time-form" onSubmit={async event => {event.preventDefault(); await act({type: 'time', id: activity.id, time})}}><label htmlFor="activity-time">Horário desta atividade<input id="activity-time" type="time" required value={time} onChange={e => setTime(e.target.value)}/></label><Button variant="secondary" disabled={busy || time === activity.time} type="submit">Salvar horário</Button></form>}
    <Button className="full-width" disabled={busy || !canExecute(activity,data,today)} onClick={async () => {if (await act({type: 'activity', id: activity.id, done: !activity.done})) onClose()}}><Check size={18}/>{!canExecute(activity,data,today) ? 'Disponível na data da atividade' : activity.done ? 'Desfazer conclusão' : 'Marcar como concluída'}</Button>
  </Dialog>
}
export function MealDetails({meal, onClose}: {meal: Meal; onClose: () => void}) {
  const {act, busy, today} = useWorkspace()
  const recipe = recipeForMeal(meal)
  return <Dialog open onOpenChange={open => {if (!open) onClose()}} title={recipe?.name ?? meal.title} description={`${meal.time} · ${meal.description}`}>
    {meal.demo && <div className="demo-note">Refeição ilustrativa. As quantidades não representam uma prescrição nutricional individualizada.</div>}
    {recipe ? <RecipeContent recipe={recipe}/> : <><h3 className="section-label">Ingredientes</h3><ul className="ingredient-list">{meal.ingredients.map((i, n) => <li key={n}><span>{i.name}</span><strong>{i.quantity.toLocaleString('pt-BR')} {i.unit}</strong></li>)}</ul>
    <h3 className="section-label">Modo de preparo</h3><ol className="instruction-list">{meal.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
    </>}{meal.substitutions.length > 0 && <><h3 className="section-label">Substituições cadastradas</h3>{meal.substitutions.map(s => <p className="muted copy" key={s}>{s}</p>)}</>}
    {meal.nutrition && <p className="nutrition-line">Planejado: {meal.nutrition.calories} kcal · P {meal.nutrition.protein} g · C {meal.nutrition.carbs} g · G {meal.nutrition.fat} g</p>}
    <Button className="full-width" disabled={busy || meal.date > today} onClick={async () => {if (await act({type: 'meal', id: meal.id, done: !meal.done})) onClose()}}><Check size={18}/>{meal.date > today ? 'Disponível na data da refeição' : meal.done ? 'Desfazer registro' : 'Registrar refeição realizada'}</Button>
  </Dialog>
}
export function SmallLink({to, children}: {to: string; children: ReactNode}) {return <Link className="text-link" to={to}>{children}<ArrowUpRight size={16}/></Link>}
export function Duration({minutes}: {minutes: number}) {return <span className="duration"><Clock3 size={14}/>{minutes} min</span>}
