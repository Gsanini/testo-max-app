import {test,expect} from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import {workspace} from './helpers'

test('uma pergunta por etapa, voltar, preferências e acesso móvel ao perfil',async({page},testInfo)=>{
  await page.clock.install({time:new Date('2026-10-17T10:00:00Z')})
  await page.goto('/');await page.getByRole('button',{name:'Entrar na minha rotina'}).click()
  await expect(page.locator('.preference-question')).toHaveCount(1)
  await page.getByRole('radio',{name:/Organizar minha alimentação/}).check()
  await page.getByRole('button',{name:'Continuar',exact:true}).click()
  await page.getByRole('button',{name:'Voltar',exact:true}).click()
  await expect(page.getByRole('radio',{name:/Organizar minha alimentação/})).toBeChecked()
  const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(result.violations).toEqual([])
  await page.screenshot({path:`test-results/${testInfo.project.name}-onboarding.png`,fullPage:true})
  for(let step=0;step<20;step++){
    if(step===1)await page.getByRole('spinbutton',{name:'Idade em anos (opcional)'}).fill('34')
    if(step===2)await page.getByRole('spinbutton',{name:'Peso em kg (opcional)'}).fill('82.5')
    if(step===3)await page.getByRole('radio',{name:/Percebi mudanças no corpo/}).check()
    if(step===4){await page.getByRole('checkbox',{name:'Menos energia ou disposição'}).check();await page.getByRole('checkbox',{name:'Menor desejo sexual'}).check()}
    if(step===5)await page.getByRole('radio',{name:/Continuar sem energia/}).check()
    if(step===8)await page.getByRole('combobox',{name:'Tempo diário para as missões'}).selectOption('10')
    if(step===14)await page.getByRole('radio',{name:/Cansado/}).check()
    if(step===16)await page.getByRole('checkbox',{name:'Amendoim',exact:true}).check()
    await page.getByRole('button',{name:'Continuar',exact:true}).click()
  }
  await expect(page.getByText('Até 10 min para hábitos e movimento por dia',{exact:false})).toBeVisible()
  await expect(page.getByText('Vale conversar com um profissional',{exact:true})).toBeVisible()
  await page.getByRole('button',{name:'Começar minha jornada'}).click()
  await expect(page.locator('.next-action h2')).toHaveText('Luz natural por 1 minuto')
  const profile=(await workspace(page)).profile
  expect(profile).toMatchObject({age:34,weightKg:82.5,testosteroneReason:'sintomas',perceivedChanges:['energia','libido'],mainConcern:'energia',wakeFeeling:'cansado',allergies:['amendoim']})
  await page.getByRole('link',{name:'Perfil',exact:true}).click()
  await expect(page.getByRole('heading',{name:'Suas preferências',exact:true})).toBeVisible()
})
