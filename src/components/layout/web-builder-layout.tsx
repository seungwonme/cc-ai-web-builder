'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface WebBuilderLayoutProps {
  chatPanel: ReactNode
  previewPanel: ReactNode
  className?: string
}

export function WebBuilderLayout({
  chatPanel,
  previewPanel,
  className
}: WebBuilderLayoutProps) {
  return (
    <div className={cn("flex h-screen w-full overflow-hidden", className)}>
      <aside className="w-[40%] border-r border-border">
        {chatPanel}
      </aside>
      
      <main className="flex-1 w-[60%]">
        {previewPanel}
      </main>
    </div>
  )
}