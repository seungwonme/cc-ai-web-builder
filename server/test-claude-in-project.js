const { execa } = require('execa');
const path = require('path');
const fs = require('fs-extra');

async function testClaudeInProject() {
  console.log('Testing Claude in a Next.js project context...');
  
  // Use an actual project directory
  const projectDir = path.join(__dirname, '../sessions/test-session/project');
  
  // Ensure the project directory exists
  if (!await fs.pathExists(projectDir)) {
    console.log('Project directory does not exist:', projectDir);
    return;
  }
  
  try {
    // Simple test: modify page.tsx
    const prompt = 'Modify src/app/page.tsx file to create: a simple landing page. Use Next.js 14 app router and Tailwind CSS.';
    
    console.log('Working directory:', projectDir);
    console.log('Files in project:', await fs.readdir(projectDir));
    console.log('Environment PATH:', process.env.PATH);
    console.log('Current user:', process.env.USER);
    
    // Check if claude is available
    try {
      const { stdout } = await execa('which', ['claude']);
      console.log('Claude location:', stdout);
    } catch (e) {
      console.log('Could not find claude with which');
    }
    
    console.log('\nExecuting claude with prompt...');
    
    const subprocess = execa('claude', [
      '--dangerously-skip-permissions',
      '-p',
      prompt
    ], {
      cwd: projectDir,
      stdio: 'inherit',
      timeout: 30000,
      env: process.env
    });
    
    console.log('Process started with PID:', subprocess.pid);
    
    await subprocess;
    
    console.log('\nClaude execution completed!');
    
    // Check if page.tsx was modified
    const pagePath = path.join(projectDir, 'src/app/page.tsx');
    if (await fs.pathExists(pagePath)) {
      const stats = await fs.stat(pagePath);
      console.log('page.tsx last modified:', stats.mtime);
    }
    
  } catch (error) {
    console.error('Error:', error);
    if (error.timedOut) {
      console.log('Claude execution timed out');
    }
    if (error.exitCode) {
      console.log('Exit code:', error.exitCode);
    }
    if (error.stderr) {
      console.log('Stderr:', error.stderr);
    }
  }
}

testClaudeInProject();