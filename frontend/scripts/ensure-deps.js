const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')

const requiredFiles = [
  'node_modules/next/package.json',
  'node_modules/tailwindcss/lib/util/buildMediaQuery.js',
]

const missingFiles = requiredFiles.filter((relativePath) => {
  const absolutePath = path.join(process.cwd(), relativePath)
  return !fs.existsSync(absolutePath)
})

if (missingFiles.length === 0) {
  process.exit(0)
}

console.log(
  `Missing dependencies detected (${missingFiles.join(
    ', '
  )}). Installing frontend dependencies...`
)

const installResult = spawnSync('npm', ['install'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
})

if (installResult.status !== 0) {
  process.exit(installResult.status ?? 1)
}
