import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// Setup MSW worker for browser environment
export const worker = setupWorker(...handlers)

// Start the worker in development mode
export async function startMocking() {
  if (process.env.NODE_ENV === 'development') {
    await worker.start({
      onUnhandledRequest: (req, print) => {
        // Only warn about unhandled API requests, not React Router navigation
        if (req.url.pathname.startsWith('/api')) {
          print.warning()
        }
      },
      serviceWorker: {
        url: '/mockServiceWorker.js'
      }
    })
    console.log('🔶 MSW: API mocking enabled')
  }
}

// Stop the worker
export function stopMocking() {
  worker.stop()
  console.log('🔶 MSW: API mocking disabled')
}

// Reset handlers to initial state
export function resetMocking() {
  worker.resetHandlers()
  console.log('🔶 MSW: Handlers reset')
}