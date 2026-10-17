import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { Check, ChevronRight, Compass, Flag, Layers, LockKeyhole, LocateFixed, Sun, Trophy } from 'lucide-react'
import { useWorkspace } from '@/app/providers'
import { PageHeading } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { chapters, protocols } from '@/content/journey'
import { chapterForDay, dayState, dayStateNames, currentDayFor, unlockDate } from '@/domain/journey'
import { formatDate } from '@/domain/dates'
import { cn } from '@/lib/utils'

const chapterIcons=[Sun,Layers,Compass,Flag]
export default function JourneyPage() {
  const {data,today}=useWorkspace()
  const current=currentDayFor(data,today)
  const currentChapter=chapterForDay(current)
  const [chapterId,setChapterId]=useState(currentChapter.id)
  const [preview,setPreview]=useState<number|null>(null)
  const currentRef=useRef<HTMLButtonElement>(null)
  const chapter=chapters[chapterId-1]!
  const Icon=chapterIcons[chapterId-1]!
  const selected=preview?protocols[preview-1]:null
  useEffect(()=>{if(chapterId===currentChapter.id)currentRef.current?.scrollIntoView({block:'center',behavior:'instant'})},[chapterId,currentChapter.id])
  return <><PageHeading eyebrow="120 DIAS PARA CONSTRUIR SUA ROTINA" title="Sua jornada" description="Um caminho de pequenas escolhas. Explore o que vem pela frente." action={<Button variant="secondary" onClick={()=>{setChapterId(currentChapter.id);requestAnimationFrame(()=>currentRef.current?.scrollIntoView({block:'center',behavior:'instant'}))}}><LocateFixed size={18}/>Ir para o dia atual</Button>}/>
    <nav className="chapter-tabs" aria-label="Capítulos da jornada">{chapters.map((c,i)=>{const Symbol=chapterIcons[i]!;return <button key={c.id} aria-pressed={chapterId===c.id} className={cn(chapterId===c.id&&'selected')} onClick={()=>setChapterId(c.id)}><Symbol size={21}/><span><small>CAPÍTULO {c.id}</small><strong>{c.name}</strong><small>Dias {c.start}–{c.end}</small></span></button>})}</nav>
    <div className="journey-map-layout" style={{'--chapter-color':chapter.color} as CSSProperties}><aside className="chapter-introduction"><span className="chapter-emblem"><Icon size={34}/></span><span className="eyebrow">CAPÍTULO {String(chapter.id).padStart(2,'0')}</span><h2>{chapter.name}</h2><p>{chapter.intro}</p><h3>Seu objetivo</h3><p>{chapter.objective}</p><h3>Marcos deste capítulo</h3><ul>{chapter.milestones.map(m=><li key={m}><Flag size={15}/>{m}</li>)}</ul><div className="map-rules"><h3>Um dia de cada vez</h3><p>O próximo protocolo abre à meia-noite no seu fuso. Missões pendentes não bloqueiam o caminho.</p><p>Os dias liberados permanecem acessíveis. Sua pontuação não altera o calendário.</p></div><p className="chapter-curiosity">{chapter.preview}</p></aside>
    <section className="map-canvas" aria-label={`Caminho do capítulo ${chapterId}`}><div className="map-legend"><span><Check size={13}/>Concluído</span><span><Compass size={13}/>Atual</span><span><ChevronRight size={13}/>Disponível</span><span><LockKeyhole size={13}/>Futuro</span></div><ol className="journey-path">{protocols.filter(p=>p.chapter===chapterId).map(p=>{const state=dayState(data,p.day,today);const isCurrent=p.day===current;return <li key={p.day} className={cn('journey-node',`node-${state}`,isCurrent&&'node-today')}><button ref={isCurrent?currentRef:undefined} onClick={()=>setPreview(p.day)} aria-current={isCurrent?'step':undefined} aria-label={`Dia ${p.day}: ${p.title}. ${dayStateNames[state]}${isCurrent&&state==='completed'?'. Dia atual':''}`}><span className="node-circle">{state==='completed'?<Check size={23}/>:state==='locked'?<LockKeyhole size={20}/>:<span>{String(p.day).padStart(2,'0')}</span>}</span><span className="node-text"><small>DIA {p.day} · {dayStateNames[state]}{isCurrent&&state==='completed'?' · Atual':''}</small><strong>{p.title}</strong>{isCurrent&&<em>Você está aqui</em>}</span><ChevronRight className="node-arrow" size={18}/></button>{p.day%7===0&&p.day!==chapter.end&&<span className="map-rest">Revisar. Adaptar. Continuar.</span>}</li>})}<li className="chapter-finish"><Trophy size={24}/><span>Um capítulo da sua história</span></li></ol></section></div>
    {selected&&<Dialog open onOpenChange={open=>{if(!open)setPreview(null)}} title={`Dia ${selected.day} · ${selected.title}`} description={`${chapterForDay(selected.day).name} · ${selected.theme==='bem-estar'?'Bem-estar':selected.theme==='alimentacao'?'Alimentação':selected.theme==='sono'?'Sono':'Movimento'}`}><p className="preview-focus">{selected.focus}</p><p className="muted copy">{selected.lesson}</p>{dayState(data,selected.day,today)==='locked'?<div className="unlock-notice"><LockKeyhole size={20}/><p>Abre em <strong>{formatDate(unlockDate(data.journey!.startDate,selected.day))}</strong>, à meia-noite no fuso {data.profile.timezone}. Nenhuma conclusão anterior é exigida.</p></div>:<Button asChild className="full-width"><Link to={`/?dia=${selected.day}`}>Abrir protocolo<ChevronRight size={17}/></Link></Button>}<Link className="text-link" to="/alimentacao">Planejar refeições agora<ChevronRight size={16}/></Link></Dialog>}
  </>
}
