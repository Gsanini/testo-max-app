import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/dm-sans'
import '@fontsource-variable/manrope'
import './styles.css'
import './styles-accessibility.css'
import './styles-journey.css'
import App from './app/App'
import { startPwa } from './features/pwa/usePwa'

startPwa()
createRoot(document.getElementById('root')!).render(<StrictMode><App/></StrictMode>)
