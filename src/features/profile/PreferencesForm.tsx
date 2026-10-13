import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { useWorkspace } from '@/app/providers'
import { profileSchema, type Profile } from '@/domain/types'
import { Button } from '@/components/ui/button'
import { Brand } from '@/components/common'
import { cn } from '@/lib/utils'

export function PreferencesForm({onboarding = false, onSaved}: {onboarding?: boolean; onSaved?: () => void}) {
  const {data, act, busy} = useWorkspace()
  const [step, setStep] = useState(0)
  const {register, handleSubmit, watch, setValue, trigger, reset, formState: {errors, isDirty}} = useForm<Profile>({resolver: zodResolver(profileSchema), defaultValues: data.profile})
  const days = watch('trainingDays')
  const next = async () => {const fields: (keyof Profile)[] = step === 0 ? ['goal'] : ['experience', 'trainingDays', 'minutes']; if (await trigger(fields)) setStep(step+1)}
  const save = handleSubmit(async values => {if (await act({type: 'profile', profile: {...values, onboarded: true}})) {reset({...values, onboarded:true});onSaved?.()}})
  return <form className="form-stack preferences-form" data-unsaved={isDirty} onSubmit={save}>
    {onboarding && <><div className="onboarding-progress" aria-label={`Etapa ${step+1} de 3`}>{[0,1,2].map(n => <span className={cn(n <= step && 'active')} key={n}/>)}</div><div><span className="eyebrow">ETAPA {step+1} DE 3</span><h2>{['Vamos começar por você.', 'Uma rotina que cabe no seu dia.', 'Os últimos detalhes.'][step]}</h2><p className="muted">Você pode mudar todas essas preferências depois.</p></div></>}
    {(!onboarding || step === 0) && <fieldset><legend>Seu objetivo principal</legend><div className="choice-grid">{([{value: 'consistencia', label: 'Criar consistência', text: 'Ter uma rotina mais organizada'}, {value: 'forca', label: 'Priorizar movimento', text: 'Reservar tempo para atividades'}, {value: 'energia', label: 'Cuidar do bem-estar', text: 'Equilibrar pausas e descanso'}] as const).map(goal => <label className={cn('choice-card', watch('goal') === goal.value && 'selected')} key={goal.value}><input type="radio" value={goal.value} {...register('goal')}/><strong>{goal.label}</strong><small>{goal.text}</small></label>)}</div></fieldset>}
    {(!onboarding || step === 1) && <><label>Experiência com atividade física<select {...register('experience')}><option value="iniciante">Estou começando ou retomando</option><option value="intermediario">Já tenho alguma experiência</option><option value="avancado">Pratico há bastante tempo</option></select></label><fieldset><legend>Dias disponíveis para movimento</legend><div className="day-picker">{[{v:1,l:'Seg'},{v:2,l:'Ter'},{v:3,l:'Qua'},{v:4,l:'Qui'},{v:5,l:'Sex'},{v:6,l:'Sáb'},{v:0,l:'Dom'}].map(d => <button type="button" className={cn(days.includes(d.v) && 'selected')} aria-pressed={days.includes(d.v)} key={d.v} onClick={() => setValue('trainingDays', days.includes(d.v) ? days.filter(v => v !== d.v) : [...days,d.v], {shouldValidate:true})}>{d.l}</button>)}</div>{errors.trainingDays && <span className="field-error">{errors.trainingDays.message}</span>}</fieldset><label>Tempo disponível por atividade<select {...register('minutes', {valueAsNumber:true})}>{[10,15,20,30,45,60,90].map(n => <option value={n} key={n}>{n} minutos</option>)}</select></label></>}
    {(!onboarding || step === 2) && <><div className="form-grid"><label>Início da rotina<input type="time" {...register('wakeTime')}/>{errors.wakeTime && <span className="field-error">Informe um horário válido.</span>}</label><label>Hora de desacelerar<input type="time" {...register('sleepTime')}/>{errors.sleepTime && <span className="field-error">Informe um horário válido.</span>}</label></div><label>Estilo de alimentação<select {...register('diet')}><option value="variada">Variada</option><option value="vegetariana">Vegetariana</option><option value="vegana">Vegana</option><option value="mediterranea">Mediterrânea</option></select></label><label>Fuso horário<select {...register('timezone')}>{[...new Set([data.profile.timezone, 'America/Sao_Paulo','America/Manaus','America/Rio_Branco','America/Noronha','Europe/Lisbon','UTC'])].map(tz => <option key={tz}>{tz}</option>)}</select>{errors.timezone && <span className="field-error">{errors.timezone.message}</span>}</label><div className="info-card compact"><p>Suas respostas organizam horários e selecionam conteúdos cadastrados. As refeições são exemplos gerais e não substituem orientação nutricional.</p></div></>}
    <div className="form-footer">{onboarding && step > 0 && <Button variant="ghost" type="button" onClick={event => {event.preventDefault();setStep(step-1)}}><ArrowLeft size={17}/>Voltar</Button>}{onboarding && step < 2 ? <Button key="continue" type="button" onClick={event => {event.preventDefault();void next()}}>Continuar<ArrowRight size={17}/></Button> : <Button key="save" type="submit" disabled={busy}><Check size={17}/>{onboarding ? 'Começar minha rotina' : 'Salvar preferências'}</Button>}</div>
  </form>
}
export function OnboardingPage() {
  const [finished, setFinished] = useState(false)
  return <main className="onboarding-shell"><Brand/><section className="onboarding-card">{finished ? <><h1>Sua rotina está pronta.</h1><p>Comece pela primeira atividade na tela Hoje. Você pode ajustar os próximos dias no perfil.</p><Button asChild><a href="/">Ver minha primeira atividade<ArrowRight size={17}/></a></Button></> : <PreferencesForm onboarding onSaved={() => setFinished(true)}/>}</section></main>
}
