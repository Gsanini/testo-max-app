import type { Profile } from '@/domain/types'

export type WellnessStep = { title: string; how: string; purpose: string; alternative: string }

type StepFactory = (minutes:number,time:string) => WellnessStep

const minuteText = (minutes:number) => `${minutes} minuto${minutes===1?'':'s'}`

// Every habit states when, for how long and what counts as complete.
const dailyHabitFactories: StepFactory[] = [
  (minutes,time)=>({title:`Luz natural por ${minuteText(minutes)}`,how:`Às ${time}, fique ${minuteText(minutes)} ao ar livre, na luz da manhã. Não olhe diretamente para o sol.`,purpose:'Luz natural cedo ajuda a organizar o horário de sono.',alternative:`Se não puder sair, passe ${minuteText(minutes)} perto da janela mais iluminada.`}),
  (minutes,time)=>({title:`Caminhar por ${minuteText(minutes)}`,how:`Às ${time}, levante-se e caminhe por ${minuteText(minutes)} em ritmo confortável.`,purpose:'Pausas com movimento ajudam a reduzir o tempo sedentário.',alternative:`Caminhe parado ou mova braços e pernas sentado por ${minuteText(minutes)}.`}),
  (minutes,time)=>({title:`Programar o descanso às ${time}`,how:`Às ${time}, use ${minuteText(minutes)} para encerrar uma tarefa e ativar um alarme para a hora de dormir.`,purpose:'Um horário de sono mais regular ajuda a descansar melhor.',alternative:`Leve ${minuteText(minutes)} apenas para anotar onde retomará a tarefa amanhã.`}),
  (minutes,time)=>({title:`Definir a próxima refeição às ${time}`,how:`Às ${time}, use ${minuteText(minutes)} para escolher a próxima refeição e conferir se os ingredientes estão disponíveis.`,purpose:'Planejar reduz decisões de última hora e facilita seguir o cardápio do dia.',alternative:`Em ${minuteText(minutes)}, confira a refeição do dia e anote o ingrediente que falta.`}),
  (minutes,time)=>({title:`Respirar por ${minuteText(minutes)}`,how:`Às ${time}, sente-se, solte os ombros e respire devagar por ${minuteText(minutes)}, sem prender o ar.`,purpose:'Uma pausa breve pode ajudar a perceber e aliviar a tensão do dia.',alternative:`Faça ${Math.max(3,minutes)} respirações lentas, sentado e sem forçar.`}),
  (minutes,time)=>({title:`Preparar a água às ${time}`,how:`Às ${time}, use ${minuteText(minutes)} para encher uma garrafa e deixá-la ao alcance. Beba conforme a sede e suas orientações de saúde.`,purpose:'Ter água por perto facilita a hidratação ao longo do dia.',alternative:'Encha um copo agora e deixe-o visível.'}),
  (minutes,time)=>({title:'Registrar 1 acerto do dia',how:`Às ${time}, use ${minuteText(minutes)} para escrever uma ação que realizou e o que tornou esse passo possível.`,purpose:'Um registro concreto ajuda a identificar o que vale repetir.',alternative:'Escreva apenas uma frase: “Hoje eu consegui…”.'}),
  (minutes,time)=>({title:'Passar a noite sem álcool',how:`Às ${time}, separe uma bebida sem álcool para o restante da noite e registre a escolha como concluída.`,purpose:'O álcool pode fragmentar o sono, mesmo quando dá sonolência no início.',alternative:`Use ${minuteText(minutes)} para deixar água ou outra bebida sem álcool pronta.`}),
  (minutes,time)=>({title:'Separar 3 itens para amanhã',how:`Às ${time}, use ${minuteText(minutes)} para separar três itens necessários para o treino, a caminhada ou uma refeição de amanhã.`,purpose:'Preparar itens com antecedência reduz barreiras para começar.',alternative:'Separe somente o primeiro item que usará amanhã.'}),
  (minutes,time)=>({title:`Fazer uma pausa de ${minuteText(minutes)}`,how:`Às ${time}, bloqueie ${minuteText(minutes)} na agenda para caminhar ou mudar de posição.`,purpose:'O movimento pode ser distribuído ao longo do dia.',alternative:`Ao terminar sua próxima tarefa, levante-se por ${minuteText(minutes)}.`}),
  (minutes,time)=>({title:'Dar uma nota para sua energia',how:`Às ${time}, use ${minuteText(minutes)} para dar uma nota de 0 a 10 à sua energia. Se for 4 ou menos, faça a versão leve do treino.`,purpose:'Usar um critério definido ajuda a ajustar a atividade ao dia.',alternative:'Se estiver com dor ou mal-estar, pule o treino e priorize recuperação.'}),
  (minutes,time)=>({title:'Anotar 3 tarefas de amanhã',how:`Às ${time}, use ${minuteText(minutes)} para anotar no máximo três tarefas de amanhã e encerrar o trabalho de hoje.`,purpose:'Um encerramento claro ajuda a proteger o período de descanso.',alternative:'Anote somente a primeira tarefa de amanhã.'}),
]

export const dailyHabitMinutes = [10,5,5,5,2,2,3,2,5,5,2,5] as const

export function dailyHabit(day:number,minutes:number,time:string):WellnessStep {
  return dailyHabitFactories[(day-1)%dailyHabitFactories.length]!(minutes,time)
}

const sleepActions = [
  (time:string,minutes:number)=>`Às ${time}, encerre as tarefas e fique ${minuteText(minutes)} sem iniciar outra atividade.`,
  (time:string,minutes:number)=>`Às ${time}, reduza as luzes do ambiente durante ${minuteText(minutes)}.`,
  (time:string,minutes:number)=>`Às ${time}, deixe celular, televisão e computador de lado por ${minuteText(minutes)}.`,
  (time:string,minutes:number)=>`Às ${time}, use ${minuteText(minutes)} para escurecer o quarto, reduzir ruídos e ajustar a temperatura.`,
  (time:string,minutes:number)=>`Às ${time}, anote a primeira tarefa de amanhã e encerre o planejamento em ${minuteText(minutes)}.`,
  (time:string,minutes:number)=>`Às ${time}, inicie seu ritual de sono e mantenha-o por ${minuteText(minutes)}.`,
  (time:string,minutes:number)=>`Às ${time}, faça uma leitura leve, ouça música calma ou fique em silêncio por ${minuteText(minutes)}.`,
  (time:string,minutes:number)=>`Às ${time}, repita por ${minuteText(minutes)} a ação de descanso que melhor funcionou nesta semana.`,
]

const clockMinutes = (time:string) => {const [hour,minute]=time.split(':').map(Number);return hour!*60+minute!}
const shiftClock = (time:string,minutes:number) => {const total=((clockMinutes(time)+minutes)%1440+1440)%1440;return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`}
const sleepDuration = (bedtime:string,wakeTime:string) => (clockMinutes(wakeTime)-clockMinutes(bedtime)+1440)%1440
const durationText = (minutes:number) => `${Math.floor(minutes/60)} h${minutes%60?` ${minutes%60} min`:''}`

export function sleepHabit(day:number,minutes:number,profile:Pick<Profile,'sleepTime'|'wakeTime'>):WellnessStep&{time:string} {
  const duration=sleepDuration(profile.sleepTime,profile.wakeTime)
  const start=shiftClock(profile.sleepTime,-minutes)
  const minimumBedtime=shiftClock(profile.wakeTime,-420)
  const durationGuidance=duration<420
    ? `Esse intervalo soma ${durationText(duration)}. Para reservar pelo menos 7 h, deite até ${minimumBedtime}.`
    : `Esse intervalo reserva ${durationText(duration)} de sono.`
  return {
    title:`Dormir às ${profile.sleepTime} · ${durationText(duration)}`,
    how:`${sleepActions[(day-1)%sleepActions.length]!(start,minutes)} Deite às ${profile.sleepTime} e programe o despertar para ${profile.wakeTime}. ${durationGuidance}`,
    purpose:'A maioria dos adultos precisa de pelo menos sete horas de sono e se beneficia de horários regulares.',
    alternative:`Se o dia sair do planejado, preserve ao menos 7 h: para acordar às ${profile.wakeTime}, deite até ${minimumBedtime}.`,
    time:start,
  }
}

export const recoveryPlans: WellnessStep[] = [
  {title:'Recuperação: mobilidade suave',how:'Mova ombros e quadris lentamente, apenas em amplitudes confortáveis.',purpose:'Dias leves permitem recuperar entre sessões de força.',alternative:'Descanse ou mude de posição por um momento.'},
  {title:'Recuperação: alongar sem forçar',how:'Faça movimentos suaves para pescoço, braços e pernas, sem insistir em posições dolorosas.',purpose:'Uma pausa leve mantém o hábito de movimento sem exigir intensidade.',alternative:'Descanse em uma posição confortável.'},
  {title:'Recuperação: equilíbrio com apoio',how:'Perto de uma parede ou cadeira estável, alterne o apoio entre os pés com calma.',purpose:'Hoje o foco é movimento leve e controle, não carga.',alternative:'Sente-se e mova os tornozelos suavemente.'},
  {title:'Recuperação: postura e respiração',how:'Mude de posição, relaxe os ombros e respire de forma confortável.',purpose:'A recuperação faz parte de uma rotina de treino sustentável.',alternative:'Faça uma pausa sem exercício.'},
  {title:'Recuperação: movimento articular',how:'Faça círculos pequenos com ombros e tornozelos, sem desconforto.',purpose:'Um dia leve ajuda a separar as sessões de força.',alternative:'Descanse se estiver dolorido ou cansado.'},
  {title:'Recuperação: pausa ativa',how:'Levante-se, caminhe alguns passos com conforto e volte a descansar.',purpose:'É possível se movimentar sem transformar todo dia em treino intenso.',alternative:'Mude de posição sentado.'},
  {title:'Recuperação: escolha o descanso',how:'Observe como o corpo responde e escolha mobilidade leve ou descanso completo.',purpose:'Respeitar o cansaço ajuda a manter a rotina ao longo das semanas.',alternative:'Marque este passo depois de reservar o descanso de que precisa.'},
]

export function recoveryStep(day:number,minutes:number):WellnessStep {
  const step=recoveryPlans[(day-1)%recoveryPlans.length]!
  return {...step,how:`Por ${minuteText(minutes)}, ${step.how.charAt(0).toLocaleLowerCase('pt-BR')}${step.how.slice(1)}`,alternative:`Se houver dor ou indisposição, pare e descanse por ${minuteText(minutes)}.`}
}

type Exercise = {home: string; gym: string; note: string}
export const exercises = {
  chairSquat:{home:'Sentar e levantar de uma cadeira estável',gym:'Leg press com carga leve',note:'Use apoio e uma amplitude confortável.'},
  wallPush:{home:'Flexão na parede',gym:'Supino na máquina com carga leve',note:'Mantenha o movimento controlado, sem prender a respiração.'},
  bridge:{home:'Elevação de quadril no chão',gym:'Elevação de quadril com peso corporal',note:'Suba apenas até onde for confortável.'},
  row:{home:'Puxar os cotovelos para trás sem carga',gym:'Remada sentada com carga leve',note:'Aproxime as escápulas sem forçar o pescoço.'},
  calf:{home:'Elevação de panturrilhas com apoio',gym:'Elevação de panturrilhas com apoio',note:'Segure em um apoio estável se precisar.'},
  birdDog:{home:'Estender braço e perna opostos em quatro apoios',gym:'Estender braço e perna opostos em quatro apoios',note:'Mantenha o tronco estável; faça apenas os braços se preferir.'},
  sitToStand:{home:'Levantar da cadeira e voltar devagar',gym:'Agachamento curto sem carga',note:'A cadeira pode servir de referência para o movimento.'},
  sideStep:{home:'Passos laterais com apoio próximo',gym:'Passos laterais sem carga',note:'Dê passos curtos e mantenha um apoio por perto.'},
  heelRaise:{home:'Elevar os calcanhares sentado',gym:'Elevar os calcanhares sentado',note:'Faça o movimento devagar, sem dor.'},
  plankWall:{home:'Sustentar o tronco inclinado na parede',gym:'Prancha inclinada em apoio estável',note:'Pare antes de perder o controle da postura.'},
  kneeLift:{home:'Elevar um joelho por vez com apoio',gym:'Elevar um joelho por vez com apoio',note:'Mantenha-se perto de um apoio estável.'},
  shoulder:{home:'Elevar os braços sem carga até onde for confortável',gym:'Elevação de braços com carga leve',note:'Não eleve se houver desconforto no ombro.'},
} satisfies Record<string, Exercise>
export type ExerciseId = keyof typeof exercises

export const strengthPlans: {title:string; moves:ExerciseId[]}[] = [
  {title:'Força: pernas e apoio',moves:['chairSquat','calf','birdDog']},
  {title:'Força: peito e postura',moves:['wallPush','row','plankWall']},
  {title:'Força: quadril e equilíbrio',moves:['bridge','kneeLift','sideStep']},
  {title:'Força: levantar e estabilizar',moves:['sitToStand','plankWall','shoulder']},
  {title:'Força: corpo todo com controle',moves:['chairSquat','wallPush','row']},
  {title:'Força: quadril e panturrilhas',moves:['bridge','calf','birdDog']},
  {title:'Força: empurrar e sustentar',moves:['wallPush','shoulder','plankWall']},
  {title:'Força: pernas em movimento',moves:['sideStep','sitToStand','kneeLift']},
  {title:'Força: costas e tronco',moves:['row','birdDog','bridge']},
  {title:'Força: apoio e estabilidade',moves:['calf','plankWall','sideStep']},
  {title:'Força: levantar com confiança',moves:['sitToStand','wallPush','calf']},
  {title:'Força: postura de corpo todo',moves:['chairSquat','row','shoulder']},
]

const cardioByLocation = {
  casa:[
    'Caminhar pelos cômodos', 'Marchar suavemente no lugar', 'Passos laterais ao som de música', 'Caminhar em pequenos blocos',
    'Alternar marcha e passos lentos', 'Percurso curto dentro de casa', 'Dançar com passos simples', 'Caminhar com postura confortável',
    'Passos no lugar e pausa breve', 'Caminhar em ritmo de conversa', 'Movimento leve ao som de música', 'Marcha sem impacto',
  ],
  academia:[
    'Caminhada leve na esteira', 'Bicicleta ergométrica confortável', 'Caminhada em blocos na esteira', 'Pedal leve em ritmo constante',
    'Caminhada com pausa breve', 'Elíptico leve, se já conhece', 'Pedal em ritmo de conversa', 'Caminhada leve para recuperar',
    'Esteira sem inclinação', 'Bicicleta com pouca resistência', 'Caminhada contínua tranquila', 'Pedal curto e confortável',
  ],
  'ar-livre':[
    'Caminhada em terreno plano', 'Volta curta no quarteirão', 'Caminhada pelo parque', 'Passos em ritmo de conversa',
    'Caminhada em dois blocos', 'Percurso curto conhecido', 'Caminhada com pausas planejadas', 'Caminhada por uma rota diferente',
    'Passos tranquilos ao ar livre', 'Caminhada até um ponto próximo', 'Caminhada contínua confortável', 'Volta leve de recuperação',
  ],
} satisfies Record<Profile['location'], string[]>

export function cardioStep(day:number,location:Profile['location'],minutes:number):WellnessStep {
  const activity = cardioByLocation[location][(day-1)%12]!
  return {
    title:`Cardio: ${activity.toLocaleLowerCase('pt-BR')}`,
    how:`Faça esta atividade por ${minutes} minuto${minutes===1?'':'s'}: ${activity.toLocaleLowerCase('pt-BR')}. Mantenha um ritmo em que ainda consiga conversar; reduza ou pare se sentir desconforto.`,
    purpose:'A atividade aeróbica regular melhora a saúde cardiovascular e pode ser construída aos poucos.',
    alternative:'Faça a mesma duração caminhando devagar, marchando sentado ou descanse se estiver indisposto.',
  }
}

export const evidenceLinks = [
  {label:'Atividade física para adultos · CDC',url:'https://www.cdc.gov/physical-activity-basics/guidelines/adults.html'},
  {label:'Sono e saúde · CDC',url:'https://www.cdc.gov/heart-disease/about/sleep-and-heart-health.html'},
  {label:'Alimentação saudável · OMS',url:'https://www.who.int/news-room/fact-sheets/detail/healthy-diet'},
  {label:'Fontes alimentares de zinco · NIH',url:'https://ods.od.nih.gov/factsheets/Zinc-HealthProfessional/'},
  {label:'Testosterona baixa: diagnóstico · Endocrine Society',url:'https://www.endocrine.org/clinical-practice-guidelines/testosterone-therapy/'},
] as const
