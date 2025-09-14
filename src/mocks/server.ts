import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// Setup MSW server for Node.js environment (testing)
export const server = setupServer(...handlers)

// Start the server
export function startMockingServer() {
  server.listen({
    onUnhandledRequest: 'warn'
  })
  console.log('🔶 MSW: Server mocking enabled')
}

// Stop the server
export function stopMockingServer() {
  server.close()
  console.log('🔶 MSW: Server mocking disabled')
}

// Reset handlers to initial state
export function resetMockingServer() {
  server.resetHandlers()
  console.log('🔶 MSW: Server handlers reset')
}