import {describe,expect,it} from 'vitest'
import {dateKey,addDays,weekDays} from '../src/domain/dates'
import {dayProgress,streaks,periodProgress} from '../src/domain/progress'
import {consolidateIngredients,groceryPresentation} from '../src/domain/grocery'
import type {Activity,Meal} from '../src/domain/types'

const activity = (date:string, done:boolean, id='a'):Activity => ({id,templateId:id,date,done,title:'Atividade',subtitle:'',category:'bem-estar',icon:'sun',time:'07:00',minutes:10,editable:true,demo:true,instructions:[],exercises:[]})
describe('datas e indicadores',()=>{
  it('respeita o fuso do usuário na virada UTC',()=>{
    expect(dateKey('America/Sao_Paulo',new Date('2026-10-07T01:00:00Z'))).toBe('2026-10-06')
    expect(dateKey('Asia/Tokyo',new Date('2026-10-07T01:00:00Z'))).toBe('2026-10-07')
    expect(addDays('2024-03-01',-1)).toBe('2024-02-29')
    expect(weekDays('2026-10-11')[0]).toBe('2026-10-05')
  })
  it('não encerra sequência enquanto hoje está incompleto',()=>{
    expect(streaks([activity('2026-10-04',true),activity('2026-10-05',true),activity('2026-10-06',false)],'2026-10-06')).toEqual({current:2,best:2})
  })
  it('conta apenas dias totalmente concluídos, sem preencher lacunas',()=>{
    const rows=[activity('2026-10-01',true),activity('2026-10-03',true),activity('2026-10-04',true),activity('2026-10-05',false),activity('2026-10-06',true),activity('2026-10-06',false,'b')]
    expect(streaks(rows,'2026-10-06')).toEqual({current:0,best:2})
    expect(dayProgress(rows,'2026-10-06')).toEqual({done:1,total:2,percent:50})
  })
  it('exclui futuro dos períodos e usa zeros para ausência de registros',()=>{
    expect(periodProgress([activity('2026-10-07',true)],'2026-10-01','2026-10-06')).toEqual({done:0,total:0,percent:0})
    expect(streaks([],'2026-10-06')).toEqual({current:0,best:0})
  })
})
describe('lista de compras',()=>{
  it('soma unidades compatíveis e preserva marcações; não mistura unidades com massa',()=>{
    const meals=[{ingredients:[{name:'Arroz',quantity:1,unit:'kg',category:'Grãos'},{name:'Arroz',quantity:200,unit:'g',category:'Grãos'},{name:'Arroz',quantity:1,unit:'un',category:'Grãos'},{name:'Leite',quantity:1,unit:'L',category:'Laticínios'},{name:'Leite',quantity:500,unit:'ml',category:'Laticínios'}]}] as Meal[]
    const result=consolidateIngredients(meals)
    expect(result).toHaveLength(3)
    expect(result.find(i=>i.sourceKey==='arroz|g')?.quantity).toBe(1200)
    expect(result.find(i=>i.sourceKey==='leite|ml')?.quantity).toBe(1500)
    const checked=result.map(i=>({...i,checked:true}))
    const again=consolidateIngredients(meals,checked)
    expect(again.map(i=>i.id)).toEqual(result.map(i=>i.id))
    expect(again.every(i=>i.checked)).toBe(true)
  })
  it('remove água de preparo e converte frango pronto em quantidade prática para compra',()=>{
    const meals=[{ingredients:[{name:'Água',quantity:200,unit:'ml',category:'Despensa'},{name:'Frango cozido desfiado',quantity:100,unit:'g',category:'Proteínas'}]}] as Meal[]
    const result=consolidateIngredients(meals)
    expect(result).toHaveLength(1)
    expect(result.some(item=>item.name==='Água')).toBe(false)
    expect(groceryPresentation(result[0]!)).toEqual({name:'Peito de frango cru',amount:'aprox. 150 g',preparation:'rende cerca de 100 g cozidos'})
  })
})
