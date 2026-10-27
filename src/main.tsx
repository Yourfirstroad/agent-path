import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/learning-app'
import '@/styles/learning.css'
import { initializeTheme, ThemeProvider } from '@/features/learning/theme'

initializeTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
