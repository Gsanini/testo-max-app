import type {
  Activity,
  Category,
  Chapter,
  Meal,
  Profile,
  Protocol,
} from "@/domain/types";
import { weekday } from "@/domain/dates";
import { recipeById } from "./recipes";
import {
  cardioStep,
  dailyHabit,
  dailyHabitMinutes,
  exercises,
  recoveryStep,
  sleepHabit,
  strengthPlans,
  type ExerciseId,
  type WellnessStep,
} from "./wellness";

export const chapters: Chapter[] = [
  {
    id: 1,
    name: "Despertar",
    start: 1,
    end: 30,
    intro: "Toda mudança começa com um passo que cabe na vida real.",
    objective: "Encontrar pequenos hábitos que você consegue repetir.",
    preview:
      "Você vai aprender a organizar refeições para os dias mais corridos.",
    symbol: "sun",
    color: "#ff8b80",
    milestones: [
      "7 dias: reconhecer seu ritmo",
      "15 dias: experimentar alternativas",
      "30 dias: escolher o que manter",
    ],
  },
  {
    id: 2,
    name: "Construir a base",
    start: 31,
    end: 60,
    intro: "Menos decisões de última hora. Mais espaço para cuidar de você.",
    objective: "Organizar alimentação, movimento e descanso na sua semana.",
    preview:
      "Você vai testar sua rotina em dias diferentes, sem precisar fazer tudo igual.",
    symbol: "layers",
    color: "#e6bb79",
    milestones: [
      "37 dias: preparar uma semana possível",
      "45 dias: montar seu plano B",
      "60 dias: revisar sua base",
    ],
  },
  {
    id: 3,
    name: "Ganhar consistência",
    start: 61,
    end: 90,
    intro: "Consistência também é saber adaptar o caminho.",
    objective: "Ampliar a variedade e retomar com facilidade após imprevistos.",
    preview:
      "No último capítulo, você vai criar seu próprio plano de continuidade.",
    symbol: "compass",
    color: "#a9b7f5",
    milestones: [
      "67 dias: praticar flexibilidade",
      "75 dias: reconhecer padrões",
      "90 dias: repetir o que funciona",
    ],
  },
  {
    id: 4,
    name: "Consolidar",
    start: 91,
    end: 120,
    intro: "O próximo passo já começa a ter a sua assinatura.",
    objective: "Construir autonomia para continuar depois dos 120 dias.",
    preview:
      "Seu histórico continua acessível. Leve os hábitos escolhidos para a próxima etapa.",
    symbol: "flag",
    color: "#96ceb8",
    milestones: [
      "97 dias: escolher seus essenciais",
      "105 dias: organizar a continuidade",
      "120 dias: reconhecer sua construção",
    ],
  },
];

// Each row is an editorial day: title | concrete focus | theme. Shared missions below
// deliberately repeat sustainable habits, while the daily learning context changes.
const chaptersContent = [
  `Seu ponto de partida|Observe como seu dia acontece e escolha um horário possível.|bem-estar
Uma pausa que cabe|Encontre uma pequena pausa entre dois compromissos.|movimento
Sua próxima refeição|Confira o que já existe na cozinha antes de planejar.|alimentacao
Preparar o descanso|Escolha um sinal simples para encerrar as tarefas.|sono
Deixar à vista|Deixe um lembrete visível para o hábito que quer praticar.|bem-estar
Movimento possível|Experimente um trajeto curto e confortável no seu espaço.|movimento
Primeira semana vivida|Anote uma ação que foi fácil repetir e uma adaptação útil.|bem-estar
Café sem improviso|Escolha uma opção de café da manhã com os ingredientes disponíveis.|alimentacao
O seu horário|Compare o horário sugerido com seus compromissos reais.|bem-estar
Desligar aos poucos|Separe as tarefas que podem esperar até amanhã.|sono
Um prato conhecido|Monte uma refeição com alimentos que você já sabe preparar.|alimentacao
Mudar de posição|Identifique um intervalo para sair da posição mantida por muito tempo.|movimento
Pausa com atenção|Faça uma atividade de cada vez durante uma pequena pausa.|bem-estar
O que funcionou|Escolha dois hábitos da semana que gostaria de repetir.|bem-estar
Seu plano alternativo|Teste a versão curta de uma missão em um dia ocupado.|bem-estar
Café ao alcance|Separe os ingredientes do café da manhã planejado.|alimentacao
Espaço para se mover|Organize um lugar seguro e livre de obstáculos.|movimento
Ambiente de descanso|Observe luz, ruídos e objetos que atrapalham seu descanso.|sono
Compra com intenção|Confira dois ingredientes antes de adicioná-los à lista.|alimentacao
Ritmo confortável|Escolha uma forma de movimento que permita conversar com conforto.|movimento
Três semanas de escolhas|Identifique um hábito que já exige menos esforço para começar.|bem-estar
Repetir sem complicar|Repita uma refeição que funcionou bem para você.|alimentacao
Pequeno intervalo|Associe uma pausa a uma tarefa que já faz todos os dias.|movimento
Amanhã começa hoje|Deixe uma pequena decisão de amanhã resolvida.|sono
Uma troca viável|Troque uma refeição por uma opção compatível com sua rotina.|alimentacao
Retomar é participar|Escolha apenas o próximo passo, sem tentar compensar dias anteriores.|bem-estar
Sinais da sua rotina|Observe em qual período você encontra mais facilidade para se mover.|movimento
Rever sem julgar|Leia os registros da semana e escolha uma mudança pequena.|bem-estar
Seus três essenciais|Escolha uma ação de alimentação, uma de movimento e uma de descanso.|bem-estar
Despertar concluído|Registre o que aprendeu sobre o próprio ritmo neste capítulo.|bem-estar`,
  `Uma base para sua semana|Olhe os compromissos dos próximos dias antes de planejar refeições.|alimentacao
Inventário da cozinha|Liste o que precisa ser usado primeiro na despensa e geladeira.|alimentacao
Horário com margem|Deixe alguns minutos livres ao redor de uma atividade planejada.|bem-estar
Descanso no calendário|Reserve um horário de desaceleração que funcione nesta semana.|sono
Lista enxuta|Monte sua lista a partir das refeições escolhidas, evitando duplicações.|alimentacao
Movimento com contexto|Associe a atividade a um compromisso que já existe.|movimento
Semana organizada|Compare o planejamento com o que realmente coube no seu dia.|bem-estar
Uma base, dois pratos|Escolha um ingrediente cozido que sirva para duas refeições.|alimentacao
O caminho mais fácil|Deixe roupa ou espaço de movimento preparados.|movimento
Rotina de encerramento|Escolha duas ações tranquilas para repetir antes de dormir.|sono
Refeição para levar|Confira a refeição do dia e planeje como levá-la com segurança.|alimentacao
Pausa entre blocos|Separe trabalho ou estudo em blocos com pequenas pausas.|bem-estar
Variedade no prato|Experimente outro corte de carne, peixe ou preparo de ovos do cardápio.|alimentacao
Revisão da base|Escolha um obstáculo da semana e uma solução simples.|bem-estar
Plano B à mão|Salve uma refeição rápida e uma alternativa de movimento.|bem-estar
Comprar com orçamento|Compare opções sazonais e os ingredientes que você já tem.|alimentacao
Seu lugar de movimento|Ajuste a missão ao espaço em que estará hoje.|movimento
Menos decisões à noite|Anote pendências antes do seu horário de desaceleração.|sono
Porções da cozinha|Observe o rendimento da receita antes de comprar ingredientes.|alimentacao
Intervalo de recuperação|Pratique uma pausa confortável sem buscar aumentar a intensidade.|movimento
O que merece ficar|Escolha uma mudança desta semana para manter.|bem-estar
Cozinhar com sequência|Leia todo o preparo e separe os ingredientes antes de começar.|alimentacao
Convite ao movimento|Escolha uma atividade de que você gosta e que cabe no seu tempo.|movimento
Ritual portátil|Planeje como desacelerar também fora de casa.|sono
Refeição para o dia corrido|Use uma combinação rápida com itens já cozidos disponíveis.|alimentacao
Agenda realista|Retire uma exigência desnecessária do seu planejamento.|bem-estar
Trocar sem abandonar|Teste uma alternativa se o plano original não for possível.|movimento
Revisar compras|Ajuste a lista ao que sobrou e ao que pretende preparar.|alimentacao
Base que acompanha você|Escreva uma regra simples para organizar cada período do dia.|bem-estar
Sua base construída|Identifique o que tornou a rotina mais fácil neste capítulo.|bem-estar`,
  `Consistência flexível|Escolha um hábito essencial e permita adaptar os demais.|bem-estar
Uma nova combinação|Combine ingredientes conhecidos de um jeito diferente.|alimentacao
Variação confortável|Mude o local ou o horário do movimento, mantendo o esforço confortável.|movimento
Sono em dias diferentes|Observe como seus compromissos afetam o horário de desaceleração.|sono
Repertório de refeições|Escolha três receitas que você sabe encaixar na semana.|alimentacao
Recomeço simples|Use a alternativa curta de uma missão para praticar a retomada.|bem-estar
Uma semana de ajustes|Anote qual adaptação evitou que você abandonasse o plano.|bem-estar
Nova combinação|Combine ovos com uma carne ou peixe que você já costuma preparar.|alimentacao
Companhia ou silêncio|Escolha se prefere se mover sozinho ou com companhia hoje.|movimento
Desacelerar sem tela|Experimente uma atividade tranquila sem tela antes de deitar.|sono
Refeição fora da rotina|Planeje uma opção compatível para um dia fora de casa.|alimentacao
Limites possíveis|Reconheça quanto tempo você realmente tem para as missões.|bem-estar
Recuperar espaço|Reserve uma pausa após um bloco mais exigente do dia.|movimento
Rever a semana|Observe os dias com participação e o que facilitou cada um.|bem-estar
Seus padrões|Compare horários planejados e realizados sem buscar perfeição.|bem-estar
Troca econômica|Substitua uma receita por outra que use ingredientes disponíveis.|alimentacao
Movimento preferido|Repita a opção de movimento de que mais gostou até aqui.|movimento
Um ambiente mais calmo|Escolha uma melhoria pequena no espaço de descanso.|sono
Aprender uma técnica|Pratique um corte ou uma etapa de preparo simples de uma receita.|alimentacao
Pausa intencional|Pare por alguns minutos antes de assumir uma nova tarefa.|bem-estar
Constância sem cobrança|Reconheça um retorno à rotina depois de um imprevisto.|bem-estar
Cardápio de reserva|Selecione duas opções rápidas para semanas mais cheias.|alimentacao
Outra forma de começar|Teste um lembrete diferente para iniciar seu movimento.|movimento
Horário revisado|Ajuste o início da desaceleração ao seu dia real.|sono
Compartilhar o preparo|Se fizer sentido, combine uma etapa da refeição com alguém.|alimentacao
Escolher o suficiente|Defina a menor versão útil de uma ação para hoje.|bem-estar
Escutar o conforto|Adapte o movimento se o ambiente ou sua disposição mudarem.|movimento
Variedade com simplicidade|Mantenha as bases da semana e mude apenas um ingrediente.|alimentacao
Seu repertório pessoal|Liste as alternativas que mais ajudaram em dias difíceis.|bem-estar
Consistência construída|Reconheça como suas escolhas ficaram mais flexíveis neste capítulo.|bem-estar`,
  `Sua própria direção|Escolha os hábitos que deseja levar além dos 120 dias.|bem-estar
Cardápio com autonomia|Monte um dia de refeições usando suas receitas favoritas.|alimentacao
Movimento escolhido|Escolha lugar e horário sem aumentar a exigência da atividade.|movimento
Descanso como compromisso|Reserve um espaço realista para encerrar o dia.|sono
Compras com repertório|Use sua lista e seu inventário para planejar a próxima compra.|alimentacao
Plano de retomada|Escreva o primeiro passo que fará após uma pausa na rotina.|bem-estar
Essenciais escolhidos|Reduza sua lista aos hábitos que mais fazem sentido para você.|bem-estar
Refeição assinatura|Repita uma receita que se tornou prática na sua rotina.|alimentacao
Seu ritmo sustentável|Confirme se o tempo de movimento ainda cabe no seu dia.|movimento
Encerramento pessoal|Escolha a sequência tranquila de fim de dia que prefere manter.|sono
Variação acessível|Troque um ingrediente respeitando suas restrições e orçamento.|alimentacao
Ambiente que ajuda|Mantenha à vista um objeto que facilita um hábito escolhido.|bem-estar
Recuperação planejada|Reserve uma pausa de recuperação entre seus compromissos.|movimento
Uma semana sua|Avalie se a meta semanal continua realista e ajuste se necessário.|bem-estar
Continuar com clareza|Defina quando e onde praticará seus três hábitos essenciais.|bem-estar
Lista de favoritos|Reúna três cafés, três almoços e três jantares que funcionaram.|alimentacao
Alternativa permanente|Escolha uma versão curta de movimento para dias cheios.|movimento
Descanso fora de casa|Prepare uma versão simples do ritual de desaceleração para viagens.|sono
Planejar sem depender|Monte uma combinação com o que já sabe preparar.|alimentacao
Revisão do compromisso|Retire uma meta que deixou de fazer sentido e preserve a essencial.|bem-estar
Reconhecer participação|Observe seus registros e reconheça escolhas concretas que fez.|bem-estar
Cozinha da próxima semana|Planeje ingredientes que poderão entrar em mais de uma refeição.|alimentacao
Movimento na agenda|Escolha os próximos dias em que pretende reservar tempo para se mover.|movimento
Um fim de dia possível|Teste seu ritual de descanso sem depender de um dia perfeito.|sono
Seu plano para imprevistos|Escolha uma refeição rápida, uma pausa e um lembrete para retomar.|bem-estar
Rotina em uma frase|Descreva o que deseja repetir nas próximas semanas.|bem-estar
Aprendizado que fica|Anote uma descoberta sobre alimentação, movimento e descanso.|bem-estar
Próxima semana desenhada|Confira agenda, refeições e horários antes de encerrar a jornada.|alimentacao
Sua carta de continuidade|Escreva quais hábitos vai manter e como pretende revisar o plano.|bem-estar
O caminho continua|Reconheça sua participação e escolha o próximo passo com autonomia.|bem-estar`,
];
export const protocols: Protocol[] = chaptersContent.flatMap((chapter, index) =>
  chapter.split("\n").map((row, offset) => {
    const [title, focus, theme] = row.split("|") as [string, string, Category];
    return {
      day: index * 30 + offset + 1,
      chapter: index + 1,
      title,
      focus,
      theme,
      lesson: chapters[index]!.objective,
    };
  }),
);

export function shiftTime(time: string, minutes: number) {
  const [h, m] = time.split(":").map(Number);
  const total = (((h! * 60 + m! + minutes) % 1440) + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}
export function strengthWeekdays(profile: Profile) {
  const selected: number[] = [];
  for (const day of [1, 2, 3, 4, 5, 6, 0]) {
    if (!profile.trainingDays.includes(day) || selected.length === 3) continue;
    if (
      selected.some(
        (previous) => (previous + 1) % 7 === day || (day + 1) % 7 === previous,
      )
    )
      continue;
    selected.push(day);
  }
  return selected;
}

const zincFoods = new Set([
  "carne bovina magra",
  "sardinha",
  "Ovos",
]);

function exerciseDetails(id: ExerciseId, profile: Profile, motionTime: number) {
  const move = exercises[id];
  const sets =
    motionTime < 12 || profile.experience === "iniciante"
      ? 1
      : profile.experience === "avancado"
        ? 3
        : 2;
  return {
    name: profile.location === "academia" ? move.gym : move.home,
    sets: String(sets),
    reps: "6 a 10",
    rest: "30 a 60 s",
    note: move.note,
  };
}

export function personalizedMissions(
  protocol: Protocol,
  profile: Profile,
  date: string,
  plannedMeals: Meal[] = [],
): Activity[] {
  const n = protocol.day - 1;
  const strengthDay = strengthWeekdays(profile).includes(weekday(date));
  const motionTime = strengthDay
    ? Math.min(
        profile.experience === "iniciante" ? 15 : 35,
        Math.max(4, Math.floor(profile.minutes * 0.42)),
      )
    : 2;
  const habitIndex = (n + Math.floor(n / 12)) % dailyHabitMinutes.length;
  const routineTime = Math.min(
    dailyHabitMinutes[habitIndex]!,
    Math.max(1, profile.minutes - motionTime - 7),
  );
  const remainingTime = Math.max(3, profile.minutes - motionTime - routineTime);
  const sleepTime = Math.min(10, Math.max(1, remainingTime - 2));
  const cardioTime = Math.max(2, remainingTime - sleepTime);
  const chosen =
    strengthPlans[(n + Math.floor(n / 12)) % strengthPlans.length]!;
  const moves = strengthDay
    ? chosen.moves
        .slice(0, motionTime < 8 ? 1 : motionTime < 14 ? 2 : 3)
        .map((id) => exerciseDetails(id, profile, motionTime))
    : [];
  const place =
    profile.location === "academia"
      ? "na academia"
      : profile.location === "ar-livre"
        ? "em local plano e seguro ao ar livre"
        : "em casa, perto de um apoio estável";
  const workout = strengthDay
    ? {
        title: chosen.title,
        how: `Reserve ${motionTime} minutos ${place}. Comece com movimentos leves e faça os exercícios abaixo com carga confortável, sem prender a respiração.`,
        purpose:
          "Sessões de força distribuídas na semana ajudam a manter músculos e capacidade funcional.",
        alternative:
          "Reduza a amplitude ou use a versão sem carga. Se estiver dolorido ou indisposto, escolha mobilidade leve ou descanso.",
      }
    : recoveryStep(protocol.day, motionTime);
  const mealStep = (slot: "breakfast" | "lunch" | "dinner", label: string) => {
    const planned = plannedMeals.find((meal) => meal.slot === slot);
    const portions = planned?.recipeId ? recipeById.get(planned.recipeId)?.sourcePortions : undefined;
    const zincIngredient = planned?.ingredients.find((ingredient) =>
      zincFoods.has(ingredient.name),
    );
    return {
      planned,
      text: {
        title: planned
          ? `${label}: ${planned.description}`
          : `${label}: escolha uma opção`,
        how: planned
          ? `${portions ?? planned.ingredients.map(ingredient=>`${ingredient.name} ${ingredient.quantity} ${ingredient.unit}`).join('; ')} Confira em Alimentação o preparo e as porções.`
          : `Abra Alimentação e escolha uma opção para ${label.toLocaleLowerCase("pt-BR")} compatível com suas preferências.`,
        purpose: zincIngredient
          ? `${zincIngredient.name} pode contribuir com zinco para uma alimentação adequada`
          : "Combine opções de origem animal para obter diferentes nutrientes, sem depender de um alimento isolado.",
        alternative:
          "Use outra receita compatível do cardápio ou alimentos que já costuma consumir. Se não houver opção compatível, revise suas preferências.",
      },
    };
  };
  const breakfast = mealStep("breakfast", "Café da manhã");
  const lunch = mealStep("lunch", "Almoço");
  const dinner = mealStep("dinner", "Jantar");
  const moveTime =
    profile.activityPeriod === "manha"
      ? shiftTime(profile.wakeTime, 60)
      : profile.activityPeriod === "tarde"
        ? "15:00"
        : shiftTime(profile.sleepTime, -240);
  const habitOffsets = [0, 180, -30, 240, 300, 0, -60, -180, -60, 330, 60, -45];
  const routineClock =
    habitOffsets[habitIndex]! < 0
      ? shiftTime(profile.sleepTime, habitOffsets[habitIndex]!)
      : shiftTime(profile.wakeTime, habitOffsets[habitIndex]!);
  const routine = dailyHabit(habitIndex + 1, routineTime, routineClock);
  const sleep = sleepHabit(
    ((n + Math.floor(n / 8)) % 8) + 1,
    sleepTime,
    profile,
  );
  const rows: {
    key: string;
    role: NonNullable<Activity["role"]>;
    text: WellnessStep;
    category: Category;
    icon: string;
    minutes: number;
    time: string;
    exercises?: Activity["exercises"];
    mealId?: string;
    done?: boolean;
  }[] = [
    {
      key: "food:breakfast",
      role: "alimentacao",
      text: breakfast.text,
      category: "alimentacao",
      icon: "utensils",
      minutes: 0,
      time: breakfast.planned?.time ?? shiftTime(profile.wakeTime, 30),
      mealId: breakfast.planned?.id,
      done: breakfast.planned?.done,
    },
    {
      key: "routine",
      role: "habito",
      text: routine,
      category: "bem-estar",
      icon: "sun",
      minutes: routineTime,
      time: routineClock,
    },
    {
      key: "movement",
      role: "treino",
      text: workout,
      category: "movimento",
      icon: strengthDay ? "dumbbell" : "stretch",
      minutes: motionTime,
      time: moveTime,
      exercises: moves,
    },
    {
      key: "food",
      role: "alimentacao",
      text: lunch.text,
      category: "alimentacao",
      icon: "utensils",
      minutes: 0,
      time: lunch.planned?.time ?? shiftTime(profile.wakeTime, 330),
      mealId: lunch.planned?.id,
      done: lunch.planned?.done,
    },
    {
      key: "cardio",
      role: "cardio",
      text: cardioStep(protocol.day, profile.location, cardioTime),
      category: "movimento",
      icon: "heart",
      minutes: cardioTime,
      time: shiftTime(moveTime, strengthDay ? motionTime + 15 : 30),
    },
    {
      key: "food:dinner",
      role: "alimentacao",
      text: dinner.text,
      category: "alimentacao",
      icon: "utensils",
      minutes: 0,
      time: dinner.planned?.time ?? shiftTime(profile.sleepTime, -150),
      mealId: dinner.planned?.id,
      done: dinner.planned?.done,
    },
    {
      key: "sleep",
      role: "sono",
      text: sleep,
      category: "sono",
      icon: "moon",
      minutes: sleepTime,
      time: sleep.time,
    },
  ];
  return rows.map((row) => ({
    id: `journey:${protocol.day}:${row.key}`,
    templateId: `journey:${row.key}`,
    journeyDay: protocol.day,
    date,
    title: row.text.title,
    subtitle: row.text.purpose,
    category: row.category,
    role: row.role,
    mealId: row.mealId,
    icon: row.icon,
    time: row.time,
    minutes: row.minutes,
    done: row.done ?? false,
    editable: false,
    demo: false,
    exercises: row.exercises ?? [],
    instructions: [
      row.text.how,
      ...(row.role === "sono" && profile.sleepQuality === "irregular"
        ? [
            `Mesmo nos dias irregulares, use ${shiftTime(profile.wakeTime, -420)} como limite para garantir 7 h antes de acordar às ${profile.wakeTime}.`,
          ]
        : []),
    ],
    purpose: row.text.purpose,
    alternative: row.text.alternative,
  }));
}
