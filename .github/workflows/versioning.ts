import { $ } from 'zx'
import { readFileSync, writeFileSync } from 'fs'

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
  const [currentMajor, currentMinor] = currentVersion.split('.').map(Number)
  const [latestMajor, latestMinor, latestPatch] = latestVersion.split('.').map(Number)

  // Detect manual version bump
  if (currentMajor > latestMajor || currentMinor > latestMinor) {
    console.log('Manual version bump detected. Tagging current commit.')
    await $`git tag v${currentVersion}`
    await $`git push origin v${currentVersion}`
    process.exit(0)
  }

  // Auto-increment patch after 10 commits
  const commitCount = parseInt((await $`git rev-list --count ${latestTag}..HEAD`).stdout.trim(), 10)
  if (commitCount >= 10) {
    const newVersion = `${latestMajor}.${latestMinor}.${latestPatch + 1}`

    // Update package.json
    packageJson.version = newVersion
    writeFileSync('package.json', JSON.stringify(packageJson))
    await $`npm run format`

    // Commit and push changes
    await $`git add package.json`
    await $`git commit -m "chore: auto-bump version to ${newVersion}"`
    await $`git tag v${newVersion}`

    // Push using GitHub token
    const repo = process.env.GITHUB_REPOSITORY
    await $`git remote set-url origin https://github-actions:${process.env.GITHUB_TOKEN}@github.com/${repo}.git`
    await $`git push origin main`
    await $`git push origin v${newVersion}`

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
