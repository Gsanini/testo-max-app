import {test,expect,type Page} from '@playwright/test'
async function enter(page:Page) {await page.goto('/');await page.getByRole('button',{name:'Entrar na minha rotina'}).click();await page.getByRole('button',{name:'Continuar',exact:true}).click();await page.getByRole('button',{name:'Continuar',exact:true}).click();await page.getByRole('button',{name:'Começar minha rotina'}).click();await expect(page.getByRole('heading',{name:'Bem-vindo.'})).toBeVisible()}
test('concluir, recarregar, desfazer e consultar progresso',async({page},testInfo)=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message))
  await enter(page)
  await page.getByRole('button',{name:'Abrir detalhes de Um momento ao ar livre'}).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByText('Conteúdo de demonstração.',{exact:false})).toBeVisible()
  await page.getByRole('button',{name:'Marcar como concluída',exact:true}).click()
  await expect(page.getByRole('button',{name:'Desfazer Um momento ao ar livre'})).toHaveAttribute('aria-pressed','true')
  await page.reload()
  await expect(page.getByRole('button',{name:'Desfazer Um momento ao ar livre'})).toHaveAttribute('aria-pressed','true')
  await page.screenshot({path:`test-results/${testInfo.project.name}-hoje.png`,fullPage:true})
  await page.goto('/progresso')
  await expect(page.getByRole('heading',{name:'Seu progresso',exact:true})).toBeVisible()
  await page.getByRole('button',{name:'Como calculamos'}).click();await expect(page.getByRole('dialog')).toContainText('Refeições têm registro próprio')
  await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).not.toBeVisible()
  await page.goto('/')
  await page.getByRole('button',{name:'Desfazer Um momento ao ar livre'}).click()
  await expect(page.getByRole('button',{name:'Concluir Um momento ao ar livre'})).toHaveAttribute('aria-pressed','false')
  expect(errors).toEqual([])
})
test('refeição e lista de compras com persistência e edição',async({page})=>{
  await enter(page);await page.goto('/alimentacao')
  await page.getByRole('button',{name:'Registrar Café da manhã',exact:true}).click()
  await expect(page.getByRole('button',{name:'Desfazer Café da manhã'})).toBeVisible()
  await page.goto('/alimentacao/compras');await page.getByRole('button',{name:'Gerar lista',exact:true}).click()
  const buy=page.getByRole('button',{name:'Comprar Banana',exact:true});await expect(buy).toBeVisible();await buy.click()
  await expect(page.getByRole('button',{name:'Desmarcar Banana',exact:true})).toHaveAttribute('aria-pressed','true')
  await page.reload();await expect(page.getByRole('button',{name:'Desmarcar Banana',exact:true})).toHaveAttribute('aria-pressed','true')
  await page.getByRole('button',{name:'Adicionar item',exact:true}).click();await page.getByRole('textbox',{name:'Nome do item'}).fill('Café pessoal');await page.getByRole('button',{name:'Salvar item'}).click()
  await page.getByRole('button',{name:'Editar Café pessoal'}).click();await page.getByRole('spinbutton',{name:'Quantidade'}).fill('2');await page.getByRole('button',{name:'Salvar item'}).click()
  await expect(page.getByText('2 un · pessoal')).toBeVisible()
  await page.getByRole('button',{name:'Gerar lista',exact:true}).click();await expect(page.getByText('Café pessoal',{exact:true})).toBeVisible()
  await expect(page.getByRole('button',{name:'Desmarcar Banana',exact:true})).toHaveAttribute('aria-pressed','true')
})
test('preferências, semana, navegação e logout preservam os dados locais',async({page})=>{
  await enter(page);await page.goto('/perfil');await page.getByRole('combobox',{name:'Estilo de alimentação'}).selectOption('mediterranea')
  await page.getByRole('button',{name:'Salvar preferências'}).click()
  await page.reload();await expect(page.getByRole('combobox',{name:'Estilo de alimentação'})).toHaveValue('mediterranea')
  await page.goto('/alimentacao');await page.getByRole('combobox',{name:'Dia das refeições'}).selectOption({index:1});await expect(page.getByRole('heading',{name:'Peixe, cuscuz e salada colorida'})).toBeVisible()
  await page.goto('/protocolos');await page.getByRole('button',{name:'Semana',exact:true}).click();await expect(page.getByRole('button',{name:'Semana anterior'})).toBeVisible()
  await page.getByRole('button',{name:'Hábitos',exact:true}).click();await expect(page.getByRole('heading',{name:'Hábitos da sua rotina'})).toBeVisible()
  await page.goto('/perfil');await page.getByRole('button',{name:/Sair Voltar/}).click();await page.getByRole('dialog').getByRole('button',{name:'Sair',exact:true}).click()
  await expect(page.getByRole('heading',{name:'Bom ter você por aqui.'})).toBeVisible()
  expect(await page.evaluate(()=>localStorage.getItem('testomax:local-workspace:v1'))).not.toBeNull()
})
test('offline mantém os dados locais disponíveis e layouts não transbordam',async({page,context},testInfo)=>{
  await enter(page)
  for (const width of (testInfo.project.name==='celular' ? [320,390,844] : [1280,1440])) {
    await page.setViewportSize({width,height:width===844?390:900})
    for (const path of ['/','/protocolos','/alimentacao','/progresso','/perfil','/alimentacao/compras']) {
      await page.goto(path);await expect(page.locator('h1')).toBeVisible()
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),`${path} em ${width}px`).toBe(true)
    }
  }
  await context.setOffline(true)
  await expect(page.getByRole('heading',{name:'Lista de compras',exact:true})).toBeVisible()
  await context.setOffline(false)
})

test('onboarding usa preferências para organizar a primeira rotina',async({page})=>{
  await enter(page)
  await page.evaluate(()=>{
    const key='testomax:local-workspace:v1'
    const state=JSON.parse(localStorage.getItem(key)!)
    state.profile.onboarded=false;state.activities=[];state.meals=[]
    localStorage.setItem(key,JSON.stringify(state))
  })
  await page.reload()
  await expect(page.getByRole('heading',{name:'Vamos começar por você.'})).toBeVisible()
  await page.getByText('Cuidar do bem-estar',{exact:true}).click()
  await page.getByRole('button',{name:'Continuar',exact:true}).click()
  await page.getByRole('combobox',{name:'Tempo disponível por atividade'}).selectOption('15')
  await page.getByRole('button',{name:'Continuar',exact:true}).click()
  await page.getByRole('combobox',{name:'Estilo de alimentação'}).selectOption('vegetariana')
  await page.getByRole('button',{name:'Começar minha rotina'}).click()
  await expect(page.getByRole('heading',{name:'Bem-vindo.'})).toBeVisible()
  await expect(page.getByRole('button',{name:'Abrir detalhes de Uma pausa para você'})).toBeVisible()
  await expect(page.getByRole('button',{name:'Abrir detalhes de Organizar a alimentação'})).toBeVisible()
  await page.goto('/alimentacao')
  await expect(page.getByRole('heading',{name:'Tofu, arroz e vegetais'})).toBeVisible()
  await expect(page.getByText('Plano vegetariano · 0 de 6 registradas')).toBeVisible()
})

test('falha ao salvar mantém opção de repetir sem duplicar conclusão',async({page})=>{
  await enter(page)
  await page.evaluate(()=>{
    const original=Storage.prototype.setItem
    let fail=true
    Storage.prototype.setItem=function(key,value){if(key==='testomax:local-workspace:v1'&&fail){fail=false;throw new Error('Falha de gravação simulada. Tente novamente.')}original.call(this,key,value)}
  })
  await page.getByRole('button',{name:'Concluir Um momento ao ar livre',exact:true}).click()
  await expect(page.getByRole('alert')).toContainText('Falha de gravação simulada')
  await expect(page.getByRole('button',{name:'Concluir Um momento ao ar livre',exact:true})).toHaveAttribute('aria-pressed','false')
  await page.getByRole('button',{name:'Tentar novamente',exact:true}).click()
  await expect(page.getByRole('button',{name:'Desfazer Um momento ao ar livre',exact:true})).toHaveAttribute('aria-pressed','true')
  await page.reload()
  await expect(page.getByRole('button',{name:'Desfazer Um momento ao ar livre',exact:true})).toHaveAttribute('aria-pressed','true')
})
