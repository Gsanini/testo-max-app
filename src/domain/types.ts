import { z } from 'zod'

export const categorySchema = z.enum(['movimento', 'alimentacao', 'sono', 'bem-estar'])
export type Category = z.infer<typeof categorySchema>
export const profileSchema = z.object({
  id: z.string(),
  goal: z.enum(['consistencia', 'forca', 'energia']),
  experience: z.enum(['iniciante', 'intermediario', 'avancado']),
  trainingDays: z.array(z.number().int().min(0).max(6)).min(1, 'Escolha ao menos um dia.'),
  minutes: z.number().int().min(10).max(90),
  wakeTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  sleepTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  diet: z.enum(['variada', 'vegetariana', 'vegana', 'mediterranea']),
  timezone: z.string().refine(value => { try { new Intl.DateTimeFormat('pt-BR', {timeZone: value}); return true } catch { return false } }, 'Fuso horário inválido.'),
  onboarded: z.boolean(),
})
export type Profile = z.infer<typeof profileSchema>
export const exerciseSchema = z.object({ name: z.string(), sets: z.string(), reps: z.string(), rest: z.string(), note: z.string() })
export const activitySchema = z.object({
  id: z.string(), templateId: z.string(), date: z.string(), title: z.string(), subtitle: z.string(),
  category: categorySchema, icon: z.string(), time: z.string(), minutes: z.number(),
  done: z.boolean(), editable: z.boolean(), demo: z.boolean(), instructions: z.array(z.string()),
  exercises: z.array(exerciseSchema),
})
export type Activity = z.infer<typeof activitySchema>
export const ingredientSchema = z.object({name: z.string(), quantity: z.number().positive(), unit: z.enum(['g', 'kg', 'ml', 'L', 'un']), category: z.string()})
export type Ingredient = z.infer<typeof ingredientSchema>
export const mealSchema = z.object({
  id: z.string(), templateId: z.string(), date: z.string(), title: z.string(), description: z.string(), time: z.string(),
  image: z.string(), done: z.boolean(), demo: z.boolean(), ingredients: z.array(ingredientSchema),
  steps: z.array(z.string()), substitutions: z.array(z.string()),
  nutrition: z.object({calories: z.number().nonnegative(), protein: z.number().nonnegative(), carbs: z.number().nonnegative(), fat: z.number().nonnegative()}).nullable(),
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
})
export type Workspace = z.infer<typeof workspaceSchema>
export type Action =
  | {type: 'activity'; id: string; done: boolean}
  | {type: 'meal'; id: string; done: boolean}
  | {type: 'time'; id: string; time: string}
  | {type: 'profile'; profile: Profile}
  | {type: 'groceries'; items: GroceryItem[]; replaceGenerated?: boolean}
  | {type: 'removeGrocery'; id: string}
