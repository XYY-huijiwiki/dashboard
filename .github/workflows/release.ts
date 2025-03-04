import { $ } from 'zx'
import { readdirSync, readFileSync, writeFileSync } from 'fs'

// Typecheck and Lint
await $`npm run typecheck`
await $`npm run lint`

interface PackageJson {
  version: string
}

// Configure Git once
$.verbose = false
await $`git config --global user.name "Versioning Bot"`
await $`git config --global user.email "bot@example.com"`

// Main execution
try {
  // Read package.json
  const packageJson = JSON.parse(readFileSync('package.json', 'utf-8')) as PackageJson
  const currentVersion = packageJson.version

  // Get Git information
  const latestTag = (await $`git describe --tags --abbrev=0 --match "v*"`).stdout.trim()
  const latestVersion = latestTag.replace(/^v/, '')

  // Parse versions
  const [currentMajor, currentMinor, currentPatch] = currentVersion.split('.').map(Number)
  const [latestMajor, latestMinor, latestPatch] = latestVersion.split('.').map(Number)

  // Detect manual version bump
  if (currentMajor > latestMajor || currentMinor > latestMinor || currentPatch > latestPatch) {
    console.log('Manual version bump detected. Tagging current commit.')
    await $`git tag v${currentVersion}`
    await $`git push origin v${currentVersion}`
    await releaseApp(currentVersion)
    console.log(`Successfully released ${currentVersion}`)
    process.exit(0)
  }

  // Auto-increment patch after 10 commits
  const commitCount = parseInt((await $`git rev-list --count ${latestTag}..HEAD`).stdout.trim(), 10)
  if (commitCount >= 10) {
    const newVersion = `${latestMajor}.${latestMinor}.${latestPatch + 1}`

    // Update package.json and CHANGELOG.md
    packageJson.version = newVersion
    writeFileSync('package.json', JSON.stringify(packageJson))
    await $`npm install` // Update lockfile
    await $`npm install -g conventional-changelog-cli`
    await $`conventional-changelog -p angular -i CHANGELOG.md -s`
    await $`npm run format`

    // Commit and push changes
    await $`git add package.json`
    await $`git add CHANGELOG.md`
    await $`git commit -m "chore: auto-bump version to ${newVersion}"`
    await $`git tag v${newVersion}`

    // Push using GitHub token
    const repo = process.env.GITHUB_REPOSITORY
    await $`git remote set-url origin https://github-actions:${process.env.GITHUB_TOKEN}@github.com/${repo}.git`
    await $`git push origin main`
    await $`git push origin v${newVersion}`

    await releaseApp(newVersion)

    console.log(`Successfully released ${newVersion}`)
  } else {
    console.log(`Only ${commitCount}/10 commits since last tag. No version bump needed.`)
  }
} catch (error) {
  console.error('Versioning failed:')
  console.error(error instanceof Error ? error.message : error)
  console.error(error instanceof Error ? error.stack : error)
  process.exit(1)
}

// Build and release the new version
async function releaseApp(newVersion: string) {
  const os = process.platform
  if (os === 'linux') {
    await $`npm run build:linux`
  } else if (os === 'darwin') {
    await $`npm run build:mac`
  } else if (os === 'win32') {
    await $`npm run build:win`
  }

  // Generate release file list
  const extList = ['exe', 'zip', 'dmg', 'AppImage', 'snap', 'deb', 'rpm', 'tar.gz']
  let fileList = readdirSync('dist')
  fileList = fileList.filter((file) => extList.some((ext) => file.endsWith(ext)))
  fileList = fileList.map((file) => `dist/${file}`)
  const flags = ['--generate-notes', '--verify-tag']
  await $`gh release create v${newVersion} ${fileList} ${flags}`
}
