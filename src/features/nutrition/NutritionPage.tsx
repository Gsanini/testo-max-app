import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftRight,
  BookOpen,
  Check,
  ChevronRight,
  Search,
  ShoppingBasket,
  Utensils,
} from "lucide-react";
import { useWorkspace } from "@/app/providers";
import { MealDetails, EmptyState, PageHeading } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import type { Meal, MealSlot, Recipe } from "@/domain/types";
import { addDays, formatDate } from "@/domain/dates";
import { daysBetween } from "@/domain/journey";
import {
  isCompatible,
  recipeForMeal,
  slotNames,
  suitableRecipes,
} from "@/domain/nutrition";
import { recipes, recipeById } from "@/content/recipes";
import { RecipeContent } from "./RecipeContent";
import { cn } from "@/lib/utils";

export default function NutritionPage() {
  const { data, today, act, busy } = useWorkspace();
  const [date, setDate] = useState(today);
  const [tab, setTab] = useState<"week" | "recipes">("week");
  const [selected, setSelected] = useState<Meal | null>(null);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [swap, setSwap] = useState<Meal | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<MealSlot | "">("");
  const meals = data.meals.filter(
    (m) => m.recipeId && recipeById.has(m.recipeId) && m.date === date,
  );
  const selectedDay = daysBetween(data.journey?.startDate??date,date)+1;
  const actual = meals.find((m) => m.id === selected?.id) ?? selected;
  const choices = suitableRecipes(data.profile, category || undefined).filter(
    (r) =>
      r.name
        .toLocaleLowerCase("pt-BR")
        .includes(search.toLocaleLowerCase("pt-BR")),
  );
  const alternatives = swap
    ? suitableRecipes(data.profile, swap.slot).filter(
        (r) =>
          r.id !== swap.recipeId &&
          !data.meals.some(
            (meal) =>
              meal.date === swap.date &&
              meal.id !== swap.id &&
              meal.recipeId === r.id,
          ),
      )
    : [];
  return (
    <>
      <PageHeading
        eyebrow='PLANEJAR TAMBÉM É CUIDAR DE VOCÊ'
        title='Alimentação'
        description='Três refeições por dia durante 120 dias, com as porções indicadas para uma pessoa.'
        action={
          <Button asChild variant='secondary'>
            <Link to='/alimentacao/compras'>
              <ShoppingBasket size={18} />
              Lista de compras
            </Link>
          </Button>
        }
      />

      <div className='tabs' aria-label='Visões da alimentação'>
        <button
          aria-pressed={tab === "week"}
          className={cn(tab === "week" && "active")}
          onClick={() => setTab("week")}
        >
          <Utensils size={17} />
          Minha semana
        </button>
        <button
          aria-pressed={tab === "recipes"}
          className={cn(tab === "recipes" && "active")}
          onClick={() => setTab("recipes")}
        >
          <BookOpen size={17} />
          Receitas
        </button>
      </div>
      <p className='nutrition-filter-note'>Cardápio de 120 dias · Restrições aplicadas <Link to='/perfil'>Editar preferências</Link></p>
      <div className='inline-notice' role='note'><strong>Como pesar as porções.</strong> Os pesos de carnes, frango e acompanhamentos são de alimentos prontos para comer. Aveia seca e goma de tapioca hidratada são pesadas antes do preparo. As porções são referências para uma pessoa.</div>
      {tab === "week" ? (
        <>
          <div className='food-week' aria-label='Dias do cardápio'>
            {Array.from({ length: 7 }, (_, i) => addDays(today, i)).map((d) => (
              <button
                key={d}
                aria-pressed={date === d}
                className={cn(date === d && "selected")}
                onClick={() => setDate(d)}
              >
                <small>
                  {d === today
                    ? "Hoje"
                    : formatDate(d, { weekday: "short" }).replace(".", "")}
                </small>
                <strong>{Number(d.slice(-2))}</strong>
              </button>
            ))}
          </div>
          <div className='meal-day-heading'>
            <h2>
              {date === today
                ? "Seu cardápio de hoje"
                : formatDate(date, {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
            </h2>
            <span>
              {meals.filter((m) => m.done).length} de {meals.length} registradas
            </span>
          </div>
          {meals.length < 3 && (
            <div className='inline-notice' role='status'>
              {selectedDay>120 ? 'O cardápio termina no dia 120.' : 'Uma ou mais refeições planejadas contêm ingredientes marcados nas suas restrições. Revise as preferências antes de seguir o cardápio.'}
            </div>
          )}
          <div className='planned-meals'>
            {meals.map((meal) => {
              const details = recipeForMeal(meal)!;
              return (
                <article
                  key={meal.id}
                  className={cn("planned-meal", meal.done && "meal-done")}
                >
                  <div className='meal-slot'>
                    <span>{meal.time}</span>
                    <strong>{meal.title}</strong>
                  </div>
                  <div className='planned-meal-main'>
                    <div className='meal-title-row'>
                      <h3>{meal.description}</h3>
                      {meal.done && (
                        <span className='recorded'>
                          <Check size={14} />
                          Registrada
                        </span>
                      )}
                    </div>
                    <p>{details.sourcePortions}</p>
                    <span className='recipe-meta'>
                      <span>1 porção</span><span>Dia {selectedDay} de 120</span>
                    </span>
                    {!isCompatible(details, data.profile) && (
                      <p className='muted'>
                        Registro anterior à mudança de preferências. Esta
                        receita não será sugerida novamente.
                      </p>
                    )}
                    <div className='meal-controls'>
                      <button
                        className='text-link'
                        onClick={() => setSelected(meal)}
                      >
                        Ingredientes e preparo
                        <ChevronRight size={15} />
                      </button>
                      <Button
                        size='sm'
                        variant='ghost'
                        disabled={meal.done || busy}
                        onClick={() => setSwap(meal)}
                        aria-label={`Trocar ${meal.title}`}
                      >
                        <ArrowLeftRight size={15} />
                        Trocar refeição
                      </Button>
                    </div>
                  </div>
                  <Button
                    size='icon'
                    variant={meal.done ? "secondary" : "outline"}
                    aria-pressed={meal.done}
                    aria-label={`${meal.done ? "Desfazer" : "Registrar"} ${meal.title}`}
                    disabled={busy || date > today}
                    onClick={() =>
                      void act({ type: "meal", id: meal.id, done: !meal.done })
                    }
                  >
                    <Check size={19} />
                  </Button>
                </article>
              );
            })}
          </div>
          <p className='muted recipe-footnote'>
            Os horários são sugestões. O registro de refeições abre na data
            planejada; consultar, trocar e comprar ingredientes já está
            disponível.
          </p>
        </>
      ) : (
        <>
          <div className='recipe-search'>
            <label>
              <Search size={18} />
              <span className='sr-only'>Buscar receita</span>
              <input
                type='search'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Buscar pelo nome da receita'
              />
            </label>
            <label>
              <span className='sr-only'>Categoria da receita</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MealSlot | "")}
              >
                <option value=''>Todas as categorias</option>
                {Object.entries(slotNames).filter(([value])=>value!=='snack').map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className='muted recipe-count'>
            {choices.length} combinações compatíveis · {recipes.length} combinações no cardápio
          </p>
          {choices.length ? (
            <div className='recipe-library'>
              {choices.map((r) => (
                <button
                  key={r.id}
                  className='recipe-library-item'
                  onClick={() => setRecipe(r)}
                >
                  <span className='recipe-book-icon'>
                    <BookOpen size={23} />
                  </span>
                  <strong>{r.name}</strong>
                  <span>{r.sourcePortions}</span>
                  <small>{r.slots.map((s) => slotNames[s]).join(" · ")}</small>
                  <ChevronRight size={17} />
                </button>
              ))}
            </div>
          ) : (
            <EmptyState
              title='Nenhuma receita com esses filtros'
              text='Tente outro nome ou categoria. Suas restrições alimentares continuam aplicadas.'
            />
          )}
        </>
      )}
      <p className='food-guidance'>
        Orientações gerais de alimentação e hábitos, sem promessas hormonais.
        Confira os rótulos e possíveis traços de alergênicos. Fontes sobre{" "}
        <a
          href='https://ods.od.nih.gov/factsheets/Zinc-HealthProfessional/'
          target='_blank'
          rel='noreferrer'
        >
          zinco
        </a>{" "}
        e{" "}
        <a
          href='https://ods.od.nih.gov/factsheets/VitaminD-HealthProfessional/'
          target='_blank'
          rel='noreferrer'
        >
          vitamina D
        </a>
        .
      </p>
      {actual && (
        <MealDetails meal={actual} onClose={() => setSelected(null)} />
      )}
      {recipe && (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open) setRecipe(null);
          }}
          title={recipe.name}
          description='Receita do seu catálogo compatível'
        >
          <RecipeContent recipe={recipe} />
        </Dialog>
      )}
      {swap && (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open) setSwap(null);
          }}
          title={`Trocar ${swap.title.toLowerCase()}`}
          description='Alternativas filtradas pelas suas preferências. A lista de compras gerada será atualizada.'
        >
          {alternatives.length ? (
            <div className='recipe-alternatives'>
              {alternatives.map((r) => (
                <button
                  key={r.id}
                  disabled={busy}
                  aria-label={`Escolher ${r.name}`}
                  onClick={async () => {
                    if (
                      await act({
                        type: "swapMeal",
                        id: swap.id,
                        recipeId: r.id,
                      })
                    )
                      setSwap(null);
                  }}
                >
                  <span>
                    <strong>{r.name}</strong>
                    <small>
                      {r.sourcePortions}
                    </small>
                  </span>
                  <ArrowLeftRight size={18} />
                </button>
              ))}
            </div>
          ) : (
            <EmptyState
              title='Sem outras opções compatíveis'
              text='Revise suas restrições no perfil ou consulte outras refeições do cardápio. As restrições informadas serão respeitadas.'
            />
          )}
        </Dialog>
      )}
    </>
  );
}
