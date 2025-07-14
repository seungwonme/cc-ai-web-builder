'use client'

import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { WebBuilderLayout } from '@/components/layout/web-builder-layout'
import { ChatInterface } from '@/components/chat/chat-interface'
import { PreviewPanel } from '@/components/preview/preview-panel'

export default function Home() {
  const [sessionId, setSessionId] = useState<string>(() => uuidv4())
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [port, setPort] = useState<number | undefined>()

  const handleGenerateWebsite = (message: string) => {
    console.log('Generating website for session:', sessionId)
  }

  const handlePreviewReady = (url: string, port: number) => {
    setPreviewUrl(url)
    setPort(port)
  }

  return (
    <WebBuilderLayout
      chatPanel={
        <ChatInterface 
          sessionId={sessionId} 
          onGenerateWebsite={handleGenerateWebsite}
          onPreviewReady={handlePreviewReady}
        />
      }
      previewPanel={
        <PreviewPanel 
          sessionId={sessionId} 
          previewUrl={previewUrl}
          port={port}
        />
      }
    />
  )
}