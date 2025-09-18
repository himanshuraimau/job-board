import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// Setup MSW worker for browser environment
export const worker = setupWorker(...handlers)

// Start the worker in both development and production (since this is a frontend-only app)
export async function startMocking() {
  // Enable MSW in all environments since this is a demo app with no real backend
  await worker.start({
    onUnhandledRequest: (req, print) => {
      // Only warn about unhandled API requests, not React Router navigation
      const url = new URL(req.url)
      if (url.pathname.startsWith('/api')) {
        print.warning()
      }
    },
    serviceWorker: {
      url: '/mockServiceWorker.js'
    }
  })
  console.log('🔶 MSW: API mocking enabled')
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