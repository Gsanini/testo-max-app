import { Clock3, Users, Leaf } from 'lucide-react'
import type { Recipe } from '@/domain/types'
import { allergenNames } from '@/content/recipes'

export function RecipeContent({recipe}:{recipe:Recipe}) {
  return <><div className="recipe-facts"><span><Clock3 size={16}/>{recipe.minutes} min</span><span><Users size={16}/>{recipe.servings} porção</span><span><Leaf size={16}/>{recipe.tags.join(' · ')}</span></div>
    <h3 className="section-label">Ingredientes</h3><ul className="ingredient-list">{recipe.ingredients.map(i=><li key={i.name}><span>{i.name}</span><strong>{i.quantity.toLocaleString('pt-BR')} {i.unit}</strong></li>)}</ul>
    <h3 className="section-label">Modo de preparo</h3><ol className="instruction-list">{recipe.steps.map((s,i)=><li key={i}>{s}</li>)}</ol>
    <div className="allergen-note"><strong>{recipe.allergens.length?`Contém: ${recipe.allergens.map(a=>allergenNames[a]).join(', ')}.`:'Sem ingredientes dos grupos de alergênicos monitorados nesta receita.'}</strong><p>Confira rótulos, composição de produtos e possíveis traços. As informações não garantem ausência de contaminação cruzada.</p></div>
    <p className="muted recipe-footnote">As quantidades indicam rendimento culinário, não uma prescrição individual. Ingredientes descritos como cozidos devem estar prontos antes de iniciar o cronômetro.</p></>
}
