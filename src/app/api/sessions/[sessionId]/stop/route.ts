import { NextRequest, NextResponse } from 'next/server'
import { ProjectGenerator } from '@/lib/project-generator'

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params
    
    await ProjectGenerator.stopDevServer(sessionId)

    return NextResponse.json({
      success: true,
      message: 'Development server stopped'
    })
  } catch (error) {
    console.error('Stop server API error:', error)
    return NextResponse.json(
      { error: 'Failed to stop server' },
      { status: 500 }
    )
  }
}