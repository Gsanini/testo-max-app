import { beforeEach, describe, expect, it, vi } from 'vitest'
import { workspaceSchema, type Profile } from '../src/domain/types'
import { dateKey, addDays } from '../src/domain/dates'
import { chapterForDay, dayState, isDayUnlocked, journeyDay, missionsForDay, participation } from '../src/domain/journey'
import { chapters, personalizedMissions, protocols } from '../src/content/journey'
import { allergenNames, recipes, recipeById, foods } from '../src/content/recipes'
import { isCompatible, mealsForDay, menus, suitableRecipes } from '../src/domain/nutrition'
import { applyAction, backupKey, initialProfile, load, prepareWorkspace, storageKey } from '../src/demo/repository'
import { consolidateIngredients } from '../src/domain/grocery'

const start='2026-10-17'
const create=(profile:Partial<Profile>={})=>prepareWorkspace(workspaceSchema.parse({profile:{...initialProfile,onboarded:true,...profile},activities:[],meals:[],grocery:[],phases:[]}),start)
describe('calendário independente de XP',()=>{
  it('libera por data local inclusive em transições de horário de verão',()=>{
    expect(isDayUnlocked(start,1,start)).toBe(true)
    expect(isDayUnlocked(start,2,start)).toBe(false)
    expect(isDayUnlocked(start,0,start)).toBe(false)
    expect(isDayUnlocked(start,121,'2027-10-17')).toBe(false)
    expect(journeyDay(start,'2027-10-17')).toBe(120)
    expect(journeyDay('2026-10-17',dateKey('America/Sao_Paulo',new Date('2026-10-18T02:59:59Z')))).toBe(1)
    expect(journeyDay('2026-10-17',dateKey('America/Sao_Paulo',new Date('2026-10-18T03:00:00Z')))).toBe(2)
    expect(journeyDay('2026-03-07',dateKey('America/New_York',new Date('2026-03-09T04:00:00Z')))).toBe(3)
    expect(chapterForDay(30).id).toBe(1);expect(chapterForDay(31).id).toBe(2)
  })
  it('concluir tudo não antecipa amanhã e a operação bloqueia execuções futuras',()=>{
    const state=create()
    for(const a of missionsForDay(state,1))applyAction(state,{type:'activity',id:a.id,done:true},start)
    expect(dayState(state,1,start)).toBe('completed')
    expect(dayState(state,2,start)).toBe('locked')
    expect(()=>applyAction(state,{type:'activity',id:missionsForDay(state,2)[0]!.id,done:true},start)).toThrow(/disponível/)
    expect(()=>applyAction(state,{type:'time',id:missionsForDay(state,2)[0]!.id,time:'08:00'},start)).toThrow()
    expect(participation(state,start).xp).toBe(40)
  })
  it('retoma depois de ausência sem apagar ou exigir o atraso',()=>{
    const state=create(), first=missionsForDay(state,1)[0]!
    applyAction(state,{type:'activity',id:first.id,done:true},start)
    const later=addDays(start,36)
    prepareWorkspace(state,later)
    expect(journeyDay(state.journey!.startDate,later)).toBe(37)
    expect(dayState(state,1,later)).toBe('available')
    expect(dayState(state,37,later)).toBe('current')
    applyAction(state,{type:'activity',id:missionsForDay(state,37)[0]!.id,done:true},later)
    expect(first.done).toBe(true)
    expect(participation(state,later).xp).toBe(20)
  })
  it('desfazer e repetir não duplica XP; conquistas ficam após ausência',()=>{
    const state=create(), id=missionsForDay(state,1)[0]!.id
    for(const done of [true,true,false,true,true])applyAction(state,{type:'activity',id,done},start)
    expect(participation(state,start).xp).toBe(10)
    expect(state.journey!.achievements.map(a=>a.id)).toEqual(['first'])
    applyAction(state,{type:'activity',id,done:false},start)
    expect(participation(state,start).xp).toBe(0)
    prepareWorkspace(state,addDays(start,80))
    expect(state.journey!.achievements.map(a=>a.id)).toEqual(['first'])
  })
  it('um dia liberado não volta a bloquear ao mudar para um fuso com data anterior',()=>{
    const state=create()
    prepareWorkspace(state,addDays(start,1))
    const id=missionsForDay(state,2)[0]!.id
    applyAction(state,{type:'activity',id,done:true},addDays(start,1))
    prepareWorkspace(state,start)
    expect(state.journey!.unlockedThrough).toBe(2)
    expect(dayState(state,2,start)).not.toBe('locked')
    expect(participation(state,start).xp).toBe(10)
    applyAction(state,{type:'activity',id,done:false},start)
    expect(participation(state,start).xp).toBe(0)
  })
})
describe('conteúdo completo e personalização',()=>{
  it('tem 120 dias editoriais com quatro ações utilizáveis e 30 dias por capítulo',()=>{
    expect(protocols).toHaveLength(120)
    expect(new Set(protocols.map(p=>p.title)).size).toBe(120)
    for(const c of chapters)expect(protocols.filter(p=>p.chapter===c.id)).toHaveLength(30)
    for(const p of protocols)for(const minutes of [10,15,30,90]){
      const missions=personalizedMissions(p,{...initialProfile,minutes},addDays(start,p.day-1))
      expect(missions).toHaveLength(4)
      expect(missions.reduce((sum,m)=>sum+m.minutes,0)).toBeLessThanOrEqual(minutes)
      expect(missions.every(m=>m.instructions.length&&m.purpose&&m.alternative&&!m.demo)).toBe(true)
    }
  })
  it('adapta local, experiência, duração e horário sem aumentar intensidade por capítulo',()=>{
    const p={...initialProfile,trainingDays:[0,1,2,3,4,5,6]}
    const first=personalizedMissions(protocols[0]!,p,start)
    const last=personalizedMissions(protocols[119]!,p,start)
    expect(first.find(a=>a.category==='movimento')!.minutes).toBe(last.find(a=>a.category==='movimento')!.minutes)
    const changed=personalizedMissions(protocols[0]!,{...p,minutes:60,experience:'avancado',location:'academia',activityPeriod:'tarde',wakeTime:'09:00'},start)
    expect(changed[1]!.instructions.join(' ')).toContain('academia')
    expect(changed[1]!.minutes).toBeGreaterThan(first[1]!.minutes)
    expect(changed[0]!.time).toBe('09:00');expect(changed[1]!.time).toBe('15:00')
  })
  it('tem 64 receitas completas, alergênicos coerentes e 30 cardápios distintos',()=>{
    expect(recipes).toHaveLength(64)
    expect(new Set(recipes.map(r=>r.id)).size).toBe(64)
    expect(new Set(menus.map(m=>JSON.stringify(m.recipes))).size).toBe(30)
    for(const recipe of recipes){
      expect(recipe.ingredients.length).toBeGreaterThan(1);expect(recipe.steps.length).toBeGreaterThan(0)
      expect(recipe.minutes).toBeGreaterThan(0);expect(recipe.servings).toBeGreaterThan(0)
      const allergens=[...new Set(recipe.ingredients.flatMap(i=>Object.values(foods).find(f=>f.name===i.name)!.allergens))].sort()
      expect([...recipe.allergens].sort()).toEqual(allergens)
      expect(recipe.ingredients.every(i=>i.quantity>0)).toBe(true)
    }
    for(const menu of menus)for(const [slot,id] of Object.entries(menu.recipes))expect(recipeById.get(id)!.slots).toContain(slot)
  })
  it('mantém todos os 120 dias compatíveis, inclusive com todas as alergias do catálogo',()=>{
    for(const diet of ['variada','vegetariana','vegana','mediterranea'] as const){
      const profile={...initialProfile,diet,allergies:Object.keys(allergenNames) as Profile['allergies'],cookMinutes:10,excludedIngredients:['Banana']}
      for(let day=1;day<=120;day++){
        const meals=mealsForDay(day,addDays(start,day-1),profile)
        expect(meals).toHaveLength(4)
        for(const meal of meals){const recipe=recipeById.get(meal.recipeId!)!;expect(isCompatible(recipe,profile)).toBe(true);expect(recipe.minutes).toBeLessThanOrEqual(10);expect(recipe.economical).toBe(true)}
      }
    }
    const days=Array.from({length:30},(_,i)=>mealsForDay(i+1,start,initialProfile).map(m=>m.recipeId).join('|'))
    expect(new Set(days).size).toBe(30)
  })
  it('não enfraquece restrições quando não há opções',()=>{
    const profile={...initialProfile,excludedIngredients:Object.values(foods).map(f=>f.name)}
    expect(suitableRecipes(profile)).toEqual([]);expect(mealsForDay(1,start,profile)).toEqual([])
  })
})
describe('persistência, preferências e compras',()=>{
  beforeEach(()=>{const storage=new Map<string,string>();vi.stubGlobal('localStorage',{getItem:(k:string)=>storage.get(k)??null,setItem:(k:string,v:string)=>storage.set(k,v),removeItem:(k:string)=>storage.delete(k)})})
  it('migra sem apagar histórico e guarda o original antes da migração',async()=>{
    const state=create(),legacy=structuredClone(state.activities[0]!)
    delete legacy.journeyDay;legacy.id='legacy';legacy.done=true
    const old={profile:state.profile,activities:[legacy],meals:[],grocery:[],phases:[]}
    localStorage.setItem(storageKey,JSON.stringify(old))
    const loaded=await load()
    expect(loaded.journey!.migrated).toBe(true)
    expect(loaded.activities.find(a=>a.id==='legacy')).toEqual(legacy)
    expect(JSON.parse(localStorage.getItem(backupKey)!)).toEqual(old)
    expect((await load()).journey!.startDate).toBe(loaded.journey!.startDate)
    expect((await load()).activities.length).toBe(481)
  })
  it('recusa trocar o dono e adapta preferências preservando conclusões e início',()=>{
    const state=create(),first=state.activities[0]!
    applyAction(state,{type:'activity',id:first.id,done:true},start)
    applyAction(state,{type:'profile',profile:{...state.profile,diet:'vegana',allergies:['soja'],minutes:10}},start)
    expect(state.journey!.startDate).toBe(start)
    expect(state.activities.find(a=>a.id===first.id)!.done).toBe(true)
    expect(state.meals.every(m=>isCompatible(recipeById.get(m.recipeId!)!,state.profile))).toBe(true)
    expect(()=>applyAction(state,{type:'profile',profile:{...state.profile,id:'another'}},start)).toThrow(/perfil/)
  })
  it('troca refeição futura e recalcula compras mantendo itens pessoais',()=>{
    const state=create(),meal=state.meals.find(m=>m.date===addDays(start,1)&&m.slot==='lunch')!
    applyAction(state,{type:'groceries',items:[{id:'personal',name:'Café pessoal',quantity:1,unit:'un',category:'Outros',checked:true,personal:true,sourceKey:null}]},start)
    applyAction(state,{type:'planShopping',start,days:7},start)
    const alternative=suitableRecipes(state.profile,'lunch').find(r=>r.id!==meal.recipeId)!
    applyAction(state,{type:'swapMeal',id:meal.id,recipeId:alternative.id},start)
    expect(state.meals.find(m=>m.id===meal.id)!.recipeId).toBe(alternative.id)
    const expected=consolidateIngredients(state.meals.filter(m=>m.date>=start&&m.date<addDays(start,7)))
    expect(state.grocery.filter(i=>!i.personal).map(i=>[i.name,i.quantity])).toEqual(expected.map(i=>[i.name,i.quantity]))
    expect(state.grocery.find(i=>i.id==='personal')!.checked).toBe(true)
    expect(()=>applyAction(state,{type:'meal',id:meal.id,done:true},start)).toThrow(/planejar/)
  })
  it('rejeita troca incompatível e não recomenda ingredientes antigos após nova restrição',()=>{
    const state=create({allergies:['ovos']})
    const meal=state.meals.find(m=>m.date===start&&m.slot==='breakfast')!
    expect(()=>applyAction(state,{type:'swapMeal',id:meal.id,recipeId:'pao-ovo'},start)).toThrow(/compatível/)
    applyAction(state,{type:'planShopping',start,days:7},start)
    applyAction(state,{type:'profile',profile:{...state.profile,excludedIngredients:['Banana']}},start)
    expect(state.grocery.some(i=>i.name==='Banana')).toBe(false)
  })
  it('ajustar apenas a meta semanal não descarta refeições escolhidas ou horários editados',()=>{
    const state=create(),meal=state.meals.find(m=>m.slot==='lunch')!
    const choice=suitableRecipes(state.profile,'lunch').find(r=>r.id!==meal.recipeId)!
    applyAction(state,{type:'swapMeal',id:meal.id,recipeId:choice.id},start)
    applyAction(state,{type:'time',id:state.activities[0]!.id,time:'09:20'},start)
    applyAction(state,{type:'profile',profile:{...state.profile,weeklyGoal:2}},start)
    expect(state.meals.find(m=>m.id===meal.id)!.recipeId).toBe(choice.id)
    expect(state.activities[0]!.time).toBe('09:20')
  })
})
