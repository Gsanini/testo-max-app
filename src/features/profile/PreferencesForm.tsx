import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Compass,
  ShieldCheck,
} from "lucide-react";
import { useWorkspace } from "@/app/providers";
import { profileSchema, type Profile, type Allergen } from "@/domain/types";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/common";
import { cn } from "@/lib/utils";
import { allergenNames, foods, recipes } from "@/content/recipes";
import { chapters } from "@/content/journey";
import { personalizationReasons } from "@/domain/journey";

const formSchema = profileSchema.extend({
  allergies: profileSchema.shape.allergies.removeDefault(),
  excludedIngredients: profileSchema.shape.excludedIngredients.removeDefault(),
  budget: profileSchema.shape.budget.removeDefault(),
  cookMinutes: profileSchema.shape.cookMinutes.removeDefault(),
  location: profileSchema.shape.location.removeDefault(),
  activityPeriod: profileSchema.shape.activityPeriod.removeDefault(),
  sleepQuality: profileSchema.shape.sleepQuality.removeDefault(),
  age: profileSchema.shape.age.removeDefault(),
  weightKg: profileSchema.shape.weightKg.removeDefault(),
  testosteroneReason: profileSchema.shape.testosteroneReason.removeDefault(),
  perceivedChanges: profileSchema.shape.perceivedChanges.removeDefault(),
  mainConcern: profileSchema.shape.mainConcern.removeDefault(),
  wakeFeeling: profileSchema.shape.wakeFeeling.removeDefault(),
  weeklyGoal: profileSchema.shape.weeklyGoal.removeDefault(),
});
type ChoiceField =
  | "goal"
  | "activityPeriod"
  | "experience"
  | "location"
  | "sleepQuality"
  | "budget"
  | "testosteroneReason"
  | "mainConcern"
  | "wakeFeeling";
type PerceivedChange = Profile["perceivedChanges"][number];

const perceivedChangeOptions: { value: PerceivedChange; label: string }[] = [
  { value: "energia", label: "Menos energia ou disposição" },
  { value: "libido", label: "Menor desejo sexual" },
  { value: "erecao", label: "Mudanças nas ereções" },
  { value: "forca", label: "Perda de força ou massa muscular" },
  { value: "humor", label: "Mudanças de humor ou concentração" },
  { value: "sono", label: "Sono ruim ou não reparador" },
  { value: "peso", label: "Aumento de gordura ou mudança no peso" },
];
const availableIngredients = new Set(
  recipes.flatMap((recipe) =>
    recipe.ingredients.map((ingredient) => ingredient.name),
  ),
);
const relevantAllergens: Allergen[] = ["gluten", "leite", "ovos", "peixe", "amendoim"];

export function PreferencesForm({
  onboarding = false,
  onSaved,
}: {
  onboarding?: boolean;
  onSaved?: () => void;
}) {
  const { data, act, busy, feedback, retry } = useWorkspace();
  const [step, setStep] = useState(0);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    reset,
    formState: { errors, isDirty },
  } = useForm<Profile>({
    resolver: zodResolver(formSchema),
    defaultValues: data.profile,
  });
  const values = watch();
  function options(
    field: ChoiceField,
    items: { value: Profile[ChoiceField]; label: string; text?: string }[],
  ) {
    return (
      <div className='journey-choices'>
        {items.map((item) => (
          <label
            key={String(item.value)}
            className={cn(
              "journey-choice",
              values[field] === item.value && "selected",
            )}
          >
            <input
              type='radio'
              name={field}
              checked={values[field] === item.value}
              onChange={() =>
                setValue(field, item.value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />
            <span>
              <strong>{item.label}</strong>
              {item.text && <small>{item.text}</small>}
            </span>
            <span className='choice-indicator'>
              {values[field] === item.value && <Check size={14} />}
            </span>
          </label>
        ))}
      </div>
    );
  }
  const steps: {
    field: keyof Profile;
    title: string;
    hint: string;
    content: ReactNode;
  }[] = [
    {
      field: "goal",
      title: "O que você quer construir?",
      hint: "Seu objetivo orienta a próxima ação recomendada.",
      content: options("goal", [
        {
          value: "energia",
          label: "Melhorar minha disposição",
          text: "Criar espaço para movimento, pausas e descanso",
        },
        {
          value: "alimentacao",
          label: "Organizar minha alimentação",
          text: "Planejar refeições que caibam na rotina",
        },
        {
          value: "consistencia",
          label: "Criar consistência",
          text: "Começar pequeno e continuar com flexibilidade",
        },
        ...(values.goal === "forca"
          ? [
              {
                value: "forca" as const,
                label: "Priorizar movimento",
                text: "Seu objetivo anterior está preservado",
              },
            ]
          : []),
      ]),
    },
    {
      field: "age",
      title: "Qual é a sua idade?",
      hint: "A idade ajuda a contextualizar sono, recuperação e saúde hormonal. Esta resposta é opcional.",
      content: (
        <label>
          Idade em anos (opcional)
          <input
            type='number'
            inputMode='numeric'
            min='18'
            max='100'
            placeholder='Ex.: 35'
            {...register("age", {
              setValueAs: (value) =>
                value == null || value === "" ? null : Number(value),
            })}
          />
        </label>
      ),
    },
    {
      field: "weightKg",
      title: "Qual é o seu peso atual?",
      hint: "Use um valor aproximado se preferir. O peso não será tratado como nota, meta estética ou diagnóstico.",
      content: (
        <label>
          Peso em kg (opcional)
          <input
            type='number'
            inputMode='decimal'
            min='35'
            max='300'
            step='0.1'
            placeholder='Ex.: 82,5'
            {...register("weightKg", {
              setValueAs: (value) =>
                value == null || value === "" ? null : Number(value),
            })}
          />
        </label>
      ),
    },
    {
      field: "testosteroneReason",
      title: "O que fez você pensar em testosterona?",
      hint: "Não existe resposta certa. Queremos entender de onde vem sua preocupação.",
      content: (
        <>
          {options("testosteroneReason", [
            {
              value: "exame_alterado",
              label: "Tive um exame alterado",
              text: "Já recebi um resultado que chamou minha atenção",
            },
            {
              value: "sintomas",
              label: "Percebi mudanças no corpo",
              text: "Energia, sexualidade, força, humor ou sono mudaram",
            },
            {
              value: "performance",
              label: "Quero melhorar performance",
              text: "Busco mais força, disposição ou mudança corporal",
            },
            {
              value: "curiosidade",
              label: "Curiosidade ou prevenção",
              text: "Quero entender melhor minha saúde",
            },
            { value: "prefiro_nao_responder", label: "Prefiro não responder" },
          ])}
        </>
      ),
    },
    {
      field: "perceivedChanges",
      title: "Quais mudanças você percebeu nos últimos meses?",
      hint: "Marque somente o que realmente mudou para você. Deixe tudo desmarcado se não percebeu mudanças ou prefere não responder.",
      content: (
        <>
          <div className='restriction-grid'>
            {perceivedChangeOptions.map((item) => (
              <label key={item.value} className='restriction'>
                <input
                  type='checkbox'
                  checked={values.perceivedChanges.includes(item.value)}
                  onChange={() =>
                    setValue(
                      "perceivedChanges",
                      values.perceivedChanges.includes(item.value)
                        ? values.perceivedChanges.filter(
                            (value) => value !== item.value,
                          )
                        : [...values.perceivedChanges, item.value],
                      { shouldDirty: true, shouldValidate: true },
                    )
                  }
                />
                {item.label}
              </label>
            ))}
          </div>
        </>
      ),
    },
    {
      field: "mainConcern",
      title: "O que mais preocupa você hoje?",
      hint: "Pense no que você teme que continue igual se nada mudar.",
      content: options("mainConcern", [
        {
          value: "saude",
          label: "Descobrir um problema de saúde",
          text: "Tenho receio de estar ignorando algum sinal",
        },
        {
          value: "sexual",
          label: "Minha saúde sexual",
          text: "Desejo, ereções ou confiança estão me preocupando",
        },
        {
          value: "energia",
          label: "Continuar sem energia",
          text: "O cansaço está afetando minha rotina",
        },
        {
          value: "forca",
          label: "Perder força ou massa muscular",
          text: "Quero manter meu corpo e minha performance",
        },
        {
          value: "peso",
          label: "Não conseguir controlar meu peso",
          text: "Quero manter meu peso em um nível saudável",
        },
        {
          value: "constancia",
          label: "Falhar na rotina novamente",
          text: "Quero manter minha consistência e não desistir",
        },
        { value: "prefiro_nao_responder", label: "Prefiro não responder" },
      ]),
    },
    {
      field: "trainingDays",
      title: "Em quais dias cabem treinos de força?",
      hint: "Distribuímos até três sessões de força na semana, com recuperação entre elas. O cardio leve aparece todos os dias.",
      content: (
        <div className='day-picker'>
          {[
            { v: 1, l: "Seg" },
            { v: 2, l: "Ter" },
            { v: 3, l: "Qua" },
            { v: 4, l: "Qui" },
            { v: 5, l: "Sex" },
            { v: 6, l: "Sáb" },
            { v: 0, l: "Dom" },
          ].map((d) => (
            <button
              type='button'
              key={d.v}
              aria-pressed={values.trainingDays.includes(d.v)}
              className={cn(values.trainingDays.includes(d.v) && "selected")}
              onClick={() =>
                setValue(
                  "trainingDays",
                  values.trainingDays.includes(d.v)
                    ? values.trainingDays.filter((v) => v !== d.v)
                    : [...values.trainingDays, d.v],
                  { shouldValidate: true, shouldDirty: true },
                )
              }
            >
              {d.l}
            </button>
          ))}
        </div>
      ),
    },
    {
      field: "activityPeriod",
      title: "Qual período funciona melhor?",
      hint: "Usamos essa preferência só para destacar uma sugestão. Você decide quando se exercitar.",
      content: options("activityPeriod", [
        { value: "manha", label: "Manhã" },
        { value: "tarde", label: "Tarde" },
        { value: "noite", label: "Noite" },
      ]),
    },
    {
      field: "minutes",
      title: "Quanto tempo cabe no seu dia?",
      hint: "Esse é o tempo dos hábitos e movimentos. Refeições têm seu próprio tempo.",
      content: (
        <label>
          Tempo diário para as missões
          <select {...register("minutes", { valueAsNumber: true })}>
            {[10, 15, 20, 30, 45, 60, 90].map((n) => (
              <option value={n} key={n}>
                {n} minutos
              </option>
            ))}
          </select>
        </label>
      ),
    },
    {
      field: "experience",
      title: "Como está seu movimento hoje?",
      hint: "A duração se adapta à sua experiência; avançar de nível não aumenta a intensidade.",
      content: options("experience", [
        { value: "iniciante", label: "Estou começando ou retomando" },
        { value: "intermediario", label: "Já me movimento regularmente" },
        { value: "avancado", label: "Tenho uma rotina estabelecida" },
      ]),
    },
    {
      field: "location",
      title: "Onde você prefere se movimentar?",
      hint: "As instruções e alternativas vão considerar esse espaço.",
      content: options("location", [
        { value: "casa", label: "Em casa" },
        { value: "academia", label: "Na academia" },
        { value: "ar-livre", label: "Ao ar livre" },
      ]),
    },
    {
      field: "wakeTime",
      title: "Quando seu dia costuma começar?",
      hint: "Usaremos esse horário para sugerir os horários das refeições.",
      content: (
        <label>
          Início da rotina
          <input type='time' {...register("wakeTime")} />
        </label>
      ),
    },
    {
      field: "sleepTime",
      title: "A que horas você quer dormir?",
      hint: "A rotina mostrará a duração entre a hora de dormir e a hora de acordar. Para adultos, a meta mínima usada será de 7 horas.",
      content: (
        <label>
          Hora de dormir
          <input type='time' {...register("sleepTime")} />
        </label>
      ),
    },
    {
      field: "sleepQuality",
      title: "Como são seus horários de descanso?",
      hint: "Sua resposta ajusta o ritual de encerramento do dia.",
      content: options("sleepQuality", [
        { value: "regular", label: "Costumam ser regulares" },
        {
          value: "irregular",
          label: "Mudam bastante",
          text: "Preciso de um ritual que acompanhe dias diferentes",
        },
      ]),
    },
    {
      field: "wakeFeeling",
      title: "Como você costuma acordar?",
      hint: "Pense na maioria dos dias das últimas duas semanas, não apenas em uma noite ruim.",
      content: options("wakeFeeling", [
        {
          value: "descansado",
          label: "Descansado",
          text: "Acordo com energia na maior parte dos dias",
        },
        {
          value: "variavel",
          label: "Varia bastante",
          text: "Alguns dias acordo bem; em outros, cansado",
        },
        {
          value: "cansado",
          label: "Cansado",
          text: "Mesmo dormindo, raramente acordo recuperado",
        },
        { value: "prefiro_nao_responder", label: "Prefiro não responder" },
      ]),
    },
    {
      field: "diet",
      title: "Seu cardápio terá 120 dias",
      hint: "Café da manhã, almoço e jantar com as porções indicadas.",
      content: (
        <div>
          <p className='muted copy'>
            O cardápio combina proteínas animais com arroz, feijão, frutas,
            hortaliças e outros acompanhamentos. As porções são referências
            para uma pessoa, não uma prescrição individual.
          </p>
        </div>
      ),
    },
    {
      field: "allergies",
      title: "Quais restrições devemos considerar?",
      hint: "Marque os grupos que precisa evitar. As receitas com esses ingredientes serão removidas das sugestões.",
      content: (
        <>
          <div className='restriction-grid'>
            {relevantAllergens.map((key) => (
              <label key={key} className='restriction'>
                <input
                  type='checkbox'
                  checked={values.allergies.includes(key as Allergen)}
                  onChange={() =>
                    setValue(
                      "allergies",
                      values.allergies.includes(key as Allergen)
                        ? values.allergies.filter((a) => a !== key)
                        : [...values.allergies, key as Allergen],
                      { shouldDirty: true },
                    )
                  }
                />
                {allergenNames[key]}
              </label>
            ))}
          </div>
          <p className='muted copy'>
            Sem seleção: nenhum desses grupos a evitar. Confira os rótulos e
            possíveis traços; o filtro não verifica contaminação cruzada.
          </p>
        </>
      ),
    },
    {
      field: "excludedIngredients",
      title: "Há outros ingredientes que você evita?",
      hint: "Selecione alergias adicionais, restrições ou preferências entre os ingredientes do catálogo.",
      content: (
        <>
          <label>
            Adicionar ingrediente a evitar
            <select
              value=''
              onChange={(e) => {
                if (e.target.value)
                  setValue(
                    "excludedIngredients",
                    [...values.excludedIngredients, e.target.value],
                    { shouldDirty: true },
                  );
              }}
            >
              <option value=''>Escolher ingrediente</option>
              {Object.values(foods)
                .filter(
                  (f) =>
                    availableIngredients.has(f.name) &&
                    !values.excludedIngredients.includes(f.name),
                )
                .sort((a, b) => a.name.localeCompare(b.name, "pt"))
                .map((f) => (
                  <option key={f.name}>{f.name}</option>
                ))}
            </select>
          </label>
          <div className='ingredient-chips'>
            {values.excludedIngredients.map((name) => (
              <button
                type='button'
                key={name}
                onClick={() =>
                  setValue(
                    "excludedIngredients",
                    values.excludedIngredients.filter((n) => n !== name),
                    { shouldDirty: true },
                  )
                }
                aria-label={`Permitir ${name}`}
              >
                {name}
                <span aria-hidden>×</span>
              </button>
            ))}
          </div>
          <p className='muted copy'>
            Nenhum ingrediente selecionado significa nenhuma exclusão adicional.
            Para produtos compostos, confira a composição no rótulo.
          </p>
        </>
      ),
    },
    {
      field: "timezone",
      title: "Qual é o seu fuso horário?",
      hint: "Usamos o fuso para liberar cada dia e mostrar os horários corretos da sua rotina.",
      content: (
        <label>
          Fuso horário
          <select {...register("timezone")}>
            {[
              ...new Set([
                values.timezone,
                "America/Sao_Paulo",
                "America/Manaus",
                "America/Rio_Branco",
                "America/Noronha",
                "Europe/Lisbon",
                "UTC",
              ]),
            ].map((tz) => (
              <option key={tz}>{tz}</option>
            ))}
          </select>
        </label>
      ),
    },
    {
      field: "weeklyGoal",
      title: "Quantos dias por semana você quer participar?",
      hint: "Conta como participação qualquer dia em que você concluir pelo menos uma missão.",
      content: (
        <label>
          Meta semanal de participação
          <select {...register("weeklyGoal", { valueAsNumber: true })}>
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <option key={n} value={n}>
                {n} dia{n === 1 ? "" : "s"} por semana
              </option>
            ))}
          </select>
        </label>
      ),
    },
  ];
  const summary = step === steps.length;
  const save = handleSubmit(async (profile) => {
    if (
      await act({ type: "profile", profile: { ...profile, onboarded: true } })
    ) {
      reset({ ...profile, onboarded: true });
      if (!onboarding) setStep(0);
      onSaved?.();
    }
  });
  const next = async () => {
    if (await trigger(steps[step]!.field)) {
      setStep((s) => s + 1);
    }
  };
  return (
    <form
      className='form-stack preferences-form quiz-form'
      data-unsaved={isDirty}
      onSubmit={
        summary
          ? save
          : (event) => {
              event.preventDefault();
              void next();
            }
      }
    >
      <div className='onboarding-step-label'>
        <span>
          {onboarding ? "SEU PONTO DE PARTIDA" : "QUIZ DE PREFERÊNCIAS"}
        </span>
        <span>
          {summary
            ? "REVISÃO FINAL"
            : `PERGUNTA ${step + 1} DE ${steps.length}`}
        </span>
      </div>
      <progress
        className='native-progress'
        max={steps.length + 1}
        value={step + 1}
        aria-label='Progresso do quiz de preferências'
      />
      {summary ? (
        <div className='onboarding-summary'>
          <span className='summary-emblem'>
            <Compass size={30} />
          </span>
          {onboarding ? (
            <h1>Este é o seu ponto de partida.</h1>
          ) : (
            <h2>Revise sua rotina.</h2>
          )}
          <p className='question-hint'>
            As respostas de rotina definem horários, atividades e refeições. As
            respostas pessoais ajudam você a revisar seu contexto.
          </p>
          <ul className='reason-list'>
            {personalizationReasons({ profile: values }).map((reason) => (
              <li key={reason}>
                <Check size={17} />
                {reason}
              </li>
            ))}
          </ul>
          {onboarding && (
            <>
              <h2>Assim será sua jornada</h2>
              <div className='chapter-summary'>
                {chapters.map((c) => (
                  <div key={c.id}>
                    <span>{String(c.id).padStart(2, "0")}</span>
                    <div>
                      <strong>{c.name}</strong>
                      <small>
                        Dias {c.start}–{c.end} · {c.objective}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
              <p className='muted copy'>
                O dia 1 abre agora. Os próximos dias abrem à meia-noite no seu
                fuso, mesmo se alguma missão ficar para depois.
              </p>
            </>
          )}

          <p className='onboarding-privacy'>
            <ShieldCheck size={16} />
            Idade, peso e respostas de saúde ficam neste navegador. Você pode
            editá-las a qualquer momento.
          </p>
        </div>
      ) : (
        steps
          .filter((_, i) => i === step)
          .map((s) => (
            <section key={s.field} className='preference-question'>
              <h2>{s.title}</h2>
              <p className='question-hint'>{s.hint}</p>
              {s.content}
              {errors[s.field] && (
                <p className='field-error' role='alert'>
                  {errors[s.field]?.message}
                </p>
              )}
            </section>
          ))
      )}
      {feedback?.error && (
        <div role='alert' className='inline-notice'>
          {feedback.text}
          <Button type='button' variant='secondary' onClick={retry}>
            Tentar novamente
          </Button>
        </div>
      )}
      <div className='form-footer'>
        {step > 0 && (
          <Button
            type='button'
            variant='ghost'
            onClick={() => setStep((s) => s - 1)}
          >
            <ArrowLeft size={17} />
            Voltar
          </Button>
        )}
        {!summary ? (
          <Button key='next' type='submit'>
            Continuar
            <ArrowRight size={17} />
          </Button>
        ) : (
          <Button key='save' type='submit' disabled={busy}>
            <Check size={17} />
            {busy
              ? "Salvando…"
              : onboarding
                ? "Começar minha jornada"
                : "Salvar preferências"}
          </Button>
        )}
      </div>
    </form>
  );
}
export function OnboardingPage() {
  return (
    <main className='onboarding-shell journey-onboarding'>
      <Brand />
      <p className='onboarding-intro'>
        120 dias. Uma rotina com a sua história.
      </p>
      <section className='onboarding-card'>
        <PreferencesForm onboarding />
      </section>
    </main>
  );
}
