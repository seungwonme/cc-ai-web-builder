import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const url = new URL(request.url)
  const port = url.searchParams.get('port') || '3001'
  const path = url.searchParams.get('path') || '/'
  
  console.log('Proxy request:', { session: params.sessionId, port, path })
  
  try {
    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    const targetUrl = `http://localhost:${port}${normalizedPath}`
    console.log('Fetching from:', targetUrl)
    
    const response = await fetch(targetUrl, {
      headers: {
        ...Object.fromEntries(request.headers.entries()),
        'host': `localhost:${port}`,
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const contentType = response.headers.get('content-type') || ''
    
    // Handle HTML content
    if (contentType.includes('text/html')) {
      const html = await response.text()
      
      // Modify HTML to proxy resources through our API
      const modifiedHtml = html
        .replace(/href="\//g, `href="/api/proxy/${params.sessionId}/?port=${port}&path=`)
        .replace(/src="\//g, `src="/api/proxy/${params.sessionId}/?port=${port}&path=`)
        .replace(/"(\/_next\/[^"]+)"/g, `"/api/proxy/${params.sessionId}/?port=${port}&path=$1"`)
      
      return new NextResponse(modifiedHtml, {
        headers: {
          'Content-Type': contentType,
        },
      })
    }
    
    // Handle other content types (JS, CSS, images, etc.)
    const data = await response.arrayBuffer()
    
    return new NextResponse(data, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': response.headers.get('cache-control') || 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Proxy error:', error)
    return new NextResponse(
      `<html><body><h1>Proxy Error</h1><p>${error}</p></body></html>`,
      { 
        status: 500,
        headers: { 'Content-Type': 'text/html' }
      }
    )
  }
}