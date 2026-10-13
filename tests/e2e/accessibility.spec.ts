import {test,expect} from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
test('contraste, rótulos, teclado e landmarks das telas',async({page},testInfo)=>{
  await page.emulateMedia({reducedMotion:'reduce'})
  await page.goto('/entrar')
  const auth=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()
  expect(auth.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))).toEqual([])
  await page.getByRole('button',{name:'Entrar na minha rotina'}).click()
  await page.getByRole('button',{name:'Continuar',exact:true}).click()
  await page.getByRole('button',{name:'Continuar',exact:true}).click()
  await page.getByRole('button',{name:'Começar minha rotina'}).click()
  for (const path of ['/','/protocolos','/alimentacao','/progresso','/perfil','/alimentacao/compras']) {
    await page.goto(path);await expect(page.locator('h1')).toBeVisible()
    const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()
    expect(result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),path).toEqual([])
    await page.screenshot({path:`test-results/visual-${testInfo.project.name}-${path.replaceAll('/','')||'hoje'}.png`,fullPage:true})
  }
  await page.goto('/')
  await page.getByRole('button',{name:'Abrir detalhes de Um momento ao ar livre'}).focus()
  await page.keyboard.press('Enter');await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Tab');expect(await page.evaluate(()=>Boolean(document.activeElement?.closest('[role="dialog"]')))).toBe(true)
  await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).not.toBeVisible()
})
