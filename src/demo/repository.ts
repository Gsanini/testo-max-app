import { workspaceSchema, profileSchema, type Action, type MealSlot, type Workspace } from '@/domain/types'
import { addDays, dateKey, defaultTimezone } from '@/domain/dates'
import { chapters, personalizedMissions, protocols } from '@/content/journey'
import { canExecute, daysBetween, earnedAchievements, journeyDay } from '@/domain/journey'
import { isCompatible, mealFromRecipe, recipeForSlot, suitableRecipes } from '@/domain/nutrition'
import { recipeById, recipes } from '@/content/recipes'
import { consolidateIngredients } from '@/domain/grocery'

// Existing single-device workspace: no account authentication or backend connection.
export const storageKey = 'testomax:local-workspace:v1'
export const backupKey = 'testomax:before-journey:v1'
const legacyStorageKey = 'testomax:development-demo:v1'
export const initialProfile = profileSchema.parse({id:'local',goal:'consistencia',experience:'iniciante',trainingDays:[1,2,3,4,5],minutes:20,wakeTime:'07:00',sleepTime:'22:00',diet:'proteina-animal',timezone:defaultTimezone,onboarded:false})
const mealSlots:MealSlot[]=['breakfast','lunch','dinner']

function syncMealsForDay(state:Workspace,day:number,date:string) {
  // Keep completed records and deliberate swaps; refresh every other meal from the current plan.
  const usedIds=new Set(state.meals.filter(meal=>meal.date===date&&meal.done&&meal.recipeId).map(meal=>meal.recipeId!))
  for(const slot of mealSlots) {
    const id=`menu:${date}:${slot}`
    const index=state.meals.findIndex(meal=>meal.id===id)
    const existing=state.meals[index]
    if(existing?.done)continue
    const current=existing?.recipeId?recipeById.get(existing.recipeId):undefined
    if(current && !usedIds.has(current.id) && suitableRecipes(state.profile,slot).some(recipe=>recipe.id===current.id)) {
      state.meals[index]=mealFromRecipe(current,date,slot,state.profile)
      usedIds.add(current.id)
      continue
    }
    const selected=recipeForSlot(day,slot,state.profile,usedIds)
    if(selected) {
      const replacement=mealFromRecipe(selected,date,slot,state.profile)
      if(index>=0)state.meals[index]=replacement
      else state.meals.push(replacement)
      usedIds.add(selected.id)
    } else if(index>=0)state.meals.splice(index,1)
  }
}

export function prepareWorkspace(state:Workspace,today:string):Workspace {
  // Retain completed history while replacing unfinished plans from the previous catalog.
  state.meals=state.meals.filter(meal=>meal.done || (meal.slot!=='snack' && meal.recipeId && recipeById.has(meal.recipeId)))
  if (!state.profile.onboarded) return state
  if (!state.journey) state.journey={version:2,startDate:today,unlockedThrough:1,migrated:state.activities.length>0||state.meals.length>0,transitionSeen:false,lastVisit:today,achievements:[]}
  const journey=state.journey
  journey.unlockedThrough=Math.max(journey.unlockedThrough,journeyDay(journey.startDate,today))
  state.phases=chapters.map(c=>({id:String(c.id),name:c.name,description:c.objective,current:daysBetween(journey.startDate,today)>=c.start-1&&daysBetween(journey.startDate,today)<=c.end-1}))
  const activityById = new Map(state.activities.map(a=>[a.id,a]))
  for (const protocol of protocols) {
    const date=addDays(journey.startDate,protocol.day-1)
    syncMealsForDay(state,protocol.day,date)
    const plannedMeals=state.meals.filter(meal=>meal.date===date && meal.recipeId)
    for (const generated of personalizedMissions(protocol,state.profile,date,plannedMeals)) {
      const existing=activityById.get(generated.id)
      // New steps must not reopen days completed under an earlier version of the plan.
      if (!existing && date<today && ['journey:cardio','journey:food:breakfast','journey:food:dinner'].includes(generated.templateId)) continue
      if (!existing) {state.activities.push(generated);activityById.set(generated.id,generated)}
      else if (!existing.done && existing.date>=today) Object.assign(existing,{...generated,time:existing.time})
    }
  }
  for (let offset=0;offset<7;offset++) {
    const date=addDays(today,offset)
    syncMealsForDay(state,daysBetween(journey.startDate,date)+1,date)
  }
  // O bônus de compras é entregue pronto: sempre acompanha os próximos sete
  // dias do cardápio que foi filtrado pelas respostas alimentares do perfil.
  state.shoppingRange={start:today,days:7}
  refreshGroceries(state)
  for(const id of earnedAchievements(state,today)) if (!journey.achievements.some(a=>a.id===id)) journey.achievements.push({id,earnedOn:today})
  return state
}
function read():Workspace {
  const raw=localStorage.getItem(storageKey)??localStorage.getItem(legacyStorageKey)
  const saved=raw?JSON.parse(raw):null
  if(saved?.profile) {
    saved.profile.diet='proteina-animal'
    const available=new Set(recipes.flatMap(recipe=>recipe.ingredients.map(ingredient=>ingredient.name)))
    saved.profile.excludedIngredients=saved.profile.excludedIngredients?.filter((name:string)=>available.has(name))??[]
  }
  const state=saved?workspaceSchema.parse(saved):workspaceSchema.parse({profile:initialProfile,activities:[],meals:[],grocery:[],phases:[]})
  if(raw && !state.journey && state.profile.onboarded && !localStorage.getItem(backupKey)) localStorage.setItem(backupKey,raw)
  return prepareWorkspace(state,dateKey(state.profile.timezone))
}
async function withWorkspaceLock<T>(operation:()=>T):Promise<T> {
  if(typeof navigator!=='undefined' && navigator.locks)return navigator.locks.request('testomax-workspace',operation)
  return operation()
}
export async function load():Promise<Workspace> {return withWorkspaceLock(()=>{const state=read();const serialized=JSON.stringify(state);if(localStorage.getItem(storageKey)!==serialized)localStorage.setItem(storageKey,serialized);return state})}
function refreshGroceries(state:Workspace) {
  if(!state.shoppingRange)return
  const {start,days}=state.shoppingRange
  const meals=state.meals.filter(m=>{const recipe=m.recipeId?recipeById.get(m.recipeId):undefined;return recipe && isCompatible(recipe,state.profile) && m.date>=start && m.date<addDays(start,days)})
  state.grocery=[...state.grocery.filter(i=>i.personal),...consolidateIngredients(meals,state.grocery)]
}
export function applyAction(state:Workspace,action:Action,today:string):Workspace {
  switch(action.type) {
    case 'activity': {
      const a=state.activities.find(item=>item.id===action.id)
      if(!a || !canExecute(a,state,today)) throw new Error('Este protocolo ainda não está disponível. Ele será liberado na data indicada.')
      a.done=action.done
      const linkedMeal=state.meals.find(meal=>meal.id===a.mealId)
      if(linkedMeal)linkedMeal.done=action.done
      break
    }
    case 'meal': {
      const meal=state.meals.find(m=>m.id===action.id)
      if(!meal || meal.date>today) throw new Error('Você pode planejar esta refeição agora e registrá-la na data indicada.')
      meal.done=action.done
      for(const activity of state.activities)if(activity.mealId===meal.id)activity.done=action.done
      break
    }
    case 'time': {
      const a=state.activities.find(item=>item.id===action.id)
      if(!a || !canExecute(a,state,today) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(action.time)) throw new Error('Não foi possível alterar este horário.')
      a.time=action.time;break
    }
    case 'profile': {
      const profile=profileSchema.parse(action.profile)
      if(profile.id!==state.profile.id) throw new Error('O perfil não corresponde a este espaço local.')
      const previous=state.profile
      const changed=(keys:(keyof typeof profile)[])=>keys.some(key=>JSON.stringify(previous[key])!==JSON.stringify(profile[key]))
      state.profile={...profile,onboarded:state.profile.onboarded||profile.onboarded}
      if(changed(['goal','minutes','experience','trainingDays','location','activityPeriod','wakeTime','sleepTime','sleepQuality']))state.activities=state.activities.filter(a=>!a.journeyDay || a.done || a.date<today)
      if(changed(['diet','allergies','excludedIngredients','budget','cookMinutes']))state.meals=state.meals.filter(m=>m.done || m.date<today)
      else if(changed(['wakeTime','sleepTime']))state.meals=state.meals.map(meal=>{
        const recipe=meal.recipeId?recipeById.get(meal.recipeId):undefined
        return !meal.done&&meal.date>=today&&meal.slot&&recipe?{...meal,time:mealFromRecipe(recipe,meal.date,meal.slot,profile).time}:meal
      })
      prepareWorkspace(state,today);refreshGroceries(state);break
    }
    case 'swapMeal': {
      const index=state.meals.findIndex(m=>m.id===action.id)
      const meal=state.meals[index]
      const recipe=recipeById.get(action.recipeId)
      if(!meal?.slot || !recipe || meal.done || meal.date<today || !suitableRecipes(state.profile,meal.slot).some(r=>r.id===recipe.id) || state.meals.some(other=>other.date===meal.date&&other.id!==meal.id&&other.recipeId===recipe.id)) throw new Error('Esta troca não é compatível com suas preferências ou a refeição já foi registrada.')
      state.meals[index]=mealFromRecipe(recipe,meal.date,meal.slot,state.profile)
      refreshGroceries(state);break
    }
    case 'planShopping': {
      if(!/^\d{4}-\d{2}-\d{2}$/.test(action.start) || ![1,3,7].includes(action.days)) throw new Error('Período de compras inválido.')
      state.shoppingRange={start:action.start,days:action.days};refreshGroceries(state);break
    }
    case 'groceries': {
      if(action.replaceGenerated) state.grocery=state.grocery.filter(i=>i.personal)
      for(const item of action.items) {state.grocery=state.grocery.filter(i=>i.id!==item.id);state.grocery.push(item)}
      break
    }
    case 'removeGrocery':state.grocery=state.grocery.filter(i=>i.id!==action.id);break
    case 'acknowledgeTransition': if(state.journey)state.journey.transitionSeen=true;break
  }
  prepareWorkspace(state,today)
  if(state.journey)state.journey.lastVisit=today
  return state
}
export async function mutate(action:Action):Promise<void> {
  const save=()=>{const state=read();applyAction(state,action,dateKey(action.type==='profile'?action.profile.timezone:state.profile.timezone));localStorage.setItem(storageKey,JSON.stringify(state))}
  await withWorkspaceLock(save)
}
export function clear() {localStorage.removeItem(storageKey);localStorage.removeItem(legacyStorageKey)}
