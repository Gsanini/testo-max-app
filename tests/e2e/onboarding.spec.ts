import {test,expect} from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import {workspace} from './helpers'

test('uma pergunta por etapa, voltar, preferências e acesso móvel ao perfil',async({page},testInfo)=>{
  await page.goto('/');await page.getByRole('button',{name:'Entrar na minha rotina'}).click()
  await expect(page.locator('.preference-question')).toHaveCount(1)
  await page.getByRole('radio',{name:/Organizar minha alimentação/}).check()
  await page.getByRole('button',{name:'Continuar',exact:true}).click()
  await page.getByRole('button',{name:'Voltar',exact:true}).click()
  await expect(page.getByRole('radio',{name:/Organizar minha alimentação/})).toBeChecked()
  const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(result.violations).toEqual([])
  await page.screenshot({path:`test-results/${testInfo.project.name}-onboarding.png`,fullPage:true})
  for(let step=0;step<14;step++){
    if(step===3)await page.getByRole('combobox',{name:'Tempo diário para as missões'}).selectOption('10')
    if(step===9)await page.getByRole('combobox',{name:'Estilo de alimentação'}).selectOption('vegana')
    if(step===10)await page.getByRole('checkbox',{name:'Soja',exact:true}).check()
    if(step===13)await page.getByRole('combobox',{name:'Tempo por preparo'}).selectOption('10')
    await page.getByRole('button',{name:'Continuar',exact:true}).click()
  }
  await expect(page.getByText('Até 10 min de missões por dia,',{exact:false})).toBeVisible()
  await page.getByRole('button',{name:'Começar minha jornada'}).click()
  await expect(page.locator('.next-action h2')).toHaveText('Escolher a próxima refeição')
  expect((await workspace(page)).profile.allergies).toEqual(['soja'])
  await page.getByRole('link',{name:'Abrir meu perfil'}).click()
  await expect(page.getByRole('heading',{name:'Suas preferências',exact:true})).toBeVisible()
})
