import { spawn } from 'node:child_process';

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function run(name, args) {
  const proc = spawn(npmCmd, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  proc.on('exit', (code) => {
    if (code && code !== 0) {
      console.error(`${name} exited with code ${code}`);
    }
  });

  return proc;
}

const backend = run('backend', ['run', 'dev:backend']);
const frontend = run('frontend', ['run', 'dev:frontend']);

function shutdown() {
  backend.kill('SIGTERM');
  frontend.kill('SIGTERM');
  setTimeout(() => process.exit(0), 200);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
