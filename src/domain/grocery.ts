import type { GroceryItem, Ingredient, Meal } from './types'

const normalizeName = (name:string) => name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase()
const normalizedUnit = (unit:Ingredient['unit']) => unit === 'kg' ? 'g' : unit === 'L' ? 'ml' : unit

export function ingredientSourceKey(name:string,unit:Ingredient['unit']) {
  return `${normalizeName(name)}|${normalizedUnit(unit)}`
}

function formatAmount(quantity:number,unit:Ingredient['unit']) {
  if(unit==='g'&&quantity>=1000)return `${(quantity/1000).toLocaleString('pt-BR',{maximumFractionDigits:2})} kg`
  if(unit==='ml'&&quantity>=1000)return `${(quantity/1000).toLocaleString('pt-BR',{maximumFractionDigits:2})} L`
  return `${quantity.toLocaleString('pt-BR',{maximumFractionDigits:2})} ${unit}`
}

export type GroceryPresentation = {name:string; amount:string; preparation?:string}

export function groceryPresentation(item:GroceryItem):GroceryPresentation {
  if(item.sourceKey==='frango cozido desfiado|g') {
    // A referência culinária usa frango pronto. Consideramos rendimento médio
    // próximo de 74% após o cozimento e arredondamos a compra para 50 g.
    const rawQuantity=Math.ceil((item.quantity/0.74)/50)*50
    return {name:'Peito de frango cru',amount:`aprox. ${formatAmount(rawQuantity,'g')}`,preparation:`rende cerca de ${formatAmount(item.quantity,'g')} cozidos`}
  }
  return {name:item.name,amount:formatAmount(item.quantity,item.unit)}
}

export function consolidateIngredients(meals: Meal[], existing: GroceryItem[] = []): GroceryItem[] {
  const items = new Map<string, GroceryItem>()
  for (const meal of meals) for (const ingredient of meal.ingredients) {
    // Água usada no preparo não é um item de supermercado.
    if(normalizeName(ingredient.name)==='agua')continue
    const unit = normalizedUnit(ingredient.unit)
    const quantity = ingredient.quantity * (ingredient.unit === 'kg' || ingredient.unit === 'L' ? 1000 : 1)
    const key = ingredientSourceKey(ingredient.name,ingredient.unit)
    const found = items.get(key)
    if (found) found.quantity = Math.round((found.quantity + quantity) * 1000) / 1000
    else {
      const saved = existing.find(i => i.sourceKey === key && !i.personal)
      items.set(key, {...ingredient, quantity, unit, id: saved?.id ?? crypto.randomUUID(), sourceKey: key, checked: saved?.checked ?? false, personal: false})
    }
  }
  return [...items.values()].map(item => {
    const saved=existing.find(i=>i.sourceKey===item.sourceKey&&!i.personal)
    return {...item,checked:Boolean(saved?.checked && saved.quantity>=item.quantity)}
  })
}
