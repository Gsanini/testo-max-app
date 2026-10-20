import type {Activity, Meal, Profile} from '@/domain/types'
import { pdfMenus, recipeById } from '@/content/recipes'
import { isCompatible, slotNames } from '@/domain/nutrition'

type ActivityTemplate = Omit<Activity, 'id' | 'date' | 'done'>
export const activityTemplates: ActivityTemplate[] = [
  {templateId: 'morning', title: 'Um momento ao ar livre', subtitle: 'Comece o dia com uma pausa para você', category: 'bem-estar', icon: 'sun', time: '07:00', minutes: 10, editable: true, demo: true,
    instructions: ['Reserve um momento da manhã para sair de casa ou apreciar um espaço aberto.', 'Adapte esse momento à sua rotina e às condições do ambiente.'], exercises: []},
  {templateId: 'planning', title: 'Planejar o dia', subtitle: 'Escolha as prioridades da sua rotina', category: 'bem-estar', icon: 'clipboard', time: '07:15', minutes: 5, editable: true, demo: true,
    instructions: ['Observe os compromissos do dia e escolha até três prioridades.', 'Deixe um espaço realista entre as atividades para pausas e imprevistos.'], exercises: []},
  {templateId: 'training', title: 'Treino de força', subtitle: 'Seu momento de movimento', category: 'movimento', icon: 'dumbbell', time: '08:00', minutes: 30, editable: true, demo: true,
    instructions: ['Este treino é um exemplo para demonstrar a interface. Não é uma prescrição individualizada.', 'Use o plano orientado pelo profissional que acompanha você. Ajuste os exercícios à sua experiência e disponibilidade.'],
    exercises: [{name: 'Agachamento com peso corporal', sets: '2', reps: '8', rest: '60 s', note: 'Exemplo de conteúdo. Execução e adequação devem ser orientadas por um profissional.'}, {name: 'Flexão com apoio', sets: '2', reps: '8', rest: '60 s', note: 'Exemplo de exercício; adapte somente com orientação.'}, {name: 'Remada com elástico', sets: '2', reps: '10', rest: '60 s', note: 'Exemplo de conteúdo para visualizar séries e repetições.'}]},
  {templateId: 'water', title: 'Pausa para se hidratar', subtitle: 'Um lembrete no meio da rotina', category: 'bem-estar', icon: 'droplet', time: '10:00', minutes: 2, editable: true, demo: true,
    instructions: ['Faça uma pausa e registre seu momento de hidratação.', 'Este lembrete não define uma meta individual de ingestão de água.'], exercises: []},
  {templateId: 'mobility', title: 'Pausa de mobilidade', subtitle: 'Movimente o corpo entre as tarefas', category: 'movimento', icon: 'stretch', time: '15:00', minutes: 5, editable: true, demo: true,
    instructions: ['Interrompa a posição mantida por muito tempo e caminhe por alguns minutos.', 'Escolha movimentos confortáveis e interrompa se sentir desconforto.'], exercises: []},
  {templateId: 'meal-planning', title: 'Organizar a alimentação', subtitle: 'Antecipe a próxima refeição', category: 'alimentacao', icon: 'utensils', time: '18:00', minutes: 10, editable: true, demo: true,
    instructions: ['Confira a próxima refeição e os ingredientes disponíveis.', 'Use a lista de compras para registrar o que estiver faltando.'], exercises: []},
  {templateId: 'reading', title: 'Leitura e aprendizado', subtitle: 'Algumas páginas, uma nova perspectiva', category: 'bem-estar', icon: 'book', time: '19:00', minutes: 15, editable: true, demo: true,
    instructions: ['Escolha uma leitura que desperte seu interesse.', 'Reserve um intervalo sem distrações. Ao terminar, registre a atividade.'], exercises: []},
  {templateId: 'sleep', title: 'Preparar para descansar', subtitle: 'Desacelere no fim do dia', category: 'sono', icon: 'moon', time: '22:00', minutes: 15, editable: true, demo: true,
    instructions: ['Organize o ambiente e deixe as tarefas do dia seguinte anotadas.', 'O horário é uma preferência sua. Você pode ajustá-lo no perfil.'], exercises: []},
]

type MealTemplate = Omit<Meal, 'id' | 'date' | 'done'>
function meal(template: Omit<MealTemplate, 'demo' | 'nutrition'>): MealTemplate {
  return {...template, demo: true, nutrition: null}
}

export const mealTemplates:MealTemplate[] = (['breakfast','lunch','dinner'] as const).map((slot,index)=>{
  const recipe=recipeById.get(pdfMenus[0]!.recipes[slot])!
  return meal({templateId:slot,recipeId:recipe.id,slot,title:slotNames[slot],description:recipe.name,time:['07:30','12:30','19:30'][index]!,image:'',ingredients:recipe.ingredients,steps:recipe.steps,substitutions:[]})
})

export function mealsForProfile(profile:Profile):MealTemplate[] {
  return mealTemplates.filter(template=>isCompatible(recipeById.get(template.recipeId!)!,profile))
}
