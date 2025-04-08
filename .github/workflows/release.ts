import { $ } from 'zx'
import { readFileSync, writeFileSync } from 'fs'

interface PackageJson {
  version: string
}

// Configure Git once
$.verbose = false
await $`git config --global user.name "Versioning Bot"`
await $`git config --global user.email "bot@example.com"`

// #region Main execution
try {
  // Read package.json
  const packageJson = JSON.parse(
    readFileSync('package.json', 'utf-8'),
  ) as PackageJson
  const currentVersion = packageJson.version

  // Get Git information
  const latestTag = (
    await $`git describe --tags --abbrev=0 --match "v*"`
  ).stdout.trim()
  const latestVersion = latestTag.replace(/^v/, '')

  // Parse versions
  const [currentMajor, currentMinor, currentPatch] = currentVersion
    .split('.')
    .map(Number)
  const [latestMajor, latestMinor, latestPatch] = latestVersion
    .split('.')
    .map(Number)

  // Detect manual version bump
  if (
    currentMajor > latestMajor ||
    currentMinor > latestMinor ||
    currentPatch > latestPatch
  ) {
    console.log(`Manual version bump detected, releasing ${currentVersion}`)
    await doRelease(`${currentVersion}`)
  }

  // Detect breaking changes
  const latestCommitInfo = (
    await $`git log -1 --pretty=format:"%s" ${latestTag}..HEAD`
  ).stdout.trim()
  // consider `something!:...`, `something(something else)!:...`, `BREAKING CHANGE`
  const isBreakingChange = /(?:!: |\(.+\)!: |BREAKING CHANGE:)/.test(
    latestCommitInfo,
  )
  if (isBreakingChange) {
    console.log(`Breaking changes detected, bumping minor version`)
    await doBumpAndRelease(`${latestMajor}.${latestMinor + 1}.0`)
  }

  // Auto-increment patch after 5 commits
  const commitCount = parseInt(
    (await $`git rev-list --count ${latestTag}..HEAD`).stdout.trim(),
    10,
  )
  if (commitCount >= 5) {
    console.log(`5 commits since last tag, bumping patch version`)
    await doBumpAndRelease(`${latestMajor}.${latestMinor}.${latestPatch + 1}`)
  } else {
    console.log(
      `Only ${commitCount}/5 commits since last tag. No version bump needed.`,
    )
  }
} catch (error) {
  console.error('Versioning failed:')
  console.error(error instanceof Error ? error.message : error)
  console.error(error instanceof Error ? error.stack : error)
  process.exit(1)
}

// #endregion

// #region Helper Functions

async function doRelease(version) {
  await $`git tag v${version}`
  await $`git push origin v${version}`
  await $`echo "version=v${version}" >> $GITHUB_OUTPUT`
  console.log(`Successfully tagged v${version}`)
  process.exit(0)
}

async function doBumpAndRelease(version) {
  // Update package.json
  const packageJson = JSON.parse(
    readFileSync('package.json', 'utf-8'),
  ) as PackageJson
  packageJson.version = version
  writeFileSync('package.json', JSON.stringify(packageJson))
  await $`npm install` // Update lockfile

  // Update CHANGELOG.md
  await $`npm install -g conventional-changelog-cli`
  await $`conventional-changelog -p angular -i CHANGELOG.md -s`
  await $`npm run format`

  // Commit and push changes
  await $`git add .`
  await $`git commit -m "chore: auto-bump version to v${version}"`
  await $`git tag v${version}`
  await $`git push origin main`
  await $`git push origin v${version}`
  await $`echo "version=v${version}" >> $GITHUB_OUTPUT`
  console.log(`Successfully bumped to v${version}`)
  process.exit(0)
}

// #endregion
