import { workspaceSchema, type Action, type Profile, type Workspace } from '@/domain/types'
import { addDays, dateKey, defaultTimezone, weekday } from '@/domain/dates'
import { activityTemplates, mealsForProfile } from './content'

// Cada navegador mantém sua própria rotina, sem conta ou backend remoto.
export const storageKey = 'testomax:local-workspace:v1'
const legacyStorageKey = 'testomax:development-demo:v1'
const initialProfile: Profile = {id: 'local', goal: 'consistencia', experience: 'iniciante', trainingDays: [1,2,3,4,5], minutes: 30, wakeTime: '07:00', sleepTime: '22:00', diet: 'variada', timezone: defaultTimezone, onboarded: false}
const programPhases: Workspace['phases'] = [
  {id: 'base', name: 'Começo consciente', description: 'Conheça a rotina e encontre horários que funcionam no seu dia.', current: true},
  {id: 'consistency', name: 'Ritmo e consistência', description: 'Repita as ações essenciais e acompanhe sua evolução semanal.', current: false},
  {id: 'nutrition', name: 'Alimentação organizada', description: 'Planeje refeições e compras com mais praticidade.', current: false},
  {id: 'movement', name: 'Movimento progressivo', description: 'Ajuste frequência e duração conforme sua experiência.', current: false},
  {id: 'autonomy', name: 'Autonomia e manutenção', description: 'Revise as preferências para sustentar uma rotina possível.', current: false},
]
function generateDays(state: Workspace) {
  state.phases = programPhases.map(phase => ({...phase}))
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
  const raw = localStorage.getItem(storageKey) ?? localStorage.getItem(legacyStorageKey)
  if (raw) return generateDays(workspaceSchema.parse(JSON.parse(raw)))
  return generateDays({profile: initialProfile, activities: [], meals: [], grocery: [], phases: programPhases})
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
export function clear() {localStorage.removeItem(storageKey);localStorage.removeItem(legacyStorageKey)}
