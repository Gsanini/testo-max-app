import { describe, expect, it } from 'vitest'
import { localTime, nextActivity, sortDailyActivities } from '../src/domain/dayPlan'
import { personalizedMissions, protocols } from '../src/content/journey'
import { initialProfile } from '../src/demo/repository'

const activities = () => personalizedMissions(protocols[0]!, { ...initialProfile, activityPeriod: 'tarde' }, '2026-10-17')

describe('lista diária flexível', () => {
  it('mostra as três refeições e quatro ações livres numa lista única', () => {
    const rows = sortDailyActivities(activities())
    expect(rows.map(row=>row.templateId)).toEqual([
      'journey:food:breakfast','journey:routine','journey:movement','journey:food',
      'journey:cardio','journey:food:dinner','journey:sleep',
    ])
    expect(rows.filter(row=>row.role==='alimentacao').map(row=>row.time)).toEqual(['07:30','12:30','19:30'])
    expect(rows.filter(row=>row.role!=='alimentacao').every(row=>!row.editable)).toBe(true)
  })

  it('sugere a refeição correspondente sem impor ordem aos hábitos e treinos', () => {
    const rows = activities()
    expect(nextActivity(rows, '07:00')?.role).toBe('habito')
    expect(nextActivity(rows, '07:30')?.templateId).toBe('journey:food:breakfast')
    expect(nextActivity(rows, '12:30')?.templateId).toBe('journey:food')
    expect(nextActivity(rows, '19:30')?.templateId).toBe('journey:food:dinner')
    rows.find(row=>row.templateId==='journey:food')!.done=true
    expect(nextActivity(rows, '15:30','tarde')?.role).toBe('treino')
    rows.find(row=>row.role==='treino')!.done=true
    expect(nextActivity(rows, '15:30','tarde')?.role).toBe('cardio')
  })

  it('não deixa um café esquecido bloquear os outros passos', () => {
    const rows=activities()
    rows.find(row=>row.templateId==='journey:food')!.done=true
    expect(nextActivity(rows,'15:00')?.role).toBe('treino')
    rows.filter(row=>row.role!=='alimentacao').forEach(row=>{row.done=true})
    expect(nextActivity(rows,'15:00')?.templateId).toBe('journey:food:breakfast')
    rows.forEach(row=>{row.done=true})
    expect(nextActivity(rows,'23:00')).toBeUndefined()
  })

  it('usa o fuso do perfil, inclusive na virada do dia', () => {
    expect(localTime('America/Sao_Paulo',new Date('2026-10-18T03:00:00Z'))).toBe('00:00')
    expect(localTime('Asia/Tokyo',new Date('2026-10-18T03:00:00Z'))).toBe('12:00')
  })
})
