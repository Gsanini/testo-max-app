import { useEffect } from "react";
import { NavLink, Outlet, useLocation, Link } from "react-router-dom";
import {
  BarChart3,
  Check,
  ChevronRight,
  ClipboardList,
  Home,
  Gift,
  RefreshCw,
  Sparkles,
  UserRound,
  Utensils,
  X,
} from "lucide-react";
import { useWorkspace } from "./providers";
import { Brand } from "@/components/common";
import { Button } from "@/components/ui/button";
import { usePwa } from "@/features/pwa/usePwa";
import { cn } from "@/lib/utils";

const navigation = [
  { to: "/", title: "Hoje", icon: Home, end: true },
  { to: "/jornada", title: "Jornada", icon: ClipboardList },
  { to: "/alimentacao", title: "Alimentação", icon: Utensils },
  { to: "/bonus", title: "Bônus", icon: Gift },
  { to: "/progresso", title: "Progresso", icon: BarChart3 },
  { to: "/perfil", title: "Perfil", icon: UserRound },
];
export default function Layout() {
  const { busy, feedback, dismiss, retry } = useWorkspace();
  const location = useLocation();
  const pwa = usePwa();
  const current = [...navigation]
    .reverse()
    .find((n) =>
      n.to === "/"
        ? location.pathname === "/"
        : location.pathname.startsWith(n.to),
    );
  useEffect(() => {
    window.scrollTo({ top: 0 });
    document.title = `${current?.title ?? "Hoje"} · TestoMAX`;
  }, [location.pathname, current?.title]);
  return (
    <div className='app-shell'>
      <a href='#main-content' className='skip-link'>
        Ir para o conteúdo
      </a>
      <aside className='sidebar'>
        <Link to='/' className='sidebar-brand' aria-label='TestoMAX início'>
          <Brand />
          <span>SUA ROTINA. SUA EVOLUÇÃO.</span>
        </Link>
        <div className='nav-eyebrow'>SEU DIA A DIA</div>
        <nav className='desktop-nav' aria-label='Navegação principal'>
          {navigation.map((item) => (
            <NavLink
              to={item.to}
              end={item.end}
              key={item.to}
              className={({ isActive }) => cn("nav-item", isActive && "active")}
            >
              <item.icon size={20} strokeWidth={1.7} />
              <span>{item.title}</span>
              <ChevronRight className='nav-chevron' size={14} />
            </NavLink>
          ))}
        </nav>
        <div className='sidebar-bottom'>
          <div className='sidebar-message'>
            <span>
              <Sparkles size={17} />
              No seu ritmo.
            </span>
            <p>O importante é o próximo passo.</p>
          </div>
          <Link className='sidebar-user' to='/perfil'>
            <span className='avatar'>
              <UserRound size={17} />
            </span>
            <div>
              <strong>Bem-vindo</strong>
              <span>Minhas preferências</span>
            </div>
            <ChevronRight size={16} />
          </Link>
        </div>
      </aside>
      <div className='main-shell'>
        {pwa.updateAvailable && (
          <div className='update-banner'>
            <span>Uma nova versão está disponível.</span>
            <Button
              variant='ghost'
              size='sm'
              disabled={busy || Boolean(feedback?.error)}
              onClick={pwa.update}
            >
              <RefreshCw size={15} />
              Atualizar aplicativo
            </Button>
          </div>
        )}
        <main id='main-content' className='page-content' tabIndex={-1}>
          <Outlet />
        </main>
      </div>
      <nav className='bottom-nav' aria-label='Navegação principal no celular'>
        {navigation.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => cn(isActive && "active")}
          >
            <item.icon size={21} strokeWidth={1.8} />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>
      {feedback && (
        <div
          role={feedback.error ? "alert" : "status"}
          className={cn("feedback-toast", feedback.error && "feedback-error")}
        >
          {!feedback.error && (
            <span className='toast-check'>
              <Check size={16} />
            </span>
          )}
          <span>{feedback.text}</span>
          {feedback.error && (
            <Button
              size='sm'
              variant='secondary'
              disabled={busy}
              onClick={retry}
            >
              Tentar novamente
            </Button>
          )}
          <button
            className='icon-button'
            aria-label='Dispensar mensagem'
            onClick={dismiss}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
