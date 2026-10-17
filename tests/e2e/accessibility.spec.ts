import {test,expect} from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import {enter} from './helpers'

test('contraste, rótulos, teclado e landmarks',async({page},testInfo)=>{
  await page.emulateMedia({reducedMotion:'reduce'})
  await enter(page)
  for(const path of ['/','/jornada','/alimentacao','/progresso','/perfil','/alimentacao/compras']){
    await page.goto(path);await expect(page.locator('h1')).toBeVisible()
    const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()
    expect(result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),path).toEqual([])
    await page.screenshot({path:`test-results/visual-${testInfo.project.name}-${path.replaceAll('/','')||'hoje'}.png`,fullPage:true})
  }
  await page.goto('/')
  await page.getByRole('button',{name:'Começar missão',exact:true}).focus();await page.keyboard.press('Enter')
  await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Tab')
  expect(await page.evaluate(()=>Boolean(document.activeElement?.closest('[role="dialog"]')))).toBe(true)
  const modal=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(modal.violations).toEqual([])
  await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).not.toBeVisible()
})
