import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { DatabaseService } from './services/database'

// Initialize MSW in development
async function enableMocking() {
  if (process.env.NODE_ENV !== 'development') {
    return
  }

  const { startMocking } = await import('./mocks/browser')
  return startMocking()
}

// Initialize database
async function initializeDatabase() {
  try {
    await DatabaseService.initializeDatabase()
    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Failed to initialize database:', error)
  }
}

// Start the application
async function startApp() {
  await enableMocking()
  await initializeDatabase()
  
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

startApp().catch(console.error)
