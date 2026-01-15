const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')

const requiredFiles = [
  'node_modules/next/package.json',
  'node_modules/tailwindcss/lib/util/buildMediaQuery.js',
]

const workspaceRoot = (() => {
  let currentDir = process.cwd()
  while (true) {
    const packageJsonPath = path.join(currentDir, 'package.json')
    const packageLockPath = path.join(currentDir, 'package-lock.json')
    const hasPackageJson = fs.existsSync(packageJsonPath)
    const hasPackageLock = fs.existsSync(packageLockPath)

    if (hasPackageJson) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
        const workspaces = packageJson.workspaces
        const isWorkspaceRoot =
          Array.isArray(workspaces) &&
          workspaces.some((workspace) => workspace === 'frontend')
        if (isWorkspaceRoot) {
          return currentDir
        }
      } catch (error) {
        console.error(`Failed to read ${packageJsonPath}:`, error)
      }
    }

    if (hasPackageLock) {
      return currentDir
    }

    const parentDir = path.dirname(currentDir)
    if (parentDir === currentDir) {
      return process.cwd()
    }
    currentDir = parentDir
  }
})()

const missingFiles = requiredFiles.filter((relativePath) => {
  const localPath = path.join(process.cwd(), relativePath)
  const rootPath = path.join(workspaceRoot, relativePath)
  return !fs.existsSync(localPath) && !fs.existsSync(rootPath)
})

if (missingFiles.length === 0) {
  process.exit(0)
}

console.log(
  `Missing dependencies detected (${missingFiles.join(
    ', '
  )}). Installing frontend dependencies...`
)

const hasLockfile = fs.existsSync(path.join(workspaceRoot, 'package-lock.json'))
const installArgs = hasLockfile ? ['ci'] : ['install']

const installResult = spawnSync('npm', installArgs, {
  cwd: workspaceRoot,
  stdio: 'inherit',
  shell: process.platform === 'win32',
})

if (installResult.status !== 0) {
  process.exit(installResult.status ?? 1)
}

const remainingMissingFiles = requiredFiles.filter((relativePath) => {
  const localPath = path.join(process.cwd(), relativePath)
  const rootPath = path.join(workspaceRoot, relativePath)
  return !fs.existsSync(localPath) && !fs.existsSync(rootPath)
})

if (remainingMissingFiles.length > 0) {
  console.error(
    `Dependencies are still missing after install: ${remainingMissingFiles.join(
      ', '
    )}`
  )
  process.exit(1)
}
