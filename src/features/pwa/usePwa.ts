import { useEffect, useState } from 'react'
interface InstallEvent extends Event {prompt: () => Promise<void>; userChoice: Promise<{outcome: 'accepted' | 'dismissed'}>}
let deferredPrompt: InstallEvent | null = null
let registration: ServiceWorkerRegistration | null = null
let started = false
const listeners = new Set<() => void>()
function notify() {listeners.forEach(listener => listener())}
export function startPwa() {
  if (started) return
  started = true
  window.addEventListener('beforeinstallprompt', event => {event.preventDefault(); deferredPrompt = event as InstallEvent; notify()})
  window.addEventListener('appinstalled', () => {deferredPrompt = null; notify()})
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    void navigator.serviceWorker.register('/sw.js').then(reg => {
      registration = reg; notify()
      reg.addEventListener('updatefound', () => {reg.installing?.addEventListener('statechange', notify)})
      window.addEventListener('focus', () => {if (navigator.onLine) void reg.update().catch(() => {})})
    }).catch(() => { /* O aplicativo online continua disponível se o navegador bloquear o SW. */ })
  }
}
export function usePwa() {
  const [, render] = useState(0)
  useEffect(() => {const update = () => render(n => n+1); listeners.add(update); return () => {listeners.delete(update)}}, [])
  const installed = window.matchMedia('(display-mode: standalone)').matches || Boolean((navigator as Navigator & {standalone?: boolean}).standalone)
  return {
    installed, canInstall: Boolean(deferredPrompt), updateAvailable: Boolean(registration?.waiting),
    install: async () => {if (!deferredPrompt) return; await deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; notify()},
    update: () => {if (!registration?.waiting) return; if (document.querySelector('[data-unsaved="true"]')) {window.alert('Salve ou descarte suas alterações antes de atualizar o aplicativo.');return} navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload(), {once:true}); registration.waiting.postMessage({type: 'ACTIVATE_UPDATE'})},
  }
}
