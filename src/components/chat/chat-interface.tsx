'use client'

import { useState, useRef, useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageBubble } from './message-bubble'
import { ChatInput } from './chat-input'
import { Message } from '@/types/ai-builder'
import { v4 as uuidv4 } from 'uuid'
import { Loader2 } from 'lucide-react'
import { io, Socket } from 'socket.io-client'

interface ChatInterfaceProps {
  sessionId?: string
  onGenerateWebsite?: (message: string) => void
  onPreviewReady?: (url: string, port: number) => void
}

export function ChatInterface({ 
  sessionId, 
  onGenerateWebsite,
  onPreviewReady 
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [generationStatus, setGenerationStatus] = useState<string>('')
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    // Connect to the separate Express server on port 4000
    socketRef.current = io('http://localhost:4000', {
      transports: ['websocket', 'polling'],
    })

    socketRef.current.on('connect', () => {
      console.log('Connected to server:', socketRef.current?.id)
    })

    socketRef.current.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason)
    })

    socketRef.current.on('generation_status', (status) => {
      console.log('Generation status:', status)
      setGenerationStatus(status.message)
      
      if (status.status === 'error') {
        setIsLoading(false)
        const errorMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: `Error: ${status.error || status.message}`,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
      }
    })

    socketRef.current.on('preview_ready', (data) => {
      console.log('Preview ready:', data)
      setIsLoading(false)
      setGenerationStatus('')
      
      const successMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: 'Your website is ready! Check the preview panel on the right. The development server is running and you can see your website live.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, successMessage])
      
      if (onPreviewReady) {
        onPreviewReady(data.url, data.port)
      }
    })

    socketRef.current.on('log', (data) => {
      console.log(`[Server log]: ${data.message}`)
    })

    return () => {
      socketRef.current?.disconnect()
    }
  }, [onPreviewReady])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages, generationStatus])

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    if (onGenerateWebsite) {
      onGenerateWebsite(content)
    }

    const currentSessionId = sessionId || uuidv4()

    if (socketRef.current && socketRef.current.connected) {
      console.log('Emitting generate_request:', { sessionId: currentSessionId, prompt: content })
      socketRef.current.emit('generate_request', {
        sessionId: currentSessionId,
        prompt: content
      })
    } else {
      console.error('Socket not connected')
      setIsLoading(false)
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: 'Not connected to server. Please refresh the page and try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b p-4">
        <h1 className="text-xl font-semibold">AI Website Builder</h1>
        <p className="text-sm text-muted-foreground">
          Describe the website you want and I'll build it for you
        </p>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isLoading && generationStatus && (
            <div className="flex justify-start">
              <div className="bg-muted px-4 py-3 rounded-lg max-w-[80%]">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">{generationStatus}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
    </div>
  )
}