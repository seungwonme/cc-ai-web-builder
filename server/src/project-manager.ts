import { Socket } from 'socket.io';
import { execa } from 'execa';
import path from 'path';
import fs from 'fs-extra';
import kill from 'tree-kill';

interface ProjectInfo {
  sessionId: string;
  projectPath: string;
  port?: number;
  pid?: number;
  status: 'creating' | 'ready' | 'running' | 'error';
  error?: string;
}

export class ProjectManager {
  private static projects: Map<string, ProjectInfo> = new Map();
  private static ports: Map<number, string> = new Map();
  private static nextPort = 3001;
  private socket: Socket;

  constructor(socket: Socket) {
    this.socket = socket;
  }

  async generateWebsite(sessionId: string, prompt: string) {
    this.emitStatus(sessionId, 'creating', 'Creating Next.js project...');

    try {
      // Step 1: Create Next.js project
      const projectInfo = await this.createNextJsProject(sessionId);

      // Step 2: Start development server immediately
      this.emitStatus(sessionId, 'starting', 'Starting development server...');
      const port = await this.startDevServer(projectInfo);

      // Wait a bit more to ensure server is fully ready
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Emit preview ready immediately
      this.socket.emit('preview_ready', {
        sessionId,
        port,
        url: `http://localhost:${port}`,
      });

      // Step 3: Generate code with Claude Code (after preview is ready)
      this.emitStatus(
        sessionId,
        'generating',
        'Generating website code with AI...',
      );
      await this.generateCode(projectInfo, prompt);

      // Emit generation complete
      this.emitStatus(sessionId, 'complete', 'Website generated successfully!');
    } catch (error) {
      console.error('Project generation error:', error);
      this.emitStatus(
        sessionId,
        'error',
        'Failed to generate website',
        error instanceof Error ? error.message : 'Unknown error',
      );
      throw error;
    }
  }

  private async createNextJsProject(sessionId: string): Promise<ProjectInfo> {
    const sessionsDir = path.join(process.cwd(), 'sessions');
    const sessionPath = path.join(sessionsDir, sessionId);
    const projectPath = path.join(sessionPath, 'project');
    const templatePath = path.join(process.cwd(), 'template');

    await fs.ensureDir(sessionPath);

    const projectInfo: ProjectInfo = {
      sessionId,
      projectPath,
      status: 'creating',
    };

    ProjectManager.projects.set(sessionId, projectInfo);

    try {
      console.log('Copying template to:', projectPath);
      console.log('Template path:', templatePath);

      // Copy template directory to project path
      await fs.copy(templatePath, projectPath, {
        overwrite: true,
        filter: (src) => {
          // Skip node_modules and other unnecessary files
          const relativePath = path.relative(templatePath, src);
          if (relativePath.includes('node_modules')) return false;
          if (relativePath.includes('.next')) return false;
          return true;
        },
      });

      console.log('Template copied successfully');
      this.socket.emit('log', {
        sessionId,
        message: 'Project template copied successfully',
      });

      // Install dependencies
      console.log('Installing dependencies...');
      const installProcess = execa('pnpm', ['install'], {
        cwd: projectPath,
        stdio: 'pipe',
      });

      installProcess.stdout?.on('data', (data) => {
        const output = data.toString();
        console.log('pnpm install:', output);
        this.socket.emit('log', { sessionId, message: output });
      });

      installProcess.stderr?.on('data', (data) => {
        console.error('pnpm install error:', data.toString());
      });

      await installProcess;
      console.log('Dependencies installed successfully');

      projectInfo.status = 'ready';
      this.emitStatus(sessionId, 'creating', 'Project created successfully!');

      return projectInfo;
    } catch (error) {
      projectInfo.status = 'error';
      projectInfo.error =
        error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }

  private async generateCode(projectInfo: ProjectInfo, prompt: string) {
    const claudePrompt = `${prompt} - Next.js 14 app router를 사용하는 프로젝트입니다. src/app/page.tsx 파일을 수정해서 요청사항을 구현해주세요. Tailwind CSS를 사용해주세요.`;

    try {
      // console.log('Running Claude Code...');
      console.log('Running Gemini Code...');
      console.log('Working directory:', projectInfo.projectPath);

      // Use the same approach as the test script that works
      // const subprocess = execa(
      //   'claude',
      //   ['--dangerously-skip-permissions', '-p', claudePrompt],
      //   {
      //     cwd: projectInfo.projectPath,
      //     stdio: 'inherit',
      //     timeout: 600000, // 10 minute timeout
      //   },
      // );
      const subprocess = execa('gemini', ['--yolo', '-p', claudePrompt], {
        cwd: projectInfo.projectPath,
        stdio: 'inherit',
        timeout: 600000, // 10 minute timeout
      });

      await subprocess;

      console.log('Claude execution completed!');
      this.emitStatus(
        projectInfo.sessionId,
        'complete',
        'Code generation complete!',
      );

      // Notify that code has been updated
      this.socket.emit('code_updated', {
        sessionId: projectInfo.sessionId,
        message: 'Code has been updated. Preview will refresh automatically.',
      });
    } catch (error: any) {
      console.error('Code generation error:', error);

      if (error.timedOut) {
        console.log('Claude execution timed out');
        this.emitStatus(
          projectInfo.sessionId,
          'complete',
          'Code generation timed out',
        );
      } else if (error.exitCode === 1) {
        console.log('Claude execution failed with exit code 1');
        this.emitStatus(
          projectInfo.sessionId,
          'complete',
          'Code generation failed',
        );
      } else {
        this.emitStatus(
          projectInfo.sessionId,
          'complete',
          'Code generation completed with errors',
        );
      }
    }
  }

  private async startDevServer(projectInfo: ProjectInfo): Promise<number> {
    const port = await this.findAvailablePort();

    try {
      console.log(`Starting dev server on port ${port}...`);

      const subprocess = execa(
        'pnpm',
        ['run', 'dev', '--port', port.toString()],
        {
          cwd: projectInfo.projectPath,
          stdio: 'pipe',
          env: {
            ...process.env,
            PORT: port.toString(),
          },
        },
      );

      if (subprocess.pid) {
        projectInfo.pid = subprocess.pid;
        projectInfo.port = port;
        projectInfo.status = 'running';
        ProjectManager.ports.set(port, projectInfo.sessionId);
      }

      subprocess.stdout?.on('data', (data) => {
        const output = data.toString();
        console.log(`Dev server [${port}]:`, output);
        this.socket.emit('log', {
          sessionId: projectInfo.sessionId,
          message: output,
        });

        if (
          output.includes('Ready in') ||
          output.includes('compiled successfully')
        ) {
          this.emitStatus(
            projectInfo.sessionId,
            'ready',
            `Development server is running on port ${port}`,
          );
        }
      });

      subprocess.stderr?.on('data', (data) => {
        console.error(`Dev server error [${port}]:`, data.toString());
      });

      subprocess.on('exit', (code) => {
        console.log(`Dev server exited with code ${code}`);
        projectInfo.status = 'ready';
        projectInfo.pid = undefined;
        projectInfo.port = undefined;
        ProjectManager.ports.delete(port);
      });

      // Wait for server to be ready - check for "Ready" or "compiled" messages
      await new Promise((resolve) => {
        let isReady = false;

        const checkReady = () => {
          if (isReady) {
            resolve(true);
          }
        };

        subprocess.stdout?.on('data', (data) => {
          const output = data.toString();
          if (
            output.includes('Ready in') ||
            output.includes('compiled successfully') ||
            output.includes('✓ Ready')
          ) {
            isReady = true;
            checkReady();
          }
        });

        // Timeout after 30 seconds
        setTimeout(() => {
          resolve(true);
        }, 30000);
      });

      return port;
    } catch (error) {
      ProjectManager.ports.delete(port);
      projectInfo.status = 'error';
      projectInfo.error =
        error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }

  private async findAvailablePort(): Promise<number> {
    const net = await import('net');

    const isPortAvailable = (port: number): Promise<boolean> => {
      return new Promise((resolve) => {
        const tester = net
          .createServer()
          .once('error', () => resolve(false))
          .once('listening', () => {
            tester.once('close', () => resolve(true)).close();
          })
          .listen(port);
      });
    };

    let port = ProjectManager.nextPort;
    while (port < 4000) {
      if (!ProjectManager.ports.has(port) && (await isPortAvailable(port))) {
        ProjectManager.nextPort = port + 1;
        return port;
      }
      port++;
    }

    throw new Error('No available ports');
  }

  private emitStatus(
    sessionId: string,
    status: string,
    message: string,
    error?: string,
  ) {
    this.socket.emit('generation_status', {
      sessionId,
      status,
      message,
      error,
    });
  }

  static async stopDevServer(sessionId: string): Promise<void> {
    const projectInfo = this.projects.get(sessionId);
    if (!projectInfo || !projectInfo.pid) {
      return;
    }

    return new Promise((resolve) => {
      kill(projectInfo.pid!, (err) => {
        if (err) {
          console.error('Error stopping dev server:', err);
        }

        if (projectInfo.port) {
          this.ports.delete(projectInfo.port);
        }

        projectInfo.status = 'ready';
        projectInfo.pid = undefined;
        projectInfo.port = undefined;
        resolve();
      });
    });
  }

  static async cleanupAll(): Promise<void> {
    const promises = Array.from(this.projects.keys()).map((sessionId) =>
      this.stopDevServer(sessionId),
    );
    await Promise.all(promises);
  }
}
