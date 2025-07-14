const { execa } = require('execa');
const path = require('path');
const fs = require('fs-extra');

async function testClaude() {
  console.log('Testing Claude...');
  
  // Create a test directory
  const testDir = path.join(__dirname, 'test-claude-output');
  await fs.ensureDir(testDir);
  
  try {
    // Simple test: Create a hello world file
    const prompt = 'Create a file named hello.txt with content "Hello from Claude!"';
    
    console.log('Executing claude with prompt:', prompt);
    console.log('Working directory:', testDir);
    
    const subprocess = execa('claude', ['--dangerously-skip-permissions', '-p', prompt], {
      cwd: testDir,
      stdio: 'inherit',
      timeout: 30000 // 30 seconds timeout
    });
    
    await subprocess;
    
    console.log('Claude execution completed!');
    
    // Check if file was created
    const filePath = path.join(testDir, 'hello.txt');
    if (await fs.pathExists(filePath)) {
      const content = await fs.readFile(filePath, 'utf-8');
      console.log('File created successfully!');
      console.log('Content:', content);
    } else {
      console.log('File was not created');
    }
    
  } catch (error) {
    console.error('Error:', error);
    if (error.timedOut) {
      console.log('Claude execution timed out');
    }
  }
}

testClaude();