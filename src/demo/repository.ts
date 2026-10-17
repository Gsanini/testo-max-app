import { workspaceSchema, profileSchema, type Action, type Workspace } from '@/domain/types'
import { addDays, dateKey, defaultTimezone } from '@/domain/dates'
import { chapters, personalizedMissions, protocols } from '@/content/journey'
import { canExecute, daysBetween, earnedAchievements, journeyDay } from '@/domain/journey'
import { isCompatible, mealFromRecipe, mealsForDay, suitableRecipes } from '@/domain/nutrition'
import { recipeById } from '@/content/recipes'
import { consolidateIngredients } from '@/domain/grocery'

// Existing single-device workspace: no account authentication or backend connection.
export const storageKey = 'testomax:local-workspace:v1'
export const backupKey = 'testomax:before-journey:v1'
const legacyStorageKey = 'testomax:development-demo:v1'
export const initialProfile = profileSchema.parse({id:'local',goal:'consistencia',experience:'iniciante',trainingDays:[1,2,3,4,5],minutes:20,wakeTime:'07:00',sleepTime:'22:00',diet:'variada',timezone:defaultTimezone,onboarded:false})

export function prepareWorkspace(state:Workspace,today:string):Workspace {
  if (!state.profile.onboarded) return state
  if (!state.journey) state.journey={version:2,startDate:today,unlockedThrough:1,migrated:state.activities.length>0||state.meals.length>0,transitionSeen:false,lastVisit:today,achievements:[]}
  const journey=state.journey
  journey.unlockedThrough=Math.max(journey.unlockedThrough,journeyDay(journey.startDate,today))
  state.phases=chapters.map(c=>({id:String(c.id),name:c.name,description:c.objective,current:daysBetween(journey.startDate,today)>=c.start-1&&daysBetween(journey.startDate,today)<=c.end-1}))
  const activityIds = new Set(state.activities.map(a=>a.id))
  const mealIds = new Set(state.meals.map(m=>m.id))
  for (const protocol of protocols) {
    const date=addDays(journey.startDate,protocol.day-1)
    for (const a of personalizedMissions(protocol,state.profile,date)) if (!activityIds.has(a.id)) state.activities.push(a)
    for (const meal of mealsForDay(protocol.day,date,state.profile)) if (!mealIds.has(meal.id)) state.meals.push(meal)
  }
  for (let offset=0;offset<7;offset++) {
    const date=addDays(today,offset)
    for(const meal of mealsForDay(daysBetween(journey.startDate,date)+1,date,state.profile)) if (!state.meals.some(m=>m.id===meal.id)) state.meals.push(meal)
  }
  for(const id of earnedAchievements(state,today)) if (!journey.achievements.some(a=>a.id===id)) journey.achievements.push({id,earnedOn:today})
  return state
}
function read():Workspace {
  const raw=localStorage.getItem(storageKey)??localStorage.getItem(legacyStorageKey)
  const state=raw?workspaceSchema.parse(JSON.parse(raw)):workspaceSchema.parse({profile:initialProfile,activities:[],meals:[],grocery:[],phases:[]})
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
      a.done=action.done;break
    }
    case 'meal': {
      const meal=state.meals.find(m=>m.id===action.id)
      if(!meal || meal.date>today) throw new Error('Você pode planejar esta refeição agora e registrá-la na data indicada.')
      meal.done=action.done;break
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
      if(!meal?.slot || !recipe || meal.done || meal.date<today || !suitableRecipes(state.profile,meal.slot).some(r=>r.id===recipe.id)) throw new Error('Esta troca não é compatível com suas preferências ou a refeição já foi registrada.')
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
