import rawMenu from './pdf-menu.json'
import type { Allergen, Ingredient, MealSlot, Recipe } from '@/domain/types'

type Food = {name:string; category:string; allergens:Allergen[]}

function foodInfo(name:string):Food {
  const lower=name.toLocaleLowerCase('pt-BR')
  const allergens:Allergen[]=[]
  if(lower.includes('ovo'))allergens.push('ovos')
  if(/leite|iogurte|queijo|ricota/.test(lower))allergens.push('leite')
  if(lower.includes('sardinha'))allergens.push('peixe')
  if(/pão|macarrão/.test(lower))allergens.push('gluten')
  if(lower.includes('amendoim'))allergens.push('amendoim')
  const category = /ovo|frango|carne bovina|sardinha/.test(lower) ? 'Proteínas'
    : /leite|iogurte|queijo|ricota/.test(lower) ? 'Laticínios'
    : /banana|laranja|mamão/.test(lower) ? 'Frutas'
    : /arroz|feijão|cuscuz|aveia|pão|macarrão|tapioca|batata|mandioca|amendoim/.test(lower) ? 'Acompanhamentos'
    : 'Verduras e legumes'
  return {name,category,allergens}
}

const entries=rawMenu.flatMap(day => (['breakfast','lunch','dinner'] as const).map(slot => ({day:day.day,slot, ...day.meals[slot]})))
export const foods=Object.fromEntries([...new Set(entries.flatMap(entry=>entry.ingredients.map(ingredient=>ingredient.name)))].map(name=>[name,foodInfo(name)])) as Record<string,Food>

function preparation(name:string,portions:string):string[] {
  const lower=name.toLocaleLowerCase('pt-BR')
  const steps:string[]=[]
  if(lower.includes('frango assado'))steps.push('Tempere o frango sem pele e asse até ficar totalmente cozido.')
  else if(/frango grelhado|frango na frigideira/.test(lower))steps.push('Cozinhe o frango sem pele na frigideira até ficar totalmente cozido.')
  else if(lower.includes('frango'))steps.push('Cozinhe o frango sem pele com água e pouco sal até ficar totalmente cozido; desfie ou corte conforme o prato.')
  if(lower.includes('carne moída'))steps.push('Refogue a carne até ficar totalmente cozida. Use a cebola quando ela estiver indicada na porção.')
  if(lower.includes('músculo'))steps.push('Cozinhe o músculo com água e temperos na pressão, seguindo o manual da panela, até amaciar.')
  if(lower.includes('carne de panela'))steps.push('Cozinhe a carne magra com água e temperos até ficar macia e totalmente cozida.')
  if(lower.includes('bife'))steps.push('Cozinhe o bife magro e a cebola na frigideira e sirva nas porções indicadas.')
  if(lower.includes('sardinha'))steps.push('Se enlatada, escorra e pese a parte comestível. Aqueça rapidamente com limão e ervas ou use fria ao montar o prato. Sardinha fresca pode ser assada ou cozida.')
  if(lower.includes('omelete'))steps.push('Bata os ovos, junte o recheio já cozido e cozinhe até os ovos ficarem completamente firmes.')
  if(lower.includes('tapioca'))steps.push('Espalhe a goma hidratada na frigideira, firme dos dois lados e recheie.')
  if(lower.includes('panqueca'))steps.push('Amasse a banana, misture ovos e aveia e cozinhe dos dois lados até os ovos ficarem completamente cozidos.')
  if(lower.includes('ovos mexidos'))steps.push('Mexa os ovos na frigideira até ficarem completamente cozidos e sirva com os demais itens da refeição.')
  if(lower.includes('mingau'))steps.push('Aqueça o leite com a aveia até engrossar e sirva com a banana e os ovos cozidos à parte.')
  if(lower.includes('batata doce com ovos'))steps.push('Cozinhe a batata doce e os ovos completamente e sirva nas porções indicadas.')
  if(lower.includes('iogurte com aveia'))steps.push('Misture o iogurte, a aveia, a banana e o amendoim; sirva com os ovos cozidos.')
  if(lower.includes('pão com ricota'))steps.push('Cozinhe o ovo completamente e sirva com o pão e a ricota nas quantidades indicadas.')
  if(lower.includes('sanduíche de frango'))steps.push('Monte o sanduíche com o frango já cozido, o pão e o tomate.')
  if(lower.includes('tapioca'))steps.push('Cozinhe os ovos completamente antes de usar como recheio.')
  if(portions.includes('Misture os 3 primeiros e doure') && !lower.includes('panqueca'))steps.push('Misture os três primeiros ingredientes e doure.')
  if(!steps.length)steps.push('Prepare os componentes da refeição e monte o prato nas porções indicadas no cardápio.')
  if(/arroz|feijão|batata|mandioca|cuscuz|macarrão/.test(portions.toLocaleLowerCase('pt-BR')))steps.push('Sirva os acompanhamentos cozidos nas quantidades indicadas. Cozinhe bem a mandioca e prepare o cuscuz conforme a embalagem.')
  return steps
}

const byKey=new Map<string,Recipe>()
export const pdfMenus=rawMenu.map(day=>{
  const ids={} as Record<'breakfast'|'lunch'|'dinner',string>
  for(const slot of ['breakfast','lunch','dinner'] as const){
    const entry=day.meals[slot]
    const key=JSON.stringify([slot,entry.name,entry.portions])
    let recipe=byKey.get(key)
    if(!recipe){
      const ingredients:Ingredient[]=entry.ingredients.map(item=>({...item,unit:(item.unit==='mL'?'ml':item.unit) as Ingredient['unit'],category:foodInfo(item.name).category}))
      recipe={id:`pdf-${String(day.day).padStart(3,'0')}-${slot}`,name:entry.name,slots:[slot as MealSlot],minutes:null,servings:1,diet:'proteina-animal',economical:true,
        ingredients,allergens:[...new Set(ingredients.flatMap(item=>foodInfo(item.name).allergens))],steps:preparation(entry.name,entry.portions),tags:['Cardápio de 120 dias'],sourcePortions:entry.portions,sourceDay:day.day}
      byKey.set(key,recipe)
    }
    ids[slot]=recipe.id
  }
  return {id:`menu-${day.day}`,day:day.day,recipes:ids}
})

export const recipes=[...byKey.values()]
export const recipeById=new Map(recipes.map(recipe=>[recipe.id,recipe]))
export const allergenNames:Record<Allergen,string>={gluten:'Trigo / glúten',leite:'Leite',ovos:'Ovos',soja:'Soja',amendoim:'Amendoim',castanhas:'Castanhas',peixe:'Peixe',crustaceos:'Crustáceos',gergelim:'Gergelim'}
