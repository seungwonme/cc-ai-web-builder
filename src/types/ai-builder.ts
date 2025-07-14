export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface Session {
  id: string
  userId?: string
  projectPath: string
  createdAt: Date
  updatedAt: Date
  messages: Message[]
}

export interface GeneratedFile {
  path: string
  content: string
  type: 'html' | 'css' | 'javascript' | 'typescript' | 'json'
}

export interface ProjectMetadata {
  sessionId: string
  name: string
  description?: string
  files: GeneratedFile[]
  framework?: 'vanilla' | 'react' | 'nextjs' | 'vue'
  createdAt: Date
  updatedAt: Date
}