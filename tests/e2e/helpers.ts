import {expect,type Page} from '@playwright/test'
export async function enter(page:Page) {
  await page.clock.install({time:new Date('2026-10-17T15:00:00Z')})
  await page.goto('/')
  await page.getByRole('button',{name:'Entrar na minha rotina'}).click()
  for(let step=0;step<14;step++)await page.getByRole('button',{name:'Continuar',exact:true}).click()
  await expect(page.getByRole('heading',{name:'Este é o seu ponto de partida.'})).toBeVisible()
  await page.getByRole('button',{name:'Começar minha jornada'}).click()
  await expect(page.getByRole('heading',{name:'Seu próximo passo começa aqui.'})).toBeVisible()
}
export async function workspace(page:Page){return page.evaluate(()=>JSON.parse(localStorage.getItem('testomax:local-workspace:v1')!))}
