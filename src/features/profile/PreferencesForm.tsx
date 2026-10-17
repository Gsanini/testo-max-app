import { useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ArrowRight, Check, Compass, ShieldCheck } from 'lucide-react'
import { useWorkspace } from '@/app/providers'
import { profileSchema, type Profile, type Allergen } from '@/domain/types'
import { Button } from '@/components/ui/button'
import { Brand } from '@/components/common'
import { cn } from '@/lib/utils'
import { allergenNames, foods } from '@/content/recipes'
import { chapters } from '@/content/journey'
import { personalizationReasons } from '@/domain/journey'

const formSchema=profileSchema.extend({
  allergies:profileSchema.shape.allergies.removeDefault(), excludedIngredients:profileSchema.shape.excludedIngredients.removeDefault(),
  budget:profileSchema.shape.budget.removeDefault(), cookMinutes:profileSchema.shape.cookMinutes.removeDefault(),
  location:profileSchema.shape.location.removeDefault(),activityPeriod:profileSchema.shape.activityPeriod.removeDefault(),
  sleepQuality:profileSchema.shape.sleepQuality.removeDefault(),weeklyGoal:profileSchema.shape.weeklyGoal.removeDefault(),
})
type ChoiceField='goal'|'activityPeriod'|'experience'|'location'|'sleepQuality'|'budget'

export function PreferencesForm({onboarding=false,onSaved}:{onboarding?:boolean;onSaved?:()=>void}) {
  const {data,act,busy,feedback,retry}=useWorkspace()
  const [step,setStep]=useState(0)
  const {register,handleSubmit,watch,setValue,trigger,reset,formState:{errors,isDirty}}=useForm<Profile>({resolver:zodResolver(formSchema),defaultValues:data.profile})
  const values=watch()
  function options(field:ChoiceField,items:{value:Profile[ChoiceField];label:string;text?:string}[]) {
    return <div className="journey-choices">{items.map(item=><label key={String(item.value)} className={cn('journey-choice',values[field]===item.value&&'selected')}><input type="radio" name={field} checked={values[field]===item.value} onChange={()=>setValue(field,item.value,{shouldDirty:true,shouldValidate:true})}/><span><strong>{item.label}</strong>{item.text&&<small>{item.text}</small>}</span><span className="choice-indicator">{values[field]===item.value&&<Check size={14}/>}</span></label>)}</div>
  }
  const steps:{field:keyof Profile;title:string;hint:string;content:ReactNode}[]=[
    {field:'goal',title:'O que você quer construir?',hint:'Seu objetivo orienta a próxima ação recomendada.',content:options('goal',[
      {value:'energia',label:'Melhorar minha disposição',text:'Criar espaço para movimento, pausas e descanso'},
      {value:'alimentacao',label:'Organizar minha alimentação',text:'Planejar refeições que caibam na rotina'},
      {value:'consistencia',label:'Criar consistência',text:'Começar pequeno e continuar com flexibilidade'},
      ...(values.goal==='forca'?[{value:'forca' as const,label:'Priorizar movimento',text:'Seu objetivo anterior está preservado'}]:[]),
    ])},
    {field:'trainingDays',title:'Em quais dias cabe movimento?',hint:'Nos outros dias, vamos sugerir uma pausa de recuperação.',content:<div className="day-picker">{[{v:1,l:'Seg'},{v:2,l:'Ter'},{v:3,l:'Qua'},{v:4,l:'Qui'},{v:5,l:'Sex'},{v:6,l:'Sáb'},{v:0,l:'Dom'}].map(d=><button type="button" key={d.v} aria-pressed={values.trainingDays.includes(d.v)} className={cn(values.trainingDays.includes(d.v)&&'selected')} onClick={()=>setValue('trainingDays',values.trainingDays.includes(d.v)?values.trainingDays.filter(v=>v!==d.v):[...values.trainingDays,d.v],{shouldValidate:true,shouldDirty:true})}>{d.l}</button>)}</div>},
    {field:'activityPeriod',title:'Qual período funciona melhor?',hint:'O horário de movimento será sugerido nesse período.',content:options('activityPeriod',[{value:'manha',label:'Manhã'},{value:'tarde',label:'Tarde'},{value:'noite',label:'Noite'}])},
    {field:'minutes',title:'Quanto tempo cabe no seu dia?',hint:'Esse é o tempo total das missões. O preparo de refeições tem seu próprio tempo.',content:<label>Tempo diário para as missões<select {...register('minutes',{valueAsNumber:true})}>{[10,15,20,30,45,60,90].map(n=><option value={n} key={n}>{n} minutos</option>)}</select></label>},
    {field:'experience',title:'Como está seu movimento hoje?',hint:'A duração se adapta à sua experiência; avançar de nível não aumenta a intensidade.',content:options('experience',[{value:'iniciante',label:'Estou começando ou retomando'},{value:'intermediario',label:'Já me movimento regularmente'},{value:'avancado',label:'Tenho uma rotina estabelecida'}])},
    {field:'location',title:'Onde você prefere se movimentar?',hint:'As instruções e alternativas vão considerar esse espaço.',content:options('location',[{value:'casa',label:'Em casa'},{value:'academia',label:'Na academia'},{value:'ar-livre',label:'Ao ar livre'}])},
    {field:'wakeTime',title:'Quando seu dia costuma começar?',hint:'Usaremos esse horário para organizar as primeiras missões e refeições.',content:<label>Início da rotina<input type="time" {...register('wakeTime')}/></label>},
    {field:'sleepTime',title:'A que horas quer desacelerar?',hint:'Um lembrete para encerrar tarefas e preparar seu descanso.',content:<label>Hora de desacelerar<input type="time" {...register('sleepTime')}/></label>},
    {field:'sleepQuality',title:'Como são seus horários de descanso?',hint:'Sua resposta ajusta o ritual de encerramento do dia.',content:options('sleepQuality',[{value:'regular',label:'Costumam ser regulares'},{value:'irregular',label:'Mudam bastante',text:'Preciso de um ritual que acompanhe dias diferentes'}])},
    {field:'diet',title:'Como você prefere se alimentar?',hint:'As receitas serão selecionadas a partir dessa escolha.',content:<label>Estilo de alimentação<select {...register('diet')}><option value="variada">Variada</option><option value="vegetariana">Vegetariana</option><option value="vegana">Vegana</option><option value="mediterranea">Mediterrânea · vegetais e peixes</option></select></label>},
    {field:'allergies',title:'Quais restrições devemos considerar?',hint:'Marque os grupos que precisa evitar. As receitas com esses ingredientes serão removidas das sugestões.',content:<><div className="restriction-grid">{Object.entries(allergenNames).map(([key,label])=><label key={key} className="restriction"><input type="checkbox" checked={values.allergies.includes(key as Allergen)} onChange={()=>setValue('allergies',values.allergies.includes(key as Allergen)?values.allergies.filter(a=>a!==key):[...values.allergies,key as Allergen],{shouldDirty:true})}/>{label}</label>)}</div><p className="muted copy">Sem seleção: nenhum desses grupos a evitar. Confira os rótulos e possíveis traços; o filtro não verifica contaminação cruzada.</p></>},
    {field:'excludedIngredients',title:'Há outros ingredientes que você evita?',hint:'Selecione alergias adicionais, restrições ou preferências entre os ingredientes do catálogo.',content:<><label>Adicionar ingrediente a evitar<select value="" onChange={e=>{if(e.target.value)setValue('excludedIngredients',[...values.excludedIngredients,e.target.value],{shouldDirty:true})}}><option value="">Escolher ingrediente</option>{Object.values(foods).filter(f=>!values.excludedIngredients.includes(f.name)).sort((a,b)=>a.name.localeCompare(b.name,'pt')).map(f=><option key={f.name}>{f.name}</option>)}</select></label><div className="ingredient-chips">{values.excludedIngredients.map(name=><button type="button" key={name} onClick={()=>setValue('excludedIngredients',values.excludedIngredients.filter(n=>n!==name),{shouldDirty:true})} aria-label={`Permitir ${name}`}>{name}<span aria-hidden>×</span></button>)}</div><p className="muted copy">Nenhum ingrediente selecionado significa nenhuma exclusão adicional. Para produtos compostos, confira a composição no rótulo.</p></>},
    {field:'budget',title:'Como vamos organizar o orçamento?',hint:'A escolha muda as receitas disponíveis no seu cardápio.',content:options('budget',[{value:'economico',label:'Priorizar opções econômicas',text:'Ingredientes comuns e preparos simples'},{value:'flexivel',label:'Tenho mais flexibilidade',text:'Inclui também opções com ingredientes mais variados'}])},
    {field:'cookMinutes',title:'Quanto tempo você tem para cozinhar?',hint:'Receitas com bases já cozidas indicam isso nos ingredientes. O tempo considera essas bases prontas.',content:<label>Tempo por preparo<select {...register('cookMinutes',{valueAsNumber:true})}>{[10,15,20,30,40,60].map(n=><option value={n} key={n}>Até {n} minutos</option>)}</select></label>},
  ]
  const summary=step===steps.length
  const save=handleSubmit(async profile=>{if(await act({type:'profile',profile:{...profile,onboarded:true}})){reset({...profile,onboarded:true});onSaved?.()}})
  const next=async()=>{if(await trigger(steps[step]!.field)){setStep(s=>s+1)}}
  return <form className="form-stack preferences-form" data-unsaved={isDirty} onSubmit={save}>
    {onboarding&&<><div className="onboarding-step-label"><span>SEU PONTO DE PARTIDA</span><span>{step+1} / {steps.length+1}</span></div><progress className="native-progress" max={steps.length+1} value={step+1} aria-label="Progresso da personalização"/></>}
    {onboarding&&summary?<div className="onboarding-summary"><span className="summary-emblem"><Compass size={30}/></span><h1>Este é o seu ponto de partida.</h1><ul className="reason-list">{personalizationReasons({profile:values}).map(reason=><li key={reason}><Check size={17}/>{reason}</li>)}</ul><h2>Assim será sua jornada</h2><div className="chapter-summary">{chapters.map(c=><div key={c.id}><span>{String(c.id).padStart(2,'0')}</span><div><strong>{c.name}</strong><small>Dias {c.start}–{c.end} · {c.objective}</small></div></div>)}</div><p className="muted copy">O dia 1 abre agora. Os próximos dias abrem à meia-noite no seu fuso, mesmo se alguma missão ficar para depois.</p></div>:steps.filter((_,i)=>!onboarding||i===step).map(s=><section key={s.field} className="preference-question"><h2>{s.title}</h2><p className="question-hint">{s.hint}</p>{s.content}{errors[s.field]&&<p className="field-error" role="alert">{errors[s.field]?.message}</p>}</section>)}
    {(!onboarding||summary)&&<><label>Fuso horário<select {...register('timezone')}>{[...new Set([values.timezone,'America/Sao_Paulo','America/Manaus','America/Rio_Branco','America/Noronha','Europe/Lisbon','UTC'])].map(tz=><option key={tz}>{tz}</option>)}</select></label>{!onboarding&&<label>Meta semanal de participação<select {...register('weeklyGoal',{valueAsNumber:true})}>{[1,2,3,4,5,6,7].map(n=><option key={n} value={n}>{n} dias com pelo menos uma missão</option>)}</select></label>}<p className="onboarding-privacy"><ShieldCheck size={16}/>Suas preferências ficam neste navegador. Você pode editá-las a qualquer momento.</p></>}
    {feedback?.error&&<div role="alert" className="inline-notice">{feedback.text}<Button type="button" variant="secondary" onClick={retry}>Tentar novamente</Button></div>}
    <div className="form-footer">{onboarding&&step>0&&<Button type="button" variant="ghost" onClick={()=>setStep(s=>s-1)}><ArrowLeft size={17}/>Voltar</Button>}{onboarding&&!summary?<Button key="next" type="button" onClick={()=>void next()}>Continuar<ArrowRight size={17}/></Button>:<Button key="save" type="submit" disabled={busy}><Check size={17}/>{busy?'Salvando…':onboarding?'Começar minha jornada':'Salvar preferências'}</Button>}</div>
  </form>
}
export function OnboardingPage() {
  return <main className="onboarding-shell journey-onboarding"><Brand/><p className="onboarding-intro">120 dias. Uma rotina com a sua história.</p><section className="onboarding-card"><PreferencesForm onboarding/></section></main>
}
