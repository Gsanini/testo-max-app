import type { Meal, MealSlot, Profile, Recipe } from './types'
import { pdfMenus, recipes, recipeById } from '@/content/recipes'
import { shiftTime } from '@/content/journey'

export const normalizeIngredient = (value:string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase().replace(/^frango desfiado$/,'frango sem pele')
export function isCompatible(recipe:Recipe,profile:Profile) {
  if(recipe.allergens.some(allergen=>profile.allergies.includes(allergen)))return false
  return !recipe.ingredients.some(ingredient=>profile.excludedIngredients.some(excluded=>normalizeIngredient(ingredient.name)===normalizeIngredient(excluded)))
}
export function suitableRecipes(profile:Profile,slot?:MealSlot) {
  return recipes.filter(recipe=>isCompatible(recipe,profile) && (!slot || recipe.slots.includes(slot)))
}
export const slotNames:Record<MealSlot,string>={breakfast:'Café da manhã',lunch:'Almoço',snack:'Lanche',dinner:'Jantar'}
const slots:MealSlot[]=['breakfast','lunch','dinner']
export const menus=pdfMenus

export function recipeForSlot(day:number,slot:MealSlot,profile:Profile,_usedIds:Set<string>):Recipe|undefined {
  if(slot==='snack' || day<1 || day>120)return undefined
  const id=menus[day-1]?.recipes[slot]
  const recipe=id?recipeById.get(id):undefined
  return recipe && isCompatible(recipe,profile)?recipe:undefined
}
export function mealFromRecipe(recipe:Recipe,date:string,slot:MealSlot,profile:Profile):Meal {
  const times:Record<MealSlot,string>={breakfast:shiftTime(profile.wakeTime,30),lunch:shiftTime(profile.wakeTime,330),snack:shiftTime(profile.wakeTime,540),dinner:shiftTime(profile.sleepTime,-150)}
  return {id:`menu:${date}:${slot}`,templateId:`menu:${slot}`,recipeId:recipe.id,slot,date,title:slotNames[slot],description:recipe.name,time:times[slot],image:'',done:false,demo:false,ingredients:recipe.ingredients,steps:recipe.steps,substitutions:[],nutrition:null}
}
export function mealsForDay(day:number,date:string,profile:Profile):Meal[] {
  return slots.flatMap(slot=>{
    const recipe=recipeForSlot(day,slot,profile,new Set())
    return recipe?[mealFromRecipe(recipe,date,slot,profile)]:[]
  })
}
export function recipeForMeal(meal:Meal){return meal.recipeId?recipeById.get(meal.recipeId):undefined}
