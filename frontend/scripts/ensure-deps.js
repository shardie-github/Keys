const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')

const requiredFiles = [
  'node_modules/next/package.json',
  'node_modules/tailwindcss/lib/util/buildMediaQuery.js',
]

const workspaceRoot = (() => {
  let currentDir = process.cwd()
  let lockfileFallback = null
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

    if (hasPackageLock && !lockfileFallback) {
      lockfileFallback = currentDir
    }

    const parentDir = path.dirname(currentDir)
    if (parentDir === currentDir) {
      return lockfileFallback || process.cwd()
    }
    currentDir = parentDir
  }
})()

const resolveFromWorkspace = (request) => {
  try {
    return require.resolve(request, {
      paths: [process.cwd(), workspaceRoot],
    })
  } catch {
    return null
  }
}

const tailwindPackagePath = resolveFromWorkspace('tailwindcss/package.json')
const resolvedTailwindRoot = tailwindPackagePath
  ? path.dirname(tailwindPackagePath)
  : null
const tailwindBuildMediaQuery = resolvedTailwindRoot
  ? path.join(resolvedTailwindRoot, 'lib', 'util', 'buildMediaQuery.js')
  : null

const missingFiles = requiredFiles.filter((relativePath) => {
  const localPath = path.join(process.cwd(), relativePath)
  const rootPath = path.join(workspaceRoot, relativePath)
  return !fs.existsSync(localPath) && !fs.existsSync(rootPath)
})

const isTailwindBroken =
  !tailwindPackagePath ||
  (tailwindBuildMediaQuery ? !fs.existsSync(tailwindBuildMediaQuery) : true)

if (missingFiles.length === 0 && !isTailwindBroken) {
  process.exit(0)
}

console.log(
  `Missing dependencies detected (${missingFiles.join(
    ', '
  )}). Installing frontend dependencies...`
)

const hasLockfile = fs.existsSync(path.join(workspaceRoot, 'package-lock.json'))
const installArgs = hasLockfile
  ? ['ci', '--workspace=frontend']
  : ['install', '--workspace=frontend']

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

const refreshedTailwindPackagePath = resolveFromWorkspace(
  'tailwindcss/package.json'
)
const refreshedTailwindRoot = refreshedTailwindPackagePath
  ? path.dirname(refreshedTailwindPackagePath)
  : null
const refreshedBuildMediaQuery = refreshedTailwindRoot
  ? path.join(refreshedTailwindRoot, 'lib', 'util', 'buildMediaQuery.js')
  : null

if (
  remainingMissingFiles.length > 0 ||
  !refreshedTailwindPackagePath ||
  (refreshedBuildMediaQuery
    ? !fs.existsSync(refreshedBuildMediaQuery)
    : true)
) {
  const missingList = remainingMissingFiles.join(', ')
  const tailwindStatus = refreshedBuildMediaQuery
    ? !fs.existsSync(refreshedBuildMediaQuery)
    : true
  const tailwindMessage = tailwindStatus
    ? 'Tailwind CSS install is missing lib/util/buildMediaQuery.js.'
    : null
  const messages = [
    missingList ? `Missing files: ${missingList}.` : null,
    tailwindMessage,
  ].filter(Boolean)

  console.error(`Dependencies are still missing after install. ${messages.join(' ')}`)
  process.exit(1)
}
