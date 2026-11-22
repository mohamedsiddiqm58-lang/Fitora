import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function startProcess(name, cmd, args, cwd, color) {
  const isWindows = process.platform === 'win32';
  const proc = spawn(isWindows ? `${cmd}.cmd` : cmd, args, {
    cwd,
    stdio: 'pipe',
    shell: isWindows
  });

  proc.stdout.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => console.log(`${color}[${name}]\x1b[0m ${line}`));
  });

  proc.stderr.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => console.error(`${color}[${name} ERR]\x1b[0m ${line}`));
  });

  proc.on('close', (code) => {
    console.log(`${color}[${name}]\x1b[0m exited with code ${code}`);
  });

  return proc;
}

console.log('\x1b[32m🌿 Starting FITORA Platform (Client + Server)...\x1b[0m');

const serverProc = startProcess('SERVER', 'npm', ['run', 'dev'], path.join(__dirname, 'server'), '\x1b[36m');
const clientProc = startProcess('CLIENT', 'npm', ['run', 'dev'], path.join(__dirname, 'client'), '\x1b[35m');

process.on('SIGINT', () => {
  serverProc.kill();
  clientProc.kill();
  process.exit();
});
