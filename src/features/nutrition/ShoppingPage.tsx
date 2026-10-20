import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Check, Pencil, Plus, ShoppingBasket, Trash2 } from 'lucide-react'
import { useWorkspace } from '@/app/providers'
import { EmptyState, PageHeading } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { grocerySchema, type GroceryItem } from '@/domain/types'
import { addDays, formatDate } from '@/domain/dates'
import { groceryPresentation, ingredientSourceKey } from '@/domain/grocery'
import { cn } from '@/lib/utils'

export default function ShoppingPage() {
  const {data, act, busy} = useWorkspace()
  const [editing, setEditing] = useState<GroceryItem | 'new' | null>(null)
  const [removing, setRemoving] = useState<GroceryItem | null>(null)
  const categories = [...new Set(data.grocery.map(i => i.category))].sort()
  const checked = data.grocery.filter(i => i.checked).length
  const dietLabel = 'Cardápio de 120 dias'
  const restrictionCount = data.profile.allergies.length + data.profile.excludedIngredients.length
  const plannedMeals = data.shoppingRange ? data.meals.filter(meal=>meal.recipeId&&meal.date>=data.shoppingRange!.start&&meal.date<addDays(data.shoppingRange!.start,data.shoppingRange!.days)) : []
  const sources = new Map<string,{count:number;recipes:string[]}>()
  for(const meal of plannedMeals) {
    const seen = new Set<string>()
    for(const ingredient of meal.ingredients) {
      const key=ingredientSourceKey(ingredient.name,ingredient.unit)
      if(seen.has(key))continue
      seen.add(key)
      const source=sources.get(key)??{count:0,recipes:[]}
      source.count++
      if(!source.recipes.includes(meal.description))source.recipes.push(meal.description)
      sources.set(key,source)
    }
  }
  return <><Link to="/bonus" className="back-link"><ArrowLeft size={16}/>Bônus</Link><PageHeading eyebrow="BÔNUS 02 · ORGANIZE SUAS COMPRAS" title="Lista de Compras do Homem" description="Sua lista já está pronta, calculada a partir do cardápio personalizado pelas respostas do quiz." action={<Button onClick={() => setEditing('new')}><Plus size={18}/>Adicionar item</Button>}/>
    <section className="shopping-generator shopping-ready panel" aria-label="Como esta lista foi personalizada"><span className="shortcut-icon"><ShoppingBasket size={24}/></span><div><span className="eyebrow"><Check size={13}/>LISTA GERADA AUTOMATICAMENTE</span><h2>{plannedMeals.length} refeições planejadas para os próximos 7 dias</h2><p>Os ingredientes foram somados a partir das porções planejadas. Carnes, frango e acompanhamentos são pesados prontos para comer.</p></div><ul className="shopping-profile"><li>{dietLabel}</li><li>Porções para 1 pessoa</li><li>{restrictionCount ? `${restrictionCount} restrição${restrictionCount === 1 ? '' : 'ões'} aplicada${restrictionCount === 1 ? '' : 's'}` : 'Sem restrições informadas'}</li></ul></section>
    {data.shoppingRange && <div className="shopping-range"><p>Lista para {formatDate(data.shoppingRange.start)} a {formatDate(addDays(data.shoppingRange.start,data.shoppingRange.days-1))} · Atualizada automaticamente quando você altera o quiz ou troca uma refeição.</p><p><strong>Como ler:</strong> a quantidade é o total das refeições que usam aquele item, não uma porção para todos os sete dias.</p></div>}
    {data.grocery.length > 0 && <div className="shopping-progress"><span>{checked} de {data.grocery.length} itens comprados</span><div className="progress-track"><span style={{width: `${checked / data.grocery.length * 100}%`}}/></div></div>}
    {categories.length ? <div className="grocery-grid">{categories.map(category => <section className="panel grocery-category" key={category}><div className="panel-heading"><h2>{category}</h2><span className="count-badge">{data.grocery.filter(i => i.category === category).length}</span></div>{data.grocery.filter(i => i.category === category).map(item => {const display=groceryPresentation(item);const source=item.sourceKey?sources.get(item.sourceKey):undefined;return <div className={cn('grocery-row', item.checked && 'is-checked')} key={item.id}><button className="grocery-checkbox" aria-label={`${item.checked ? 'Desmarcar' : 'Comprar'} ${display.name}`} aria-pressed={item.checked} disabled={busy} onClick={() => void act({type: 'groceries', items: [{...item, checked: !item.checked}]})}>{item.checked && <Check size={14}/>}</button><div className="grocery-name"><strong>{display.name}</strong><span>{display.amount}{item.personal ? ' · pessoal' : source ? ` · ${source.count} ${source.count === 1 ? 'refeição' : 'refeições'}` : ''}</span>{display.preparation&&<small>{display.preparation}</small>}{source&&<small>{source.recipes.slice(0,2).join(' · ')}{source.recipes.length>2?` +${source.recipes.length-2}`:''}</small>}</div>{item.personal && <button className="icon-button" aria-label={`Editar ${item.name}`} onClick={() => setEditing(item)}><Pencil size={15}/></button>}{item.personal && <button className="icon-button" aria-label={`Remover ${item.name}`} onClick={() => setRemoving(item)}><Trash2 size={15}/></button>}</div>})}</section>)}</div> : <EmptyState title="Não encontramos itens compatíveis" text="Revise suas preferências alimentares para receber uma lista automática ou adicione um item pessoal." icon={ShoppingBasket}><Button variant="secondary" onClick={() => setEditing('new')}><Plus size={17}/>Adicionar item pessoal</Button></EmptyState>}
    {editing && <ItemForm item={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)}/>}
    {removing && <Dialog open onOpenChange={open => {if (!open) setRemoving(null)}} title="Remover item?" description={`${removing.name} será removido desta lista.`}><div className="dialog-actions"><Button variant="secondary" onClick={() => setRemoving(null)}>Cancelar</Button><Button variant="destructive" disabled={busy} onClick={async () => {if (await act({type: 'removeGrocery', id: removing.id})) setRemoving(null)}}>Remover item</Button></div></Dialog>}
  </>
}
function ItemForm({item, onClose}: {item?: GroceryItem; onClose: () => void}) {
  const {act, busy} = useWorkspace()
  const {register, handleSubmit, formState: {errors}} = useForm<GroceryItem>({resolver: zodResolver(grocerySchema), defaultValues: item ?? {id: crypto.randomUUID(), name: '', quantity: 1, unit: 'un', category: 'Outros', checked: false, personal: true, sourceKey: null}})
  return <Dialog open onOpenChange={open => {if (!open) onClose()}} title={item ? 'Editar item pessoal' : 'Adicionar item'} description="Inclua o que você precisa na sua lista."><form className="form-stack" onSubmit={handleSubmit(async values => {if (await act({type: 'groceries', items: [values]})) onClose()})}><label>Nome do item<input {...register('name')} autoComplete="off" placeholder="Ex.: Café" aria-invalid={Boolean(errors.name)}/>{errors.name && <span className="field-error">{errors.name.message}</span>}</label><div className="form-grid"><label>Quantidade<input type="number" min="0.001" step="any" {...register('quantity', {valueAsNumber: true})}/>{errors.quantity && <span className="field-error">Informe uma quantidade maior que zero.</span>}</label><label>Unidade<select {...register('unit')}>{['un','g','kg','ml','L'].map(v => <option key={v}>{v}</option>)}</select></label></div><label>Categoria<select {...register('category')}>{['Frutas','Vegetais','Proteínas','Laticínios','Grãos e cereais','Outros'].map(v => <option key={v}>{v}</option>)}</select></label><Button type="submit" disabled={busy}>Salvar item</Button></form></Dialog>
}
