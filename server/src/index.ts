import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import { ProjectManager } from './project-manager'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
  }
})

const PORT = process.env.SERVER_PORT || 4000

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', port: PORT })
})

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  socket.on('generate_request', async (data: {
    sessionId: string
    prompt: string
  }) => {
    console.log('Received generate request:', data)
    
    const projectManager = new ProjectManager(socket)
    
    try {
      await projectManager.generateWebsite(data.sessionId, data.prompt)
    } catch (error) {
      console.error('Generation error:', error)
      socket.emit('generation_error', {
        sessionId: data.sessionId,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })

  socket.on('stop_server', async (data: { sessionId: string }) => {
    try {
      await ProjectManager.stopDevServer(data.sessionId)
      socket.emit('server_stopped', { sessionId: data.sessionId })
    } catch (error) {
      socket.emit('error', {
        sessionId: data.sessionId,
        error: error instanceof Error ? error.message : 'Failed to stop server'
      })
    }
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})