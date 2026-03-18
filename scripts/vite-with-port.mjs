import { spawn } from 'node:child_process'
import path from 'node:path'

const port = process.env.PORT || process.env.VITE_PORT || '5173'
const extraArgs = process.argv.slice(2)
const viteBin = process.platform === 'win32'
  ? path.join(process.cwd(), 'node_modules', '.bin', 'vite.cmd')
  : path.join(process.cwd(), 'node_modules', '.bin', 'vite')

const args = ['--port', port, '--strictPort', ...extraArgs]

let child
if (process.platform === 'win32') {
  const comspec = process.env.ComSpec || 'cmd.exe'
  child = spawn(comspec, ['/d', '/s', '/c', 'call', viteBin, ...args], { stdio: 'inherit' })
} else {
  child = spawn(viteBin, args, { stdio: 'inherit' })
}

child.on('exit', (code) => {
  process.exit(code ?? 1)
})
