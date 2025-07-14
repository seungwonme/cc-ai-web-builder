# AI Web Builder with Next.js

An AI-powered web builder that creates full Next.js applications through natural language prompts.

## 🚀 Features

- **Natural Language to Website**: Describe your website and watch it come to life
- **Real-time Preview**: See your website running in a live development server
- **Full Next.js Projects**: Creates complete Next.js applications with proper structure
- **Live Development Server**: Each project runs on its own port with hot reload
- **Socket.io Integration**: Real-time status updates during generation

## 🛠️ Architecture

This project uses a unique approach:

1. **Project Generation**: Uses `create-next-app` to create real Next.js projects
2. **AI Code Generation**: Integrates with Claude API to generate website code
3. **Development Server Management**: Manages multiple dev servers on different ports
4. **Proxy System**: Routes preview requests to the appropriate development server

## 📋 Prerequisites

- Node.js 18+ 
- pnpm
- Anthropic API key

## 🔧 Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd cc-ai-web-builder
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
# .env.local
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

4. Run the development server:
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── proxy/         # Proxy requests to dev servers
│   │   ├── generate/      # Project generation endpoint
│   │   └── sessions/      # Session management
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── chat/             # Chat interface
│   ├── preview/          # Preview panel
│   └── layout/           # Layout components
├── lib/                   # Core functionality
│   ├── port-manager.ts   # Port allocation
│   ├── project-generator.ts # Next.js project creation
│   ├── claude-code-executor.ts # AI code generation
│   └── websocket-server.ts # Real-time communication
├── pages/api/            # Pages API for Socket.io
│   └── socketio.ts       # WebSocket endpoint
└── sessions/             # Generated projects (gitignored)
```

## 🎯 How It Works

1. **User Input**: User describes the website they want
2. **Project Creation**: System runs `create-next-app` to create a new Next.js project
3. **AI Generation**: Claude API generates the website code based on the description
4. **Dev Server**: Starts a development server on an available port
5. **Live Preview**: Proxies the dev server to show real-time preview

## 🔌 API Endpoints

- `POST /api/generate` - Generate a new project
- `GET /api/proxy/[sessionId]/[...path]` - Proxy to dev server
- `GET /api/sessions/[sessionId]/status` - Get project status
- `POST /api/sessions/[sessionId]/stop` - Stop dev server

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.