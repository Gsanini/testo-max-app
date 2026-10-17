import type { Activity, Category, Chapter, Profile, Protocol } from '@/domain/types'
import { weekday } from '@/domain/dates'

export const chapters: Chapter[] = [
  {id:1,name:'Despertar',start:1,end:30,intro:'Toda mudança começa com um passo que cabe na vida real.',objective:'Encontrar pequenos hábitos que você consegue repetir.',preview:'Você vai aprender a organizar refeições para os dias mais corridos.',symbol:'sun',color:'#ff8b80',milestones:['7 dias: reconhecer seu ritmo','15 dias: experimentar alternativas','30 dias: escolher o que manter']},
  {id:2,name:'Construir a base',start:31,end:60,intro:'Menos decisões de última hora. Mais espaço para cuidar de você.',objective:'Organizar alimentação, movimento e descanso na sua semana.',preview:'Você vai testar sua rotina em dias diferentes, sem precisar fazer tudo igual.',symbol:'layers',color:'#e6bb79',milestones:['37 dias: preparar uma semana possível','45 dias: montar seu plano B','60 dias: revisar sua base']},
  {id:3,name:'Ganhar consistência',start:61,end:90,intro:'Consistência também é saber adaptar o caminho.',objective:'Ampliar a variedade e retomar com facilidade após imprevistos.',preview:'No último capítulo, você vai criar seu próprio plano de continuidade.',symbol:'compass',color:'#a9b7f5',milestones:['67 dias: praticar flexibilidade','75 dias: reconhecer padrões','90 dias: repetir o que funciona']},
  {id:4,name:'Consolidar',start:91,end:120,intro:'O próximo passo já começa a ter a sua assinatura.',objective:'Construir autonomia para continuar depois dos 120 dias.',preview:'Seu histórico continua acessível. Leve os hábitos escolhidos para a próxima etapa.',symbol:'flag',color:'#96ceb8',milestones:['97 dias: escolher seus essenciais','105 dias: organizar a continuidade','120 dias: reconhecer sua construção']},
]

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
Fruta ao alcance|Separe uma fruta disponível para um lanche prático.|alimentacao
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
Lanche para levar|Escolha um lanche que combine com o seu deslocamento.|alimentacao
Pausa entre blocos|Separe trabalho ou estudo em blocos com pequenas pausas.|bem-estar
Variedade no prato|Experimente um vegetal diferente entre as opções compatíveis.|alimentacao
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
Novas cores|Inclua um vegetal de que gosta em uma combinação conhecida.|alimentacao
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
Lista de favoritos|Reúna três cafés, três refeições e dois lanches que funcionaram.|alimentacao
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
]
export const protocols: Protocol[] = chaptersContent.flatMap((chapter, index) => chapter.split('\n').map((row, offset) => {
  const [title, focus, theme] = row.split('|') as [string,string,Category]
  return {day:index*30+offset+1, chapter:index+1,title,focus,theme,lesson:chapters[index]!.objective}
}))

type MissionText = {title:string; how:string; purpose:string; alternative:string}
const routine: MissionText[] = [
  {title:'Escolher seu próximo passo',how:'Olhe a agenda e escolha em qual intervalo fará uma missão de hoje.',purpose:'Uma decisão concreta ajuda a começar.',alternative:'Se a agenda estiver incerta, escolha apenas a menor missão.'},
  {title:'Preparar um lembrete',how:'Deixe uma nota ou objeto visível no lugar em que fará sua próxima ação.',purpose:'O ambiente pode ajudar a lembrar da sua intenção.',alternative:'Associe a missão a uma atividade que já faz, como o café da manhã.'},
  {title:'Abrir espaço para uma pausa',how:'Feche uma tarefa, afaste as distrações e fique alguns minutos sem começar outra.',purpose:'Criar um intervalo torna a rotina menos automática.',alternative:'Faça uma pausa de um minuto sentado em um local confortável.'},
  {title:'Reconhecer uma escolha',how:'Anote uma ação que funcionou e o que tornou seu começo mais fácil.',purpose:'Observar o que funciona ajuda a decidir o que repetir.',alternative:'Diga para si uma ação concreta que conseguiu fazer.'},
  {title:'Organizar uma prioridade',how:'Escolha uma prioridade para hoje e tire da lista uma exigência que pode esperar.',purpose:'Um plano possível deixa espaço para imprevistos.',alternative:'Escolha apenas a próxima ação, sem planejar o dia inteiro.'},
  {title:'Planejar sua alternativa',how:'Veja a próxima missão e escolha sua versão alternativa caso o plano mude.',purpose:'Ter outra opção facilita a continuidade.',alternative:'Use a alternativa descrita na própria missão.'},
  {title:'Revisar a semana',how:'Abra Progresso, observe seus registros e escolha um hábito para a próxima semana.',purpose:'A revisão transforma participação em aprendizado.',alternative:'Lembre de uma ação desta semana que gostaria de repetir.'},
]
const foodMissions: MissionText[] = [
  {title:'Escolher a próxima refeição',how:'Abra Alimentação, confira os ingredientes da próxima refeição e troque se necessário.',purpose:'Antecipar uma escolha reduz decisões de última hora.',alternative:'Escolha uma opção rápida que use ingredientes que você já tem.'},
  {title:'Conferir a despensa',how:'Veja dois ingredientes que já tem e marque os itens disponíveis na lista de compras.',purpose:'Usar o que está disponível simplifica o planejamento.',alternative:'Confira apenas um ingrediente da próxima receita.'},
  {title:'Separar um lanche possível',how:'Escolha um lanche compatível no cardápio e deixe os ingredientes separados.',purpose:'Uma opção planejada ajuda quando o dia fica corrido.',alternative:'Escolha uma fruta que você possa consumir e tenha disponível.'},
  {title:'Conhecer uma receita',how:'Leia ingredientes e preparo de uma receita compatível antes de decidir prepará-la.',purpose:'Conhecer as etapas ajuda a estimar o trabalho da cozinha.',alternative:'Reutilize uma receita que você já conhece.'},
  {title:'Ajustar suas compras',how:'Abra a lista da semana, confira quantidades e mantenha somente o que precisa comprar.',purpose:'A lista aproxima o cardápio da sua rotina e orçamento.',alternative:'Anote somente o ingrediente que falta para a próxima refeição.'},
  {title:'Experimentar uma combinação',how:'Compare duas opções compatíveis e escolha uma combinação que desperte sua curiosidade.',purpose:'Variar combinações amplia seu repertório de refeições.',alternative:'Mantenha uma refeição conhecida e mude só a apresentação.'},
  {title:'Preparar a semana possível',how:'Veja as refeições dos próximos dias e use Trocar refeição para ajustar aos compromissos.',purpose:'O planejamento pode se adaptar aos dias mais ocupados.',alternative:'Organize apenas as refeições de amanhã.'},
]
const sleepMissions: MissionText[] = [
  {title:'Encerrar as tarefas',how:'Anote uma pendência de amanhã e encerre as tarefas que podem esperar.',purpose:'Um encerramento claro cria espaço para desacelerar.',alternative:'Deixe apenas uma nota com a primeira tarefa de amanhã.'},
  {title:'Preparar seu ambiente',how:'Organize o local de descanso e ajuste luz e ruídos conforme o que for possível.',purpose:'Um ambiente confortável facilita sua rotina de descanso.',alternative:'Faça apenas um ajuste, como retirar objetos da cama.'},
  {title:'Uma pausa sem tela',how:'Escolha uma leitura em papel, uma música tranquila ou alguns minutos de silêncio.',purpose:'Experimentar um ritual ajuda a encontrar sua forma de desacelerar.',alternative:'Afaste o aparelho por um minuto e sente-se confortavelmente.'},
  {title:'Deixar amanhã preparado',how:'Separe um item que usará amanhã e deixe a próxima decisão anotada.',purpose:'Resolver uma pequena pendência pode simplificar o fim do dia.',alternative:'Anote uma única prioridade para amanhã.'},
]
export function shiftTime(time: string, minutes: number) {
  const [h,m] = time.split(':').map(Number)
  const total = ((h!*60 + m! + minutes)%1440+1440)%1440
  return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`
}
export function personalizedMissions(protocol: Protocol, profile: Profile, date: string): Activity[] {
  const n = protocol.day-1
  const movingDay = profile.trainingDays.includes(weekday(date))
  const motionTime = movingDay ? Math.min(profile.experience === 'iniciante' ? 15 : 35, Math.floor(profile.minutes*0.5)) : 2
  const foodTime = Math.max(2, Math.floor(profile.minutes*0.2))
  const routineTime = Math.max(2,Math.floor(profile.minutes*0.15))
  const sleepTime = Math.max(1,Math.min(10,profile.minutes-motionTime-foodTime-routineTime))
  const place = profile.location === 'academia' ? 'na academia' : profile.location === 'ar-livre' ? 'em um local ao ar livre seguro' : 'em casa, num espaço livre de obstáculos'
  const movement: MissionText = movingDay ? {
    title:['Seu momento de movimento','Movimentar no seu ritmo','Uma pausa em movimento'][n%3]!,
    how:profile.experience === 'iniciante' ? `Reserve ${motionTime} minutos ${place} para caminhar ou mudar de posição com conforto. Comece devagar e faça pausas quando precisar.` : `Reserve ${motionTime} minutos ${place} para uma atividade que já conhece e considera confortável. Se possui um plano orientado, siga as adaptações desse plano.`,
    purpose:'Criar um horário de participação. A intensidade não aumenta ao avançar de capítulo.',
    alternative:'Faça uma pausa curta para mudar de posição ou movimentar-se confortavelmente sentado. Pare se houver dor ou mal-estar.',
  } : {title:'Pausa de recuperação',how:'Neste dia sem atividade planejada, encontre uma posição confortável e faça uma pequena pausa entre tarefas.',purpose:'O descanso também tem espaço na rotina.',alternative:'Faça a pausa sentado, sem precisar realizar exercícios.'}
  const rows: {key:string; text:MissionText; category:Category; icon:string; minutes:number; time:string}[] = [
    {key:'routine',text:routine[n%routine.length]!,category:'bem-estar',icon:'clipboard',minutes:routineTime,time:profile.wakeTime},
    {key:'movement',text:movement,category:'movimento',icon:movingDay?'stretch':'heart',minutes:motionTime,time:profile.activityPeriod==='manha'?shiftTime(profile.wakeTime,60):profile.activityPeriod==='tarde'?'15:00':shiftTime(profile.sleepTime,-120)},
    {key:'food',text:foodMissions[(n+Math.floor(n/30))%foodMissions.length]!,category:'alimentacao',icon:'utensils',minutes:foodTime,time:profile.activityPeriod==='manha'?shiftTime(profile.wakeTime,30):'12:00'},
    {key:'sleep',text:sleepMissions[(n+Math.floor(n/7))%sleepMissions.length]!,category:'sono',icon:'moon',minutes:sleepTime,time:profile.sleepTime},
  ]
  return rows.map(row => ({id:`journey:${protocol.day}:${row.key}`,templateId:`journey:${row.key}`,journeyDay:protocol.day,date,title:row.text.title,subtitle:row.text.purpose,category:row.category,icon:row.icon,time:row.time,minutes:row.minutes,done:false,editable:true,demo:false,exercises:[],
    instructions:[row.text.how,...(row.category===protocol.theme?[`Foco do dia: ${protocol.focus}`]:[]),...(row.category==='sono'&&profile.sleepQuality==='irregular'?['Use este horário como um lembrete flexível. Ajuste-o se os seus compromissos mudarem.']:[])],
    purpose:row.text.purpose,alternative:row.text.alternative,
  }))
}
