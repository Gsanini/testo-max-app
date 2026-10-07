import type { GroceryItem, Meal } from './types'

export function consolidateIngredients(meals: Meal[], existing: GroceryItem[] = []): GroceryItem[] {
  const items = new Map<string, GroceryItem>()
  for (const meal of meals) for (const ingredient of meal.ingredients) {
    const unit = ingredient.unit === 'kg' ? 'g' : ingredient.unit === 'L' ? 'ml' : ingredient.unit
    const quantity = ingredient.quantity * (ingredient.unit === 'kg' || ingredient.unit === 'L' ? 1000 : 1)
    const key = `${ingredient.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase()}|${unit}`
    const found = items.get(key)
    if (found) found.quantity = Math.round((found.quantity + quantity) * 1000) / 1000
    else {
      const saved = existing.find(i => i.sourceKey === key && !i.personal)
      items.set(key, {...ingredient, quantity, unit, id: saved?.id ?? crypto.randomUUID(), sourceKey: key, checked: saved?.checked ?? false, personal: false})
    }
  }
  return [...items.values()]
}
