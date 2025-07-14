import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string; path?: string[] } }
) {
  const { sessionId, path = [] } = params
  const url = new URL(request.url)
  const searchParams = url.searchParams
  const port = searchParams.get('port') || '3001'
  
  console.log('Proxy request received:', {
    sessionId,
    path,
    port,
    url: request.url
  })
  
  try {
    const targetPath = path.length > 0 ? `/${path.join('/')}` : '/'
    const targetUrl = `http://localhost:${port}${targetPath}${url.search}`
    
    console.log('Proxying to:', targetUrl)
    
    const response = await fetch(targetUrl, {
      headers: {
        ...Object.fromEntries(request.headers.entries()),
        host: `localhost:${port}`,
      },
    })
    
    const contentType = response.headers.get('content-type')
    
    if (contentType?.includes('text/html')) {
      const text = await response.text()
      const modifiedHtml = text
        .replace(/href="\//g, `href="/api/proxy/${sessionId}/`)
        .replace(/src="\//g, `src="/api/proxy/${sessionId}/`)
        .replace(/_next/g, `api/proxy/${sessionId}/_next`)
      
      return new NextResponse(modifiedHtml, {
        status: response.status,
        headers: {
          'content-type': contentType,
        },
      })
    }
    
    const data = await response.arrayBuffer()
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'content-type': contentType || 'application/octet-stream',
      },
    })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to proxy request' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: { params: { sessionId: string; path?: string[] } }) {
  return handleRequest(request, { params }, 'POST')
}

export async function PUT(request: NextRequest, { params }: { params: { sessionId: string; path?: string[] } }) {
  return handleRequest(request, { params }, 'PUT')
}

export async function DELETE(request: NextRequest, { params }: { params: { sessionId: string; path?: string[] } }) {
  return handleRequest(request, { params }, 'DELETE')
}

async function handleRequest(
  request: NextRequest,
  { params }: { params: { sessionId: string; path?: string[] } },
  method: string
) {
  const { sessionId, path = [] } = params
  const url = new URL(request.url)
  const searchParams = url.searchParams
  const port = searchParams.get('port') || '3001'
  
  try {
    const targetPath = path.length > 0 ? `/${path.join('/')}` : '/'
    const targetUrl = `http://localhost:${port}${targetPath}${url.search}`
    
    const response = await fetch(targetUrl, {
      method,
      headers: {
        ...Object.fromEntries(request.headers.entries()),
        host: `localhost:${port}`,
      },
      body: request.body,
    })
    
    const data = await response.arrayBuffer()
    
    return new NextResponse(data, {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
    })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to proxy request' },
      { status: 500 }
    )
  }
}