import React from 'react'
import { Header } from './Header'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}