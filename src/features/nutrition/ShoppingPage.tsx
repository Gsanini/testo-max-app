import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Check, Pencil, Plus, ShoppingBasket, Trash2, WandSparkles } from 'lucide-react'
import { useWorkspace } from '@/app/providers'
import { EmptyState, PageHeading } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { grocerySchema, type GroceryItem } from '@/domain/types'
import { addDays, formatDate } from '@/domain/dates'
import { cn } from '@/lib/utils'

export default function ShoppingPage() {
  const {data, today, act, busy} = useWorkspace()
  const [days, setDays] = useState(data.shoppingRange?.days ?? 7)
  const [editing, setEditing] = useState<GroceryItem | 'new' | null>(null)
  const [removing, setRemoving] = useState<GroceryItem | null>(null)
  const [note, setNote] = useState('')
  const categories = [...new Set(data.grocery.map(i => i.category))].sort()
  const checked = data.grocery.filter(i => i.checked).length
  const generate = async () => {
    const meals = data.meals.filter(m => m.recipeId && m.date >= today && m.date < addDays(today, days))
    if (!meals.length) {setNote('Não há refeições atribuídas neste período. Você pode adicionar seus próprios itens.'); return}
    if (await act({type: 'planShopping', start:today, days})) setNote(`Lista gerada a partir de ${meals.length} refeições em ${new Set(meals.map(m => m.date)).size} dias. Itens pessoais e marcações compatíveis foram preservados.`)
  }
  return <><Link to="/alimentacao" className="back-link"><ArrowLeft size={16}/>Alimentação</Link><PageHeading eyebrow="TUDO NO SEU LUGAR" title="Lista de compras" description="Do seu plano para a sua cesta, sem esquecer de nada." action={<Button onClick={() => setEditing('new')}><Plus size={18}/>Adicionar item</Button>}/>
    <section className="shopping-generator panel"><span className="shortcut-icon"><ShoppingBasket size={24}/></span><div><h2>Prepare os próximos dias</h2><p>Ingredientes repetidos são somados automaticamente.</p></div><label><span className="sr-only">Período da lista</span><select value={days} onChange={e => setDays(Number(e.target.value))}><option value={1}>Hoje</option><option value={3}>Próximos 3 dias</option><option value={7}>Próximos 7 dias</option></select></label><Button variant="secondary" onClick={() => void generate()} disabled={busy}><WandSparkles size={16}/>Gerar lista</Button></section>
    {note && <p className="inline-notice" role="status">{note}</p>}
    {data.shoppingRange && <p className="shopping-range">{formatDate(data.shoppingRange.start)} a {formatDate(addDays(data.shoppingRange.start,data.shoppingRange.days-1))} · Atualizada ao trocar refeições. Ingredientes indicados como cozidos são contabilizados já preparados.</p>}
    {data.grocery.length > 0 && <div className="shopping-progress"><span>{checked} de {data.grocery.length} itens comprados</span><div className="progress-track"><span style={{width: `${checked / data.grocery.length * 100}%`}}/></div></div>}
    {categories.length ? <div className="grocery-grid">{categories.map(category => <section className="panel grocery-category" key={category}><div className="panel-heading"><h2>{category}</h2><span className="count-badge">{data.grocery.filter(i => i.category === category).length}</span></div>{data.grocery.filter(i => i.category === category).map(item => <div className={cn('grocery-row', item.checked && 'is-checked')} key={item.id}><button className="grocery-checkbox" aria-label={`${item.checked ? 'Desmarcar' : 'Comprar'} ${item.name}`} aria-pressed={item.checked} disabled={busy} onClick={() => void act({type: 'groceries', items: [{...item, checked: !item.checked}]})}>{item.checked && <Check size={14}/>}</button><div className="grocery-name"><strong>{item.name}</strong><span>{item.quantity.toLocaleString('pt-BR')} {item.unit}{item.personal && ' · pessoal'}</span></div>{item.personal && <button className="icon-button" aria-label={`Editar ${item.name}`} onClick={() => setEditing(item)}><Pencil size={15}/></button>}<button className="icon-button" aria-label={`Remover ${item.name}`} onClick={() => setRemoving(item)}><Trash2 size={15}/></button></div>)}</section>)}</div> : <EmptyState title="Sua lista está pronta para começar" text="Gere os ingredientes a partir das suas refeições ou adicione um item pessoal." icon={ShoppingBasket}><Button variant="secondary" onClick={() => setEditing('new')}><Plus size={17}/>Adicionar primeiro item</Button></EmptyState>}
    {editing && <ItemForm item={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)}/>}
    {removing && <Dialog open onOpenChange={open => {if (!open) setRemoving(null)}} title="Remover item?" description={`${removing.name} será removido desta lista.`}><div className="dialog-actions"><Button variant="secondary" onClick={() => setRemoving(null)}>Cancelar</Button><Button variant="destructive" disabled={busy} onClick={async () => {if (await act({type: 'removeGrocery', id: removing.id})) setRemoving(null)}}>Remover item</Button></div></Dialog>}
  </>
}
function ItemForm({item, onClose}: {item?: GroceryItem; onClose: () => void}) {
  const {act, busy} = useWorkspace()
  const {register, handleSubmit, formState: {errors}} = useForm<GroceryItem>({resolver: zodResolver(grocerySchema), defaultValues: item ?? {id: crypto.randomUUID(), name: '', quantity: 1, unit: 'un', category: 'Outros', checked: false, personal: true, sourceKey: null}})
  return <Dialog open onOpenChange={open => {if (!open) onClose()}} title={item ? 'Editar item pessoal' : 'Adicionar item'} description="Inclua o que você precisa na sua lista."><form className="form-stack" onSubmit={handleSubmit(async values => {if (await act({type: 'groceries', items: [values]})) onClose()})}><label>Nome do item<input {...register('name')} autoComplete="off" placeholder="Ex.: Café" aria-invalid={Boolean(errors.name)}/>{errors.name && <span className="field-error">{errors.name.message}</span>}</label><div className="form-grid"><label>Quantidade<input type="number" min="0.001" step="any" {...register('quantity', {valueAsNumber: true})}/>{errors.quantity && <span className="field-error">Informe uma quantidade maior que zero.</span>}</label><label>Unidade<select {...register('unit')}>{['un','g','kg','ml','L'].map(v => <option key={v}>{v}</option>)}</select></label></div><label>Categoria<select {...register('category')}>{['Frutas','Vegetais','Proteínas','Laticínios','Grãos e cereais','Outros'].map(v => <option key={v}>{v}</option>)}</select></label><Button type="submit" disabled={busy}>Salvar item</Button></form></Dialog>
}
