'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, ExternalLink, Smartphone, Monitor, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PreviewPanelProps {
  sessionId?: string
  previewUrl?: string
  port?: number
  className?: string
}

export function PreviewPanel({ sessionId, previewUrl, port, className }: PreviewPanelProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isMobileView, setIsMobileView] = useState(false)
  const [iframeUrl, setIframeUrl] = useState<string>('')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (sessionId && port) {
      // Use proxy with port information
      const proxyUrl = `/api/proxy/${sessionId}?port=${port}`
      console.log('Setting iframe URL:', proxyUrl)
      setIframeUrl(proxyUrl)
      setError('')
    }
  }, [sessionId, port])

  const handleRefresh = () => {
    setIsLoading(true)
    const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement
    if (iframe) {
      iframe.src = iframe.src
    }
    setTimeout(() => setIsLoading(false), 1000)
  }

  const handleOpenInNewTab = () => {
    if (port) {
      window.open(`http://localhost:${port}`, '_blank')
    } else if (iframeUrl) {
      window.open(iframeUrl, '_blank')
    }
  }

  return (
    <div className={cn("h-full flex flex-col", className)}>
      <div className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Preview</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading || !iframeUrl}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
          {port && (
            <span className="text-xs text-muted-foreground">
              Port: {port}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileView(false)}
            className={cn(!isMobileView && "bg-accent")}
          >
            <Monitor className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileView(true)}
            className={cn(isMobileView && "bg-accent")}
          >
            <Smartphone className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleOpenInNewTab}
            disabled={!iframeUrl && !port}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 bg-muted/30 p-4">
        <div className={cn(
          "h-full bg-white rounded-lg shadow-lg mx-auto transition-all duration-300",
          isMobileView ? "max-w-[375px]" : "w-full"
        )}>
          {error ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
              <AlertCircle className="h-12 w-12 mb-4 text-destructive" />
              <p className="text-center">{error}</p>
            </div>
          ) : iframeUrl ? (
            <iframe
              id="preview-iframe"
              src={iframeUrl}
              className="w-full h-full rounded-lg"
              title="Website Preview"
              onError={() => setError('Failed to load preview')}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Start chatting to preview your website</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}