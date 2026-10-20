import type { Meal, MealSlot, Profile, Recipe } from './types'
import { recipes, recipeById } from '@/content/recipes'
import { shiftTime } from '@/content/journey'

export const normalizeIngredient = (text:string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase()
export function isCompatible(recipe: Recipe, profile: Profile) {
  if (profile.diet === 'carnivora' && recipe.diet !== 'carnivora') return false
  if (profile.diet === 'vegana' && recipe.diet !== 'vegana') return false
  if (profile.diet === 'vegetariana' && (recipe.diet === 'variada' || recipe.diet === 'carnivora')) return false
  if (profile.diet === 'mediterranea' && (recipe.diet === 'carnivora' || recipe.ingredients.some(i => i.name.includes('Frango')))) return false
  if (recipe.allergens.some(a => profile.allergies.includes(a))) return false
  return !recipe.ingredients.some(i => profile.excludedIngredients.some(excluded => normalizeIngredient(i.name) === normalizeIngredient(excluded)))
}
export function suitableRecipes(profile:Profile, slot?:MealSlot) {
  return recipes.filter(r => isCompatible(r,profile) && (!slot || r.slots.includes(slot)) && r.minutes <= profile.cookMinutes && (profile.budget !== 'economico' || r.economical))
}
export const slotNames: Record<MealSlot,string> = {breakfast:'Café da manhã',lunch:'Almoço',snack:'Lanche',dinner:'Jantar'}
const slots: MealSlot[] = ['breakfast','lunch','snack','dinner']
const dinnerPool = recipes.filter(r=>r.slots.includes('dinner'))
// Thirty distinct complete menus, cycled across four chapters. All IDs resolve to recipes.
export const menus = Array.from({length:30},(_,i) => ({id:`menu-${i+1}`, recipes:{
  breakfast:recipes[i%16]!.id,
  lunch:recipes[16+(i%24)]!.id,
  snack:recipes[40+(i%16)]!.id,
  dinner:dinnerPool[(i+11)%dinnerPool.length]!.id,
}}))
export function mealFromRecipe(recipe:Recipe, date:string, slot:MealSlot, profile:Profile):Meal {
  const times:Record<MealSlot,string> = {breakfast:shiftTime(profile.wakeTime,30),lunch:shiftTime(profile.wakeTime,330),snack:shiftTime(profile.wakeTime,540),dinner:shiftTime(profile.sleepTime,-150)}
  return {id:`menu:${date}:${slot}`,templateId:`menu:${slot}`,recipeId:recipe.id,slot,date,title:slotNames[slot],description:recipe.name,time:times[slot],image:`/images/${slot === 'breakfast'?'breakfast':slot === 'snack'?'snack':slot === 'lunch'?'lunch':'dinner'}.jpg`,done:false,demo:false,ingredients:recipe.ingredients,steps:recipe.steps,substitutions:[],nutrition:null}
}
export function mealsForDay(day:number,date:string,profile:Profile):Meal[] {
  const menu = menus[((day-1)%30+30)%30]!
  return slots.flatMap((slot,index) => {
    const choices = suitableRecipes(profile,slot)
    const preferred = choices.find(r=>r.id===menu.recipes[slot])
    const selected = preferred ?? choices[((day-1+index*7)%choices.length+choices.length)%choices.length]
    return selected ? [mealFromRecipe(selected,date,slot,profile)] : []
  })
}
export function recipeForMeal(meal:Meal) {return meal.recipeId ? recipeById.get(meal.recipeId) : undefined}
