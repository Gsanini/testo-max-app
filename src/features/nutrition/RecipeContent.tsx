import { Users, Utensils } from 'lucide-react'
import type { Recipe } from '@/domain/types'
import { allergenNames } from '@/content/recipes'

export function RecipeContent({recipe}:{recipe:Recipe}) {
  return <><div className="recipe-facts"><span><Users size={16}/>{recipe.servings} porção</span><span><Utensils size={16}/>Cardápio de 120 dias</span></div>
    <p className="copy">{recipe.sourcePortions}</p>
    <h3 className="section-label">Ingredientes</h3><ul className="ingredient-list">{recipe.ingredients.map(i=><li key={i.name}><span>{i.name}</span><strong>{i.quantity.toLocaleString('pt-BR')} {i.unit}</strong></li>)}</ul>
    <h3 className="section-label">Preparo simples</h3><ol className="instruction-list">{recipe.steps.map((s,i)=><li key={i}>{s}</li>)}</ol>
    <div className="allergen-note"><strong>{recipe.allergens.length?`Contém: ${recipe.allergens.map(a=>allergenNames[a]).join(', ')}.`:'Sem ingredientes dos grupos de alergênicos monitorados nesta receita.'}</strong><p>Confira rótulos, composição de produtos e possíveis traços. As informações não garantem ausência de contaminação cruzada.</p></div>
    <p className="muted recipe-footnote">Porções de referência para um adulto. Pesos prontos para consumo, exceto aveia seca e goma de tapioca hidratada; pão, queijo e ricota são pesados como comprados. Para o preparo, use cerca de 5 mL de óleo para o conjunto do almoço e 5 mL para o conjunto do jantar; no café, até 5 mL se necessário. Os passos são orientações gerais; as quantidades não são uma prescrição individual.</p></>
}
