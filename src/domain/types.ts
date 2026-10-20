import { z } from 'zod'

export const categorySchema = z.enum(['movimento', 'alimentacao', 'sono', 'bem-estar'])
export type Category = z.infer<typeof categorySchema>
export const profileSchema = z.object({
  id: z.string(),
  goal: z.enum(['consistencia', 'forca', 'energia', 'alimentacao']),
  experience: z.enum(['iniciante', 'intermediario', 'avancado']),
  trainingDays: z.array(z.number().int().min(0).max(6)).min(1, 'Escolha ao menos um dia.'),
  minutes: z.number().int().min(10).max(90),
  wakeTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  sleepTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  diet: z.enum(['variada', 'carnivora', 'vegetariana', 'vegana', 'mediterranea']),
  timezone: z.string().refine(value => { try { new Intl.DateTimeFormat('pt-BR', {timeZone: value}); return true } catch { return false } }, 'Fuso horário inválido.'),
  onboarded: z.boolean(),
  allergies: z.array(z.enum(['gluten','leite','ovos','soja','amendoim','castanhas','peixe','crustaceos','gergelim'])).default([]),
  excludedIngredients: z.array(z.string()).default([]),
  budget: z.enum(['economico','flexivel']).default('economico'),
  cookMinutes: z.number().int().min(10).max(60).default(20),
  location: z.enum(['casa','academia','ar-livre']).default('casa'),
  activityPeriod: z.enum(['manha','tarde','noite']).default('manha'),
  sleepQuality: z.enum(['regular','irregular']).default('irregular'),
  age: z.number().int().min(18, 'Informe uma idade a partir de 18 anos.').max(100, 'Informe uma idade de até 100 anos.').nullable().default(null),
  weightKg: z.number().min(35, 'Informe um peso a partir de 35 kg.').max(300, 'Informe um peso de até 300 kg.').nullable().default(null),
  testosteroneReason: z.enum(['exame_alterado','sintomas','performance','curiosidade','prefiro_nao_responder']).default('prefiro_nao_responder'),
  perceivedChanges: z.array(z.enum(['energia','libido','erecao','forca','humor','sono','peso'])).default([]),
  mainConcern: z.enum(['saude','sexual','energia','forca','peso','constancia','prefiro_nao_responder']).default('prefiro_nao_responder'),
  wakeFeeling: z.enum(['descansado','variavel','cansado','prefiro_nao_responder']).default('prefiro_nao_responder'),
  weeklyGoal: z.number().int().min(1).max(7).default(4),
})
export type Profile = z.infer<typeof profileSchema>
export const exerciseSchema = z.object({ name: z.string(), sets: z.string(), reps: z.string(), rest: z.string(), note: z.string() })
export const activitySchema = z.object({
  id: z.string(), templateId: z.string(), date: z.string(), title: z.string(), subtitle: z.string(),
  category: categorySchema, icon: z.string(), time: z.string(), minutes: z.number(),
  role: z.enum(['habito','treino','cardio','alimentacao','sono']).optional(),
  mealId: z.string().optional(),
  done: z.boolean(), editable: z.boolean(), demo: z.boolean(), instructions: z.array(z.string()),
  exercises: z.array(exerciseSchema),
  journeyDay: z.number().int().min(1).max(120).optional(),
  purpose: z.string().optional(), alternative: z.string().optional(),
})
export type Activity = z.infer<typeof activitySchema>
export const ingredientSchema = z.object({name: z.string(), quantity: z.number().positive(), unit: z.enum(['g', 'kg', 'ml', 'L', 'un']), category: z.string()})
export type Ingredient = z.infer<typeof ingredientSchema>
export const mealSchema = z.object({
  id: z.string(), templateId: z.string(), date: z.string(), title: z.string(), description: z.string(), time: z.string(),
  image: z.string(), done: z.boolean(), demo: z.boolean(), ingredients: z.array(ingredientSchema),
  steps: z.array(z.string()), substitutions: z.array(z.string()),
  nutrition: z.object({calories: z.number().nonnegative(), protein: z.number().nonnegative(), carbs: z.number().nonnegative(), fat: z.number().nonnegative()}).nullable(),
  recipeId: z.string().optional(), slot: z.enum(['breakfast','lunch','snack','dinner']).optional(),
})
export type Meal = z.infer<typeof mealSchema>
export const grocerySchema = z.object({
  id: z.string(), name: z.string().trim().min(1).max(100), quantity: z.number().positive().max(100000),
  unit: ingredientSchema.shape.unit, category: z.string(), checked: z.boolean(), personal: z.boolean(), sourceKey: z.string().nullable(),
})
export type GroceryItem = z.infer<typeof grocerySchema>
export const workspaceSchema = z.object({
  profile: profileSchema, activities: z.array(activitySchema), meals: z.array(mealSchema), grocery: z.array(grocerySchema),
  phases: z.array(z.object({id: z.string(), name: z.string(), description: z.string(), current: z.boolean()})),
  journey: z.object({
    version: z.literal(2), startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    unlockedThrough: z.number().int().min(1).max(120).default(1),
    migrated: z.boolean(), transitionSeen: z.boolean(), lastVisit: z.string(),
    achievements: z.array(z.object({id:z.string(), earnedOn:z.string()})),
  }).nullable().default(null),
  shoppingRange: z.object({start:z.string(), days:z.number().int().min(1).max(7)}).nullable().default(null),
})
export type Workspace = z.infer<typeof workspaceSchema>
export type Action =
  | {type: 'activity'; id: string; done: boolean}
  | {type: 'meal'; id: string; done: boolean}
  | {type: 'time'; id: string; time: string}
  | {type: 'profile'; profile: Profile}
  | {type: 'groceries'; items: GroceryItem[]; replaceGenerated?: boolean}
  | {type: 'removeGrocery'; id: string}
  | {type: 'swapMeal'; id: string; recipeId: string}
  | {type: 'planShopping'; start: string; days: number}
  | {type: 'acknowledgeTransition'}

export type Allergen = Profile['allergies'][number]
export type MealSlot = NonNullable<Meal['slot']>
export interface Recipe {
  id: string; name: string; slots: MealSlot[]; minutes: number; servings: number;
  diet: 'vegana' | 'vegetariana' | 'variada' | 'carnivora'; economical: boolean;
  ingredients: Ingredient[]; allergens: Allergen[]; steps: string[]; tags: string[];
}
export interface Chapter {
  id: number; name: string; start: number; end: number; intro: string; objective: string;
  preview: string; symbol: string; color: string; milestones: string[];
}
export interface Protocol { day: number; chapter: number; title: string; focus: string; theme: Category; lesson: string }
