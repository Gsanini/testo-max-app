import { beforeEach, describe, expect, it, vi } from 'vitest'
import { profileSchema, workspaceSchema, type Profile } from '../src/domain/types'
import pdfMenu from '../src/content/pdf-menu.json'
import { dateKey, addDays } from '../src/domain/dates'
import { chapterForDay, dayState, isDayUnlocked, journeyDay, missionsForDay, participation } from '../src/domain/journey'
import { chapters, personalizedMissions, protocols, strengthWeekdays } from '../src/content/journey'
import { allergenNames, recipes, recipeById, foods } from '../src/content/recipes'
import { isCompatible, mealFromRecipe, mealsForDay, menus, suitableRecipes } from '../src/domain/nutrition'
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
    expect(participation(state,start).xp).toBe(70)
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
  it('tem 120 dias editoriais com sete ações utilizáveis e 30 dias por capítulo',()=>{
    expect(protocols).toHaveLength(120)
    expect(new Set(protocols.map(p=>p.title)).size).toBe(120)
    for(const c of chapters)expect(protocols.filter(p=>p.chapter===c.id)).toHaveLength(30)
    for(const p of protocols)for(const minutes of [10,15,30,90]){
      const missions=personalizedMissions(p,{...initialProfile,minutes},addDays(start,p.day-1))
      expect(missions).toHaveLength(7)
      expect(missions.filter(m=>m.role==='alimentacao')).toHaveLength(3)
      expect(new Set(missions.map(m=>m.role))).toEqual(new Set(['habito','treino','cardio','alimentacao','sono']))
      expect(missions.reduce((sum,m)=>sum+m.minutes,0)).toBeLessThanOrEqual(minutes)
      expect(missions.every(m=>m.instructions.length&&m.purpose&&m.alternative&&!m.demo)).toBe(true)
    }
  })
  it('adapta local, experiência, duração e horário sem aumentar intensidade por capítulo',()=>{
    const p={...initialProfile,trainingDays:[0,1,2,3,4,5,6]}
    const first=personalizedMissions(protocols[2]!,p,addDays(start,2))
    const last=personalizedMissions(protocols[114]!,p,addDays(start,114))
    expect(first.find(a=>a.category==='movimento')!.minutes).toBe(last.find(a=>a.category==='movimento')!.minutes)
    const changed=personalizedMissions(protocols[2]!,{...p,minutes:60,experience:'avancado',location:'academia',activityPeriod:'tarde',wakeTime:'09:00'},addDays(start,2))
    expect(changed.find(a=>a.role==='treino')!.instructions.join(' ')).toContain('academia')
    expect(changed.find(a=>a.role==='treino')!.minutes).toBeGreaterThan(first.find(a=>a.role==='treino')!.minutes)
    expect(changed.find(a=>a.role==='habito')!.time).toBe('21:30');expect(changed.find(a=>a.role==='treino')!.time).toBe('15:00')
    const evening=personalizedMissions(protocols[2]!,{...p,activityPeriod:'noite'},addDays(start,2))
    expect(evening.find(a=>a.role==='treino')!.time).toBe('18:00')
    expect(evening.find(a=>a.role==='cardio')!.time).toBe('18:23')
  })
  it('transforma luz e sono em ações com horário e duração explícitos',()=>{
    const missions=personalizedMissions(protocols[0]!,initialProfile,start)
    const daylight=missions.find(a=>a.role==='habito')!
    const sleep=missions.find(a=>a.role==='sono')!
    expect(daylight.title).toBe('Luz natural por 10 minutos')
    expect(daylight.time).toBe('07:00')
    expect(daylight.instructions[0]).toContain('Às 07:00, fique 10 minutos ao ar livre')
    expect(sleep.title).toBe('Dormir às 22:00 · 9 h')
    expect(sleep.instructions[0]).toContain('Deite às 22:00 e programe o despertar para 07:00')
    const shortSleep=personalizedMissions(protocols[0]!,{...initialProfile,sleepTime:'02:00'},start).find(a=>a.role==='sono')!
    expect(shortSleep.title).toBe('Dormir às 02:00 · 5 h')
    expect(shortSleep.instructions[0]).toContain('Para reservar pelo menos 7 h, deite até 00:00')
  })
  it('alterna força e recuperação, mantendo cardio diário e um preparo real do cardápio',()=>{
    const state=create({trainingDays:[0,1,2,3,4,5,6]})
    expect(strengthWeekdays(state.profile)).toEqual([1,3,5])
    const firstTwoWeeks=Array.from({length:14},(_,i)=>missionsForDay(state,i+1))
    expect(firstTwoWeeks.filter(day=>day.find(a=>a.role==='treino')!.exercises.length>0)).toHaveLength(6)
    expect(firstTwoWeeks.every(day=>day.some(a=>a.role==='cardio'))).toBe(true)
    expect(firstTwoWeeks.every(day=>day.some(a=>a.role==='sono'))).toBe(true)
    for(const day of firstTwoWeeks){
      const foods=day.filter(a=>a.role==='alimentacao')
      expect(foods).toHaveLength(3)
      expect(foods.map(food=>state.meals.find(meal=>meal.id===food.mealId)?.slot)).toEqual(['breakfast','lunch','dinner'])
      for(const food of foods){
        const meal=state.meals.find(meal=>meal.id===food.mealId)!
        expect(food.title).toContain(meal.description)
        if(meal.ingredients.some(i=>i.name==='Feijão cozido'))expect(food.purpose).toContain('zinco')
      }
    }
    expect(new Set(firstTwoWeeks.map(day=>day.find(a=>a.role==='cardio')!.title)).size).toBe(12)
  })
  it('importa as 360 refeições e quantidades dos 120 dias',()=>{
    expect(recipes.length).toBeGreaterThanOrEqual(100)
    expect(new Set(recipes.map(r=>r.id)).size).toBe(recipes.length)
    expect(menus).toHaveLength(120)
    expect(new Set(menus.map(m=>JSON.stringify(m.recipes))).size).toBe(120)
    for(const recipe of recipes){
      expect(recipe.diet).toBe('proteina-animal')
      expect(recipe.ingredients.length).toBeGreaterThan(0);expect(recipe.steps.length).toBeGreaterThan(0)
      expect(recipe.servings).toBe(1)
      expect(recipe.sourcePortions).toBeTruthy()
      const allergens=[...new Set(recipe.ingredients.flatMap(i=>Object.values(foods).find(f=>f.name===i.name)!.allergens))].sort()
      expect([...recipe.allergens].sort()).toEqual(allergens)
      expect(recipe.ingredients.every(i=>i.quantity>0)).toBe(true)
    }
    for(const [index,menu] of menus.entries())for(const [slot,id] of Object.entries(menu.recipes)){
      const recipe=recipeById.get(id)!
      expect(recipe.slots).toContain(slot)
      expect(recipe.name).toBe(pdfMenu[index]!.meals[slot as 'breakfast'|'lunch'|'dinner'].name)
      expect(recipe.sourcePortions).toBe(pdfMenu[index]!.meals[slot as 'breakfast'|'lunch'|'dinner'].portions)
    }
  })
  it('mantém os dias variados sem repetir receita ou ignorar alergias',()=>{
    const restricted={...initialProfile,allergies:Object.keys(allergenNames) as Profile['allergies'],cookMinutes:10}
    for(let day=1;day<=120;day++){
      const date=addDays(start,day-1)
      const meals=mealsForDay(day,date,initialProfile)
      expect(meals).toHaveLength(3)
      expect(new Set(meals.map(meal=>meal.recipeId)).size).toBe(3)
      expect(meals.map(meal=>meal.description)).toEqual(['breakfast','lunch','dinner'].map(slot=>pdfMenu[day-1]!.meals[slot as 'breakfast'|'lunch'|'dinner'].name))
      for(const meal of meals)expect(recipeById.get(meal.recipeId!)!.slots).toContain(meal.slot)
      const limited=mealsForDay(day,date,restricted)
      expect(new Set(limited.map(meal=>meal.recipeId)).size).toBe(limited.length)
      for(const meal of limited){const recipe=recipeById.get(meal.recipeId!)!;expect(isCompatible(recipe,restricted)).toBe(true)}
    }
    const days=Array.from({length:30},(_,i)=>mealsForDay(i+1,start,initialProfile).map(m=>m.recipeId).join('|'))
    expect(new Set(days).size).toBe(30)
  })
  it('gera a primeira semana com as porções planejadas',()=>{
    const profile={...initialProfile,diet:'proteina-animal' as const,cookMinutes:60,budget:'flexivel' as const}
    const week=Array.from({length:7},(_,index)=>mealsForDay(index+1,addDays(start,index),profile)).flat()
    expect(week).toHaveLength(21)
    for(const meal of week){
      const recipe=recipeById.get(meal.recipeId!)!
      expect(recipe.diet).toBe('proteina-animal')
      expect(recipe.ingredients.length).toBeGreaterThanOrEqual(4)
    }
    const list=consolidateIngredients(week)
    const amount=(name:string)=>list.find(item=>item.name===name)?.quantity
    expect(amount('Ovos')).toBe(11)
    expect(amount('frango sem pele')).toBe(1440)
    expect(amount('arroz')).toBe(900)
    expect(amount('iogurte natural')).toBe(1190)
  })
  it('não enfraquece restrições quando não há opções',()=>{
    const profile={...initialProfile,excludedIngredients:Object.values(foods).map(f=>f.name)}
    expect(suitableRecipes(profile)).toEqual([]);expect(mealsForDay(1,start,profile)).toEqual([])
  })
})
describe('persistência, preferências e compras',()=>{
  beforeEach(()=>{const storage=new Map<string,string>();vi.stubGlobal('localStorage',{getItem:(k:string)=>storage.get(k)??null,setItem:(k:string,v:string)=>storage.set(k,v),removeItem:(k:string)=>storage.delete(k)})})
  it('corrige um dia antigo com a mesma receita em todos os horários',()=>{
    const state=create()
    const repeated=recipeById.get(menus[0]!.recipes.lunch)!
    state.meals=state.meals.map(meal=>meal.date===start&&meal.slot?mealFromRecipe(repeated,start,meal.slot,state.profile):meal)
    prepareWorkspace(state,start)
    const today=state.meals.filter(meal=>meal.date===start)
    expect(today).toHaveLength(3)
    expect(new Set(today.map(meal=>meal.recipeId)).size).toBe(3)
    expect(today.find(meal=>meal.slot==='breakfast')?.recipeId).not.toBe(repeated.id)
    for(const meal of today){
      const mission=state.activities.find(activity=>activity.mealId===meal.id)
      if(mission)expect(mission.title).toContain(meal.description)
    }
  })
  it('migra um perfil antigo e substitui refeições futuras pelo cardápio atual',async()=>{
    expect(profileSchema.safeParse({...initialProfile,diet:'vegana'}).success).toBe(false)
    const today=dateKey(initialProfile.timezone)
    const saved=JSON.parse(JSON.stringify(create()))
    saved.profile.diet='vegana'
    saved.profile.excludedIngredients=['Banana']
    const future=saved.meals.find((meal:{date:string})=>meal.date>=today)
    expect(future).toBeDefined()
    future.recipeId='banana-aveia'
    localStorage.setItem(storageKey,JSON.stringify(saved))
    const migrated=await load()
    expect(migrated.profile.diet).toBe('proteina-animal')
    expect(migrated.profile.excludedIngredients).toEqual([])
    expect(migrated.meals.filter(meal=>meal.date>=today).every(meal=>recipeById.has(meal.recipeId!))).toBe(true)
  })
  it('sincroniza café, almoço e jantar com o registro de alimentação sem duplicar XP',()=>{
    const state=create()
    for(const slot of ['breakfast','lunch','dinner'] as const){
      const meal=state.meals.find(item=>item.date===start&&item.slot===slot)!
      const activity=missionsForDay(state,1).find(item=>item.mealId===meal.id)!
      applyAction(state,{type:'activity',id:activity.id,done:true},start)
      expect(meal.done).toBe(true)
      applyAction(state,{type:'meal',id:meal.id,done:false},start)
      expect(activity.done).toBe(false)
      applyAction(state,{type:'meal',id:meal.id,done:true},start)
      expect(activity.done).toBe(true)
    }
    expect(participation(state,start).xp).toBe(30)
  })
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
    expect((await load()).activities.length).toBe(841)
  })
  it('não reabre dias antigos concluídos com quatro passos ao acrescentar cardio',()=>{
    const state=create()
    state.activities=state.activities.filter(a=>a.journeyDay!==1||!['journey:cardio','journey:food:breakfast','journey:food:dinner'].includes(a.templateId))
    for(const activity of missionsForDay(state,1))activity.done=true
    const later=addDays(start,2)
    prepareWorkspace(state,later)
    expect(missionsForDay(state,1)).toHaveLength(4)
    expect(dayState(state,1,later)).toBe('completed')
    expect(participation(state,later).xp).toBe(40)
    expect(missionsForDay(state,3)).toHaveLength(7)
  })
  it('recusa trocar o dono e adapta preferências preservando conclusões e início',()=>{
    const state=create(),first=state.activities[0]!
    applyAction(state,{type:'activity',id:first.id,done:true},start)
    applyAction(state,{type:'profile',profile:{...state.profile,allergies:['peixe'],minutes:10}},start)
    expect(state.journey!.startDate).toBe(start)
    expect(state.activities.find(a=>a.id===first.id)!.done).toBe(true)
    expect(state.meals.every(m=>isCompatible(recipeById.get(m.recipeId!)!,state.profile))).toBe(true)
    expect(()=>applyAction(state,{type:'profile',profile:{...state.profile,id:'another'}},start)).toThrow(/perfil/)
  })
  it('troca refeição futura e recalcula compras mantendo itens pessoais',()=>{
    const state=create(),meal=state.meals.find(m=>m.date===addDays(start,1)&&m.slot==='lunch')!
    expect(state.shoppingRange).toEqual({start,days:7})
    expect(state.grocery.some(item=>!item.personal)).toBe(true)
    applyAction(state,{type:'groceries',items:[{id:'personal',name:'Café pessoal',quantity:1,unit:'un',category:'Outros',checked:true,personal:true,sourceKey:null}]},start)
    const alternative=suitableRecipes(state.profile,'lunch').find(r=>r.id!==meal.recipeId&&!state.meals.some(other=>other.date===meal.date&&other.id!==meal.id&&other.recipeId===r.id))!
    applyAction(state,{type:'swapMeal',id:meal.id,recipeId:alternative.id},start)
    expect(state.meals.find(m=>m.id===meal.id)!.recipeId).toBe(alternative.id)
    expect(missionsForDay(state,2).find(a=>a.templateId==='journey:food')!.title).toContain(alternative.name)
    const expected=consolidateIngredients(state.meals.filter(m=>m.date>=start&&m.date<addDays(start,7)))
    expect(state.grocery.filter(i=>!i.personal).map(i=>[i.name,i.quantity])).toEqual(expected.map(i=>[i.name,i.quantity]))
    expect(state.grocery.find(i=>i.id==='personal')!.checked).toBe(true)
    expect(()=>applyAction(state,{type:'meal',id:meal.id,done:true},start)).toThrow(/planejar/)
  })
  it('rejeita troca incompatível e não recomenda ingredientes antigos após nova restrição',()=>{
    const state=create({allergies:['ovos']})
    const meal=state.meals.find(m=>m.date===addDays(start,3)&&m.slot==='breakfast')!
    const incompatible=recipes.find(recipe=>recipe.slots.includes('breakfast')&&recipe.allergens.includes('ovos'))!
    expect(()=>applyAction(state,{type:'swapMeal',id:meal.id,recipeId:incompatible.id},start)).toThrow(/compatível/)
    applyAction(state,{type:'profile',profile:{...state.profile,excludedIngredients:['banana']}},start)
    expect(state.grocery.some(i=>i.name==='banana')).toBe(false)
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
