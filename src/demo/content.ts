import type {Activity, Meal, Profile} from '@/domain/types'

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

const variedMeals: MealTemplate[] = [
  meal({templateId: 'breakfast', title: 'Café da manhã', description: 'Iogurte com aveia e banana', time: '07:30', image: '/images/breakfast.jpg',
    ingredients: [{name: 'Iogurte natural', quantity: 170, unit: 'g', category: 'Laticínios'}, {name: 'Aveia', quantity: 30, unit: 'g', category: 'Grãos e cereais'}, {name: 'Banana', quantity: 1, unit: 'un', category: 'Frutas'}],
    steps: ['Coloque o iogurte em uma tigela.', 'Acrescente a aveia e a banana cortada.'], substitutions: ['Troque a banana por uma maçã.']}),
  meal({templateId: 'morning-snack', title: 'Lanche da manhã', description: 'Pão integral com ovo e tomate', time: '10:15', image: '/images/snack.jpg',
    ingredients: [{name: 'Pão integral', quantity: 2, unit: 'un', category: 'Pães'}, {name: 'Ovo', quantity: 1, unit: 'un', category: 'Proteínas'}, {name: 'Tomate', quantity: 1, unit: 'un', category: 'Vegetais'}],
    steps: ['Prepare o ovo até ficar completamente cozido.', 'Monte com o pão e o tomate.'], substitutions: ['Use queijo branco no lugar do ovo.']}),
  meal({templateId: 'lunch', title: 'Almoço', description: 'Frango, arroz, feijão e salada', time: '12:30', image: '/images/lunch.jpg',
    ingredients: [{name: 'Peito de frango', quantity: 150, unit: 'g', category: 'Proteínas'}, {name: 'Arroz integral', quantity: 60, unit: 'g', category: 'Grãos e cereais'}, {name: 'Feijão', quantity: 100, unit: 'g', category: 'Leguminosas'}, {name: 'Folhas verdes', quantity: 80, unit: 'g', category: 'Vegetais'}],
    steps: ['Cozinhe o arroz e o feijão.', 'Prepare o frango até estar completamente cozido.', 'Sirva com as folhas higienizadas.'], substitutions: ['Troque o frango por peixe.']}),
  meal({templateId: 'snack', title: 'Lanche da tarde', description: 'Maçã com castanhas', time: '16:00', image: '/images/snack.jpg',
    ingredients: [{name: 'Maçã', quantity: 1, unit: 'un', category: 'Frutas'}, {name: 'Castanhas', quantity: 20, unit: 'g', category: 'Oleaginosas'}],
    steps: ['Lave a fruta e separe as castanhas.'], substitutions: ['Troque a maçã por uma pera.']}),
  meal({templateId: 'dinner', title: 'Jantar', description: 'Peixe, batata e vegetais', time: '19:30', image: '/images/dinner.jpg',
    ingredients: [{name: 'Filé de peixe', quantity: 150, unit: 'g', category: 'Proteínas'}, {name: 'Batata', quantity: 180, unit: 'g', category: 'Tubérculos'}, {name: 'Brócolis', quantity: 100, unit: 'g', category: 'Vegetais'}],
    steps: ['Asse a batata e cozinhe os vegetais.', 'Prepare o peixe até estar completamente cozido.'], substitutions: ['Troque a batata por mandioca.']}),
  meal({templateId: 'supper', title: 'Ceia', description: 'Iogurte com kiwi', time: '21:30', image: '/images/breakfast.jpg',
    ingredients: [{name: 'Iogurte natural', quantity: 120, unit: 'g', category: 'Laticínios'}, {name: 'Kiwi', quantity: 1, unit: 'un', category: 'Frutas'}],
    steps: ['Corte o kiwi e sirva com o iogurte.'], substitutions: ['Troque o kiwi por morangos.']}),
]

const vegetarianMeals: MealTemplate[] = [
  meal({templateId: 'breakfast', title: 'Café da manhã', description: 'Overnight oats com frutas', time: '07:30', image: '/images/breakfast.jpg',
    ingredients: [{name: 'Iogurte natural', quantity: 170, unit: 'g', category: 'Laticínios'}, {name: 'Aveia', quantity: 40, unit: 'g', category: 'Grãos e cereais'}, {name: 'Morangos', quantity: 100, unit: 'g', category: 'Frutas'}],
    steps: ['Misture o iogurte e a aveia.', 'Deixe na geladeira e acrescente os morangos ao servir.'], substitutions: ['Use banana no lugar dos morangos.']}),
  meal({templateId: 'morning-snack', title: 'Lanche da manhã', description: 'Torrada com ricota e tomate', time: '10:15', image: '/images/snack.jpg',
    ingredients: [{name: 'Pão integral', quantity: 2, unit: 'un', category: 'Pães'}, {name: 'Ricota', quantity: 60, unit: 'g', category: 'Laticínios'}, {name: 'Tomate', quantity: 1, unit: 'un', category: 'Vegetais'}],
    steps: ['Espalhe a ricota sobre as torradas.', 'Finalize com o tomate.'], substitutions: ['Use queijo branco no lugar da ricota.']}),
  meal({templateId: 'lunch', title: 'Almoço', description: 'Tofu, arroz e vegetais', time: '12:30', image: '/images/lunch.jpg',
    ingredients: [{name: 'Tofu', quantity: 150, unit: 'g', category: 'Proteínas'}, {name: 'Arroz integral', quantity: 60, unit: 'g', category: 'Grãos e cereais'}, {name: 'Brócolis', quantity: 100, unit: 'g', category: 'Vegetais'}, {name: 'Cenoura', quantity: 80, unit: 'g', category: 'Vegetais'}],
    steps: ['Cozinhe o arroz e os vegetais.', 'Doure o tofu e sirva os ingredientes juntos.'], substitutions: ['Troque o tofu por grão-de-bico.']}),
  meal({templateId: 'snack', title: 'Lanche da tarde', description: 'Iogurte, mamão e sementes', time: '16:00', image: '/images/snack.jpg',
    ingredients: [{name: 'Iogurte natural', quantity: 170, unit: 'g', category: 'Laticínios'}, {name: 'Mamão', quantity: 150, unit: 'g', category: 'Frutas'}, {name: 'Sementes de abóbora', quantity: 15, unit: 'g', category: 'Oleaginosas'}],
    steps: ['Corte o mamão e sirva com o iogurte e as sementes.'], substitutions: ['Troque o mamão por manga.']}),
  meal({templateId: 'dinner', title: 'Jantar', description: 'Omelete com legumes e batata', time: '19:30', image: '/images/dinner.jpg',
    ingredients: [{name: 'Ovo', quantity: 2, unit: 'un', category: 'Proteínas'}, {name: 'Abobrinha', quantity: 100, unit: 'g', category: 'Vegetais'}, {name: 'Batata', quantity: 150, unit: 'g', category: 'Tubérculos'}],
    steps: ['Cozinhe a batata.', 'Prepare a omelete com a abobrinha até os ovos estarem completamente cozidos.'], substitutions: ['Troque a abobrinha por espinafre.']}),
  meal({templateId: 'supper', title: 'Ceia', description: 'Banana com canela', time: '21:30', image: '/images/breakfast.jpg',
    ingredients: [{name: 'Banana', quantity: 1, unit: 'un', category: 'Frutas'}, {name: 'Canela', quantity: 2, unit: 'g', category: 'Temperos'}],
    steps: ['Corte a banana e finalize com canela.'], substitutions: ['Troque a banana por maçã.']}),
]

const veganMeals: MealTemplate[] = [
  meal({templateId: 'breakfast', title: 'Café da manhã', description: 'Mingau de aveia com banana', time: '07:30', image: '/images/breakfast.jpg',
    ingredients: [{name: 'Bebida de aveia', quantity: 200, unit: 'ml', category: 'Bebidas'}, {name: 'Aveia', quantity: 40, unit: 'g', category: 'Grãos e cereais'}, {name: 'Banana', quantity: 1, unit: 'un', category: 'Frutas'}],
    steps: ['Cozinhe a aveia com a bebida vegetal.', 'Finalize com a banana cortada.'], substitutions: ['Use bebida de soja no lugar da bebida de aveia.']}),
  meal({templateId: 'morning-snack', title: 'Lanche da manhã', description: 'Pão com homus e cenoura', time: '10:15', image: '/images/snack.jpg',
    ingredients: [{name: 'Pão integral', quantity: 2, unit: 'un', category: 'Pães'}, {name: 'Homus', quantity: 50, unit: 'g', category: 'Leguminosas'}, {name: 'Cenoura', quantity: 1, unit: 'un', category: 'Vegetais'}],
    steps: ['Espalhe o homus sobre o pão.', 'Sirva com a cenoura em palitos.'], substitutions: ['Use pepino no lugar da cenoura.']}),
  meal({templateId: 'lunch', title: 'Almoço', description: 'Grão-de-bico, quinoa e legumes', time: '12:30', image: '/images/lunch.jpg',
    ingredients: [{name: 'Grão-de-bico cozido', quantity: 140, unit: 'g', category: 'Leguminosas'}, {name: 'Quinoa', quantity: 60, unit: 'g', category: 'Grãos e cereais'}, {name: 'Abobrinha', quantity: 100, unit: 'g', category: 'Vegetais'}, {name: 'Tomate', quantity: 1, unit: 'un', category: 'Vegetais'}],
    steps: ['Cozinhe a quinoa.', 'Refogue os legumes e misture com o grão-de-bico.'], substitutions: ['Troque o grão-de-bico por lentilha.']}),
  meal({templateId: 'snack', title: 'Lanche da tarde', description: 'Frutas com pasta de amendoim', time: '16:00', image: '/images/snack.jpg',
    ingredients: [{name: 'Maçã', quantity: 1, unit: 'un', category: 'Frutas'}, {name: 'Pasta de amendoim', quantity: 20, unit: 'g', category: 'Oleaginosas'}],
    steps: ['Corte a maçã e sirva com a pasta de amendoim.'], substitutions: ['Troque a maçã por banana.']}),
  meal({templateId: 'dinner', title: 'Jantar', description: 'Sopa de lentilha com legumes', time: '19:30', image: '/images/dinner.jpg',
    ingredients: [{name: 'Lentilha', quantity: 100, unit: 'g', category: 'Leguminosas'}, {name: 'Batata', quantity: 120, unit: 'g', category: 'Tubérculos'}, {name: 'Cenoura', quantity: 80, unit: 'g', category: 'Vegetais'}, {name: 'Couve', quantity: 60, unit: 'g', category: 'Vegetais'}],
    steps: ['Cozinhe a lentilha, a batata e a cenoura.', 'Acrescente a couve ao final do preparo.'], substitutions: ['Troque a batata por mandioca.']}),
  meal({templateId: 'supper', title: 'Ceia', description: 'Mamão com chia', time: '21:30', image: '/images/breakfast.jpg',
    ingredients: [{name: 'Mamão', quantity: 150, unit: 'g', category: 'Frutas'}, {name: 'Chia', quantity: 10, unit: 'g', category: 'Sementes'}],
    steps: ['Corte o mamão e acrescente a chia.'], substitutions: ['Troque o mamão por manga.']}),
]

const mediterraneanMeals: MealTemplate[] = [
  meal({templateId: 'breakfast', title: 'Café da manhã', description: 'Iogurte, frutas e nozes', time: '07:30', image: '/images/breakfast.jpg',
    ingredients: [{name: 'Iogurte natural', quantity: 170, unit: 'g', category: 'Laticínios'}, {name: 'Uvas', quantity: 100, unit: 'g', category: 'Frutas'}, {name: 'Nozes', quantity: 20, unit: 'g', category: 'Oleaginosas'}],
    steps: ['Sirva o iogurte com as uvas e as nozes.'], substitutions: ['Troque as uvas por morangos.']}),
  meal({templateId: 'morning-snack', title: 'Lanche da manhã', description: 'Pera com amêndoas', time: '10:15', image: '/images/snack.jpg',
    ingredients: [{name: 'Pera', quantity: 1, unit: 'un', category: 'Frutas'}, {name: 'Amêndoas', quantity: 20, unit: 'g', category: 'Oleaginosas'}],
    steps: ['Lave a pera e separe as amêndoas.'], substitutions: ['Troque a pera por maçã.']}),
  meal({templateId: 'lunch', title: 'Almoço', description: 'Peixe, cuscuz e salada colorida', time: '12:30', image: '/images/lunch.jpg',
    ingredients: [{name: 'Filé de peixe', quantity: 150, unit: 'g', category: 'Proteínas'}, {name: 'Cuscuz marroquino', quantity: 60, unit: 'g', category: 'Grãos e cereais'}, {name: 'Tomate', quantity: 1, unit: 'un', category: 'Vegetais'}, {name: 'Pepino', quantity: 1, unit: 'un', category: 'Vegetais'}],
    steps: ['Prepare o cuscuz.', 'Cozinhe o peixe completamente e sirva com a salada.'], substitutions: ['Troque o peixe por grão-de-bico.']}),
  meal({templateId: 'snack', title: 'Lanche da tarde', description: 'Homus com vegetais', time: '16:00', image: '/images/snack.jpg',
    ingredients: [{name: 'Homus', quantity: 60, unit: 'g', category: 'Leguminosas'}, {name: 'Cenoura', quantity: 1, unit: 'un', category: 'Vegetais'}, {name: 'Pepino', quantity: 1, unit: 'un', category: 'Vegetais'}],
    steps: ['Corte os vegetais em palitos e sirva com o homus.'], substitutions: ['Use tomate-cereja no lugar do pepino.']}),
  meal({templateId: 'dinner', title: 'Jantar', description: 'Massa integral com tomate e grão-de-bico', time: '19:30', image: '/images/dinner.jpg',
    ingredients: [{name: 'Massa integral', quantity: 80, unit: 'g', category: 'Grãos e cereais'}, {name: 'Grão-de-bico cozido', quantity: 100, unit: 'g', category: 'Leguminosas'}, {name: 'Tomate', quantity: 2, unit: 'un', category: 'Vegetais'}, {name: 'Azeite', quantity: 10, unit: 'ml', category: 'Óleos'}],
    steps: ['Cozinhe a massa.', 'Prepare o molho de tomate e misture com o grão-de-bico.'], substitutions: ['Troque a massa por arroz integral.']}),
  meal({templateId: 'supper', title: 'Ceia', description: 'Morangos com iogurte', time: '21:30', image: '/images/breakfast.jpg',
    ingredients: [{name: 'Morangos', quantity: 100, unit: 'g', category: 'Frutas'}, {name: 'Iogurte natural', quantity: 120, unit: 'g', category: 'Laticínios'}],
    steps: ['Higienize os morangos e sirva com o iogurte.'], substitutions: ['Troque os morangos por kiwi.']}),
]

export const mealTemplates = variedMeals
const mealPlans: Record<Profile['diet'], MealTemplate[]> = {
  variada: variedMeals,
  vegetariana: vegetarianMeals,
  vegana: veganMeals,
  mediterranea: mediterraneanMeals,
}

export function mealsForProfile(profile: Profile): MealTemplate[] {
  return mealPlans[profile.diet]
}
