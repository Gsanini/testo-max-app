import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, ChevronRight, ShoppingBasket, Utensils, Info } from 'lucide-react'
import { useWorkspace } from '@/app/providers'
import { MealDetails, EmptyState, PageHeading, Panel } from '@/components/common'
import { Button } from '@/components/ui/button'
import type { Meal } from '@/domain/types'
import { addDays, formatDate } from '@/domain/dates'
import { cn } from '@/lib/utils'

export default function NutritionPage() {
  const {data, today, act, busy} = useWorkspace()
  const [date, setDate] = useState(today)
  const [selected, setSelected] = useState<Meal | null>(null)
  const meals = data.meals.filter(m => m.date === date).sort((a,b) => a.time.localeCompare(b.time))
  const actual = meals.find(m => m.id === selected?.id) ?? selected
  const withNutrition = meals.filter(m => m.nutrition)
  const totals = (consumed: boolean) => withNutrition.filter(m => !consumed || m.done).reduce((sum,m) => ({calories: sum.calories + m.nutrition!.calories, protein: sum.protein + m.nutrition!.protein, carbs: sum.carbs + m.nutrition!.carbs, fat: sum.fat + m.nutrition!.fat}), {calories: 0, protein: 0, carbs: 0, fat: 0})
  const planned = totals(false), consumed = totals(true)
  return <><PageHeading eyebrow="ESPAÇO PARA SE NUTRIR" title="Alimentação" description="Suas refeições organizadas. Uma decisão a menos no dia." action={<Button asChild variant="secondary"><Link to="/alimentacao/compras"><ShoppingBasket size={18}/>Lista de compras</Link></Button>}/>
    <div className="nutrition-toolbar"><div className="inline-label"><Utensils size={19}/><h2>Refeições do dia</h2><span className="subtle-badge">{meals.filter(m => m.done).length} de {meals.length} registradas</span></div><label className="sr-only" htmlFor="meal-date">Dia das refeições</label><select id="meal-date" value={date} onChange={e => setDate(e.target.value)}>{Array.from({length: 8}, (_,i) => addDays(today,i)).map(d => <option key={d} value={d}>{d === today ? 'Hoje' : formatDate(d, {weekday: 'short', day: 'numeric', month: 'short'})}</option>)}</select></div>
    {withNutrition.length > 0 && <Panel title="Valores cadastrados no plano"><p className="muted">Consumido / planejado{withNutrition.length !== meals.length && ' · apenas refeições com dados nutricionais cadastrados'}</p><div className="macro-grid">{([{key: 'calories', label: 'Energia', unit: 'kcal'}, {key: 'protein', label: 'Proteínas', unit: 'g'}, {key: 'carbs', label: 'Carboidratos', unit: 'g'}, {key: 'fat', label: 'Gorduras', unit: 'g'}] as const).map(item => <div key={item.key}><span>{item.label}</span><strong>{consumed[item.key]} <small>/ {planned[item.key]} {item.unit}</small></strong></div>)}</div></Panel>}
    {meals.length ? <div className="meal-grid">{meals.map((meal, i) => <article className={cn('meal-card', meal.done && 'meal-done')} key={meal.id}><button className="meal-card-photo" onClick={() => setSelected(meal)} aria-label={`Detalhes de ${meal.title}`}><img src={meal.image} alt={meal.description} loading={i > 1 ? 'lazy' : 'eager'}/><span className="meal-time">{meal.time}</span>{meal.done && <span className="meal-done-badge"><Check size={14}/>Registrada</span>}</button><div className="meal-card-content"><div className="eyebrow">{meal.title}</div><h2>{meal.description}</h2><p>{meal.ingredients.map(i => i.name).join(' · ')}</p><div className="meal-card-actions"><button className="text-link" onClick={() => setSelected(meal)}>Ingredientes e preparo<ChevronRight size={15}/></button><Button size="icon" variant={meal.done ? 'secondary' : 'outline'} aria-label={`${meal.done ? 'Desfazer' : 'Registrar'} ${meal.title}`} disabled={busy || date > today} onClick={() => void act({type: 'meal', id: meal.id, done: !meal.done})}><Check size={18}/></Button></div></div></article>)}</div> : <EmptyState title="Seu plano ainda não foi disponibilizado" text="Quando houver refeições atribuídas, você encontrará aqui os ingredientes e o modo de preparo."/>}
    <div className="nutrition-note"><Info size={18}/><p>{meals.some(m => m.demo) ? 'Refeições de demonstração, sem prescrição individualizada. ' : ''}{withNutrition.length === 0 ? 'Calorias e macronutrientes serão exibidos quando houver valores validados no plano.' : 'Os valores consumidos incluem apenas as refeições que você registrou.'}</p></div>
    {actual && <MealDetails meal={actual} onClose={() => setSelected(null)}/>}
  </>
}
