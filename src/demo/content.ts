import type { Activity, Meal, Profile } from '@/domain/types'

type ActivityTemplate = Omit<Activity, 'id' | 'date' | 'done'>
export const activityTemplates: ActivityTemplate[] = [
  {templateId: 'morning', title: 'Um momento ao ar livre', subtitle: 'Comece o dia com uma pausa para você', category: 'bem-estar', icon: 'sun', time: '07:00', minutes: 10, editable: true, demo: true,
    instructions: ['Reserve um momento da manhã para sair de casa ou apreciar um espaço aberto.', 'Adapte esse momento à sua rotina e às condições do ambiente. Este é um exemplo de organização de hábito, não uma orientação clínica.'], exercises: []},
  {templateId: 'training', title: 'Treino de força', subtitle: 'Seu momento de movimento', category: 'movimento', icon: 'dumbbell', time: '08:00', minutes: 30, editable: true, demo: true,
    instructions: ['Este treino é um exemplo para demonstrar a interface. Não é uma prescrição individualizada.', 'Use o plano orientado pelo profissional que acompanha você. Ajuste os exercícios à sua experiência e disponibilidade.'],
    exercises: [{name: 'Agachamento com peso corporal', sets: '2', reps: '8', rest: '60 s', note: 'Exemplo de conteúdo. Execução e adequação devem ser orientadas por um profissional.'}, {name: 'Flexão com apoio', sets: '2', reps: '8', rest: '60 s', note: 'Exemplo de exercício; adapte somente com orientação.'}, {name: 'Remada com elástico', sets: '2', reps: '10', rest: '60 s', note: 'Exemplo de conteúdo para visualizar séries e repetições.'}]},
  {templateId: 'water', title: 'Pausa para se hidratar', subtitle: 'Um lembrete no meio da rotina', category: 'bem-estar', icon: 'droplet', time: '10:00', minutes: 2, editable: true, demo: true,
    instructions: ['Faça uma pausa e registre seu momento de hidratação.', 'Este lembrete não define uma meta individual de ingestão de água.'], exercises: []},
  {templateId: 'reading', title: 'Leitura e aprendizado', subtitle: 'Algumas páginas, uma nova perspectiva', category: 'bem-estar', icon: 'book', time: '19:00', minutes: 15, editable: true, demo: true,
    instructions: ['Escolha uma leitura que desperte seu interesse.', 'Reserve um intervalo sem distrações. Ao terminar, registre a atividade.'], exercises: []},
  {templateId: 'sleep', title: 'Preparar para descansar', subtitle: 'Desacelere no fim do dia', category: 'sono', icon: 'moon', time: '22:00', minutes: 15, editable: true, demo: true,
    instructions: ['Organize o ambiente e deixe as tarefas do dia seguinte anotadas.', 'O horário é uma preferência sua. Você pode ajustá-lo no perfil. Este conteúdo não substitui acompanhamento para dificuldades de sono.'], exercises: []},
]

type MealTemplate = Omit<Meal, 'id' | 'date' | 'done'>
export const mealTemplates: MealTemplate[] = [
  {templateId: 'breakfast', title: 'Café da manhã', description: 'Iogurte com aveia e frutas', time: '07:30', image: '/images/breakfast.jpg', demo: true, nutrition: null,
    ingredients: [{name: 'Iogurte natural', quantity: 170, unit: 'g', category: 'Laticínios'}, {name: 'Aveia', quantity: 30, unit: 'g', category: 'Grãos e cereais'}, {name: 'Banana', quantity: 1, unit: 'un', category: 'Frutas'}],
    steps: ['Coloque o iogurte em uma tigela.', 'Acrescente a aveia e a banana cortada.', 'Misture e sirva.'], substitutions: ['A banana pode ser substituída por 1 maçã neste exemplo.']},
  {templateId: 'lunch', title: 'Almoço', description: 'Frango grelhado, arroz e vegetais', time: '12:30', image: '/images/lunch.jpg', demo: true, nutrition: null,
    ingredients: [{name: 'Peito de frango', quantity: 150, unit: 'g', category: 'Proteínas'}, {name: 'Arroz integral', quantity: 60, unit: 'g', category: 'Grãos e cereais'}, {name: 'Brócolis', quantity: 100, unit: 'g', category: 'Vegetais'}],
    steps: ['Cozinhe o arroz conforme as instruções da embalagem.', 'Cozinhe os vegetais e prepare o frango até estar completamente cozido.', 'Sirva os ingredientes juntos. As quantidades são ilustrativas.'], substitutions: ['Opção vegetariana cadastrada: tofu no lugar do frango (150 g).']},
  {templateId: 'snack', title: 'Lanche da tarde', description: 'Frutas e castanhas', time: '16:00', image: '/images/snack.jpg', demo: true, nutrition: null,
    ingredients: [{name: 'Maçã', quantity: 1, unit: 'un', category: 'Frutas'}, {name: 'Castanhas', quantity: 20, unit: 'g', category: 'Grãos e cereais'}],
    steps: ['Lave a fruta e separe as castanhas.', 'Monte uma porção para seu intervalo.'], substitutions: []},
  {templateId: 'dinner', title: 'Jantar', description: 'Bowl de grão-de-bico e vegetais', time: '19:30', image: '/images/dinner.jpg', demo: true, nutrition: null,
    ingredients: [{name: 'Grão-de-bico cozido', quantity: 120, unit: 'g', category: 'Grãos e cereais'}, {name: 'Brócolis', quantity: 100, unit: 'g', category: 'Vegetais'}, {name: 'Tomate', quantity: 1, unit: 'un', category: 'Vegetais'}],
    steps: ['Higienize e prepare os vegetais.', 'Misture com o grão-de-bico já cozido.', 'Tempere conforme sua preferência.'], substitutions: []},
]

export function mealsForProfile(profile: Profile): MealTemplate[] {
  return mealTemplates.map(m => profile.diet === 'vegetariana' && m.templateId === 'lunch' ? {...m, description: 'Tofu, arroz e vegetais', ingredients: m.ingredients.map(i => i.name === 'Peito de frango' ? {...i, name: 'Tofu'} : i)} : m)
}
