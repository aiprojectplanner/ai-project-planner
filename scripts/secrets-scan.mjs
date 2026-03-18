import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const repoRoot = process.cwd()

const args = new Set(process.argv.slice(2))
const includeUntracked = args.has('--include-untracked')

const shouldSkipFile = (filePath) => {
  const normalized = filePath.replaceAll('\\', '/')
  if (normalized.startsWith('node_modules/')) return true
  if (normalized.startsWith('.git/')) return true
  if (normalized.startsWith('dist/')) return true
  if (normalized.startsWith('build/')) return true
  if (normalized.startsWith('.vercel/')) return true
  if (normalized.startsWith('coverage/')) return true
  if (normalized.startsWith('.trae/')) return true
  if (normalized.endsWith('.lock')) return true
  return false
}

const isProbablyBinary = (buffer) => buffer.includes(0)

const mask = (value) => {
  if (!value) return '<empty>'
  const trimmed = value.trim()
  if (trimmed.length <= 8) return '<redacted>'
  return `${trimmed.slice(0, 4)}…${trimmed.slice(-4)}`
}

const patterns = [
  {
    id: 'openrouter_api_key',
    regex: /\bOPENROUTER_API_KEY\s*=\s*([^\s#]+)/g
  },
  {
    id: 'supabase_service_role_key',
    regex: /\b(SUPABASE_SERVICE_ROLE_KEY|SERVICE_ROLE_KEY)\s*=\s*([^\s#]+)/g
  },
  {
    id: 'generic_sk_token',
    regex: /\b(sk-(?:or-)?v1-[A-Za-z0-9_-]{20,}|sk-[A-Za-z0-9]{20,})\b/g
  },
  {
    id: 'jwt_like',
    regex: /\b(eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,})\b/g
  },
  {
    id: 'supabase_secret_token',
    regex: /\b(sb_secret_[A-Za-z0-9_-]{20,})\b/g
  },
  {
    id: 'google_api_key',
    regex: /\b(AIza[0-9A-Za-z_-]{20,})\b/g
  },
  {
    id: 'slack_token',
    regex: /\b(xox[baprs]-[A-Za-z0-9-]{10,})\b/g
  }
]

const placeholderValues = new Set([
  'your_api_key_here',
  'your_supabase_url',
  'your_supabase_anon_key'
])

const collectGitFiles = () => {
  const output = execFileSync('git', ['ls-files'], { encoding: 'utf8' })
  return output
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
}

const collectUntrackedFiles = () => {
  const output = execFileSync('git', ['ls-files', '--others', '--exclude-standard'], { encoding: 'utf8' })
  return output
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
}

const files = new Set(collectGitFiles())
if (includeUntracked) {
  for (const f of collectUntrackedFiles()) files.add(f)
}

const findings = []

for (const relative of files) {
  if (shouldSkipFile(relative)) continue

  const abs = path.join(repoRoot, relative)
  if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) continue

  const buf = fs.readFileSync(abs)
  if (isProbablyBinary(buf)) continue

  const text = buf.toString('utf8')
  for (const p of patterns) {
    p.regex.lastIndex = 0
    let match
    while ((match = p.regex.exec(text)) !== null) {
      const raw = match[1] ?? match[2] ?? match[0]
      const rawTrimmed = String(raw).trim()
      if (placeholderValues.has(rawTrimmed)) continue

      findings.push({
        file: relative,
        type: p.id,
        value: mask(rawTrimmed)
      })
    }
  }
}

if (findings.length === 0) {
  process.stdout.write('No secrets detected in tracked files.\n')
  process.exit(0)
}

process.stdout.write('Potential secrets detected in tracked files:\n')
for (const f of findings) {
  process.stdout.write(`- ${f.type}: ${f.file} (${f.value})\n`)
}
process.exit(1)
