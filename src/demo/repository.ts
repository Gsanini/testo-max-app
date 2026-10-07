import { workspaceSchema, type Action, type Profile, type Workspace } from '@/domain/types'
import { addDays, dateKey, defaultTimezone, weekday } from '@/domain/dates'
import { activityTemplates, mealsForProfile } from './content'

// Este módulo é importado dinamicamente somente dentro de import.meta.env.DEV.
const storageKey = 'testomax:development-demo:v1'
const initialProfile: Profile = {id: 'demo', name: 'Gabriel', goal: 'consistencia', experience: 'iniciante', trainingDays: [1,2,3,4,5], minutes: 30, wakeTime: '07:00', sleepTime: '22:00', diet: 'variada', timezone: defaultTimezone, onboarded: true}
function generateDays(state: Workspace) {
  if (!state.profile.onboarded) return state
  const today = dateKey(state.profile.timezone)
  for (let offset = 0; offset < 8; offset++) {
    const date = addDays(today, offset)
    for (const template of activityTemplates) {
      if (template.templateId === 'training' && !state.profile.trainingDays.includes(weekday(date))) continue
      if (state.activities.some(a => a.date === date && a.templateId === template.templateId)) continue
      const personalized = template.templateId === 'reading' && state.profile.goal === 'energia'
        ? {...template, title: 'Uma pausa para você', subtitle: 'Deixe um espaço livre no dia', minutes: 10, instructions: ['Reserve um momento para uma atividade tranquila de sua preferência.', 'Este exemplo organiza uma pausa, sem orientações clínicas.']}
        : template.templateId === 'training' && state.profile.experience === 'iniciante'
          ? {...template, title: 'Começar a se movimentar', subtitle: 'Encontre sua atividade inicial', exercises: [], instructions: ['Reserve esse horário para uma atividade orientada pelo profissional que acompanha você.', 'Este exemplo para iniciantes não prescreve exercícios, carga ou intensidade.']}
          : template
      state.activities.push({...personalized, id: `${date}-${template.templateId}`, date, done: false,
        time: template.templateId === 'morning' ? state.profile.wakeTime : template.templateId === 'sleep' ? state.profile.sleepTime : template.time,
        minutes: template.templateId === 'training' ? state.profile.minutes : personalized.minutes})
    }
    for (const template of mealsForProfile(state.profile)) {
      if (!state.meals.some(m => m.date === date && m.templateId === template.templateId)) state.meals.push({...template, id: `${date}-${template.templateId}`, date, done: false})
    }
  }
  return state
}
function read(): Workspace {
  const raw = localStorage.getItem(storageKey)
  if (raw) return generateDays(workspaceSchema.parse(JSON.parse(raw)))
  return generateDays({profile: initialProfile, activities: [], meals: [], grocery: [], phases: [
    {id: 'base', name: 'Construir a base', description: 'Conheça sua rotina e encontre os horários que funcionam para você.', current: true},
    {id: 'consistency', name: 'Criar consistência', description: 'Mantenha seus registros e ajuste sua organização.', current: false},
    {id: 'autonomy', name: 'Sua rotina, seu ritmo', description: 'Revise as preferências para continuar com autonomia.', current: false},
  ]})
}
export async function load(): Promise<Workspace> { const state = read(); localStorage.setItem(storageKey, JSON.stringify(state)); return state }
export async function mutate(action: Action): Promise<void> {
  const state = read()
  switch (action.type) {
    case 'activity': state.activities = state.activities.map(a => a.id === action.id ? {...a, done: action.done} : a); break
    case 'meal': state.meals = state.meals.map(m => m.id === action.id ? {...m, done: action.done} : m); break
    case 'time': state.activities = state.activities.map(a => a.id === action.id ? {...a, time: action.time} : a); break
    case 'profile': {
      state.profile = action.profile
      const today = dateKey(action.profile.timezone)
      state.activities = state.activities.filter(a => a.date <= today)
      state.meals = state.meals.filter(m => m.date <= today)
      generateDays(state); break
    }
    case 'groceries': if (action.replaceGenerated) state.grocery = state.grocery.filter(i => i.personal); for (const item of action.items) {state.grocery = state.grocery.filter(i => i.id !== item.id); state.grocery.push(item)} break
    case 'removeGrocery': state.grocery = state.grocery.filter(i => i.id !== action.id); break
  }
  localStorage.setItem(storageKey, JSON.stringify(state))
}
export function clear() {localStorage.removeItem(storageKey)}
