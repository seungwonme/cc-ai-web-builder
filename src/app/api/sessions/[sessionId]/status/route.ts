import { NextRequest, NextResponse } from 'next/server'
import { ProjectGenerator } from '@/lib/project-generator'
import { PortManager } from '@/lib/port-manager'

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params
    
    const projectInfo = ProjectGenerator.getProject(sessionId)
    const port = PortManager.getPortBySession(sessionId)

    if (!projectInfo) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      sessionId,
      status: projectInfo.status,
      port,
      error: projectInfo.error
    })
  } catch (error) {
    console.error('Status API error:', error)
    return NextResponse.json(
      { error: 'Failed to get session status' },
      { status: 500 }
    )
  }
}