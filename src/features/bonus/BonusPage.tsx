import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarDays,
  Check,
  Flame,
  Gift,
  ShoppingBasket,
  Store,
  Utensils,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { PageHeading } from '@/components/common'
import { cn } from '@/lib/utils'

type ScenarioId = 'restaurante' | 'churrasco' | 'dia-corrido'

type Scenario = {
  label: string
  icon: LucideIcon
  title: string
  objective: string
  steps: string[]
  planB: string
}

const scenarios: Record<ScenarioId, Scenario> = {
  restaurante: {
    label: 'Restaurante',
    icon: Store,
    title: 'Monte o prato sem complicar',
    objective: '1 proteína + 1 carboidrato + vegetais',
    steps: [
      'Escolha uma proteína: frango, peixe, carne, ovos ou leguminosas.',
      'Complete boa parte do prato com salada ou legumes disponíveis.',
      'Escolha um carboidrato, como arroz, feijão, batata ou massa.',
      'Prefira água ou bebida sem açúcar na maior parte das vezes.',
    ],
    planB: 'No prato feito, peça a salada separada e escolha uma proteína grelhada quando houver.',
  },
  churrasco: {
    label: 'Churrasco',
    icon: Flame,
    title: 'Curta o churrasco e mantenha a direção',
    objective: 'Comece pelo prato, depois repita se ainda houver fome',
    steps: [
      'Comece com salada, vinagrete ou legumes antes de beliscar sem perceber.',
      'Escolha as carnes de que mais gosta e coma devagar, sem precisar provar todas.',
      'Use arroz, farofa e pão de alho como acompanhamentos, não como o prato inteiro.',
      'Intercale bebidas alcoólicas com água, caso decida beber.',
    ],
    planB: 'Se exagerar em uma refeição, apenas retome a próxima normalmente. Não compense ficando sem comer.',
  },
  'dia-corrido': {
    label: 'Dia corrido',
    icon: Zap,
    title: 'Tenha uma combinação rápida de emergência',
    objective: 'Proteína + alimento prático + fruta ou vegetal',
    steps: [
      'Sanduíche com ovos, frango ou atum e uma fruta é uma refeição possível.',
      'Arroz, feijão, ovos e legumes congelados resolvem uma refeição em poucos minutos.',
      'No delivery, procure primeiro pela proteína e depois complete os acompanhamentos.',
      'Use a lista de compras para manter duas opções rápidas sempre disponíveis.',
    ],
    planB: 'Uma refeição simples e suficiente ajuda mais do que esperar pela refeição perfeita.',
  },
}

const scenarioIds = Object.keys(scenarios) as ScenarioId[]

const bonuses = [
  {
    number: '01',
    eyebrow: 'PLANEJE SUAS REFEIÇÕES',
    title: 'Cardápio Testo Max',
    description: 'Seu cardápio de 28 dias já está disponível na área de alimentação.',
    icon: CalendarDays,
    to: '/alimentacao',
    linkLabel: 'Abrir cardápio',
    status: 'Já disponível',
  },
  {
    number: '02',
    eyebrow: 'ORGANIZE SUAS COMPRAS',
    title: 'Lista de Compras do Homem',
    description: 'Gere os itens dos próximos dias e leve uma lista pronta para consultar.',
    icon: ShoppingBasket,
    to: '/alimentacao/compras',
    linkLabel: 'Montar minha lista',
    status: 'Incluído',
  },
] as const

export default function BonusPage() {
  const [activeScenario, setActiveScenario] = useState<ScenarioId>('restaurante')
  const scenario = scenarios[activeScenario]
  const ScenarioIcon = scenario.icon

  return (
    <>
      <PageHeading
        eyebrow="INCLUÍDOS NO SEU ACESSO"
        title="Seus bônus"
        description="Ferramentas práticas para organizar as refeições e manter a rotina também fora de casa."
        action={<span className="bonus-access"><Gift size={17}/>3 bônus liberados</span>}
      />

      <section className="bonus-grid" aria-label="Bônus do protocolo">
        {bonuses.map((bonus) => {
          const Icon = bonus.icon
          return (
            <article className="bonus-card" key={bonus.number}>
              <div className="bonus-card-top">
                <strong className="bonus-number">{bonus.number}</strong>
                <span className="bonus-icon" aria-hidden="true"><Icon size={24}/></span>
              </div>
              <span className="eyebrow">{bonus.eyebrow}</span>
              <h2>{bonus.title}</h2>
              <p>{bonus.description}</p>
              <span className="bonus-status"><Check size={13}/>{bonus.status}</span>
              <Link className="bonus-link" to={bonus.to}>
                {bonus.linkLabel}<ArrowRight size={16}/>
              </Link>
            </article>
          )
        })}

        <article className="bonus-card bonus-card-featured">
          <div className="bonus-card-top">
            <strong className="bonus-number">03</strong>
            <span className="bonus-icon" aria-hidden="true"><Utensils size={24}/></span>
          </div>
          <span className="eyebrow">ADAPTE À VIDA REAL</span>
          <h2>Testo Max na Vida Real</h2>
          <p>Decisões objetivas para restaurante, churrasco e aqueles dias mais corridos.</p>
          <span className="bonus-status"><Check size={13}/>Incluído</span>
          <a className="bonus-link" href="#vida-real">
            Ver guia prático<ArrowRight size={16}/>
          </a>
        </article>
      </section>

      <p className="bonus-included-note"><Check size={16}/>Os 3 bônus já estão incluídos no seu acesso ao protocolo.</p>

      <section className="life-real" id="vida-real" aria-labelledby="life-real-title">
        <div className="life-real-heading">
          <div>
            <span className="eyebrow">BÔNUS 03 · ADAPTE À VIDA REAL</span>
            <h2 id="life-real-title">O que fazer quando sair da rotina</h2>
            <p>Escolha a situação e siga uma direção simples, sem transformar uma refeição em um teste de perfeição.</p>
          </div>
          <span className="life-real-mark" aria-hidden="true"><Utensils size={25}/></span>
        </div>

        <div className="life-real-tabs" role="tablist" aria-label="Escolha uma situação">
          {scenarioIds.map((id) => {
            const item = scenarios[id]
            const Icon = item.icon
            return (
              <button
                type="button"
                role="tab"
                id={`scenario-tab-${id}`}
                aria-selected={activeScenario === id}
                aria-controls="scenario-panel"
                className={cn(activeScenario === id && 'selected')}
                onClick={() => setActiveScenario(id)}
                key={id}
              >
                <Icon size={18}/>
                {item.label}
              </button>
            )
          })}
        </div>

        <div
          className="life-real-panel"
          id="scenario-panel"
          role="tabpanel"
          aria-labelledby={`scenario-tab-${activeScenario}`}
          tabIndex={0}
        >
          <div className="life-real-summary">
            <span className="life-real-scenario-icon" aria-hidden="true"><ScenarioIcon size={24}/></span>
            <div>
              <span className="eyebrow">REGRA PRÁTICA</span>
              <h3>{scenario.title}</h3>
              <strong>{scenario.objective}</strong>
            </div>
          </div>
          <ol className="life-real-steps">
            {scenario.steps.map((step, index) => (
              <li key={step}><span>{index + 1}</span><p>{step}</p></li>
            ))}
          </ol>
          <div className="life-real-plan-b">
            <strong>Plano B</strong>
            <p>{scenario.planB}</p>
          </div>
        </div>
      </section>

      <p className="food-guidance">
        Use estas sugestões como referência prática e adapte-as às suas restrições, preferências e orientações profissionais.
      </p>
    </>
  )
}
