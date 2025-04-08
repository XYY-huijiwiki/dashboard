import * as fs from 'fs/promises'
import * as path from 'path'

async function safeRename(
  oldFilePath: string,
  newFileName: string,
): Promise<string> {
  const targetDir = path.dirname(oldFilePath)
  const parsedNew = path.parse(newFileName)

  // Check if old file and target directory are on the same filesystem
  const [oldStats, dirStats] = await Promise.all([
    fs.stat(oldFilePath),
    fs.stat(targetDir),
  ])
  const sameDevice = oldStats.dev === dirStats.dev

  let n = 0
  while (true) {
    const candidateName =
      n === 0 ? parsedNew.base : `${parsedNew.name} (${n})${parsedNew.ext}`
    const candidatePath = path.join(targetDir, candidateName)

    try {
      if (sameDevice) {
        // Atomic rename using hard links
        await fs.link(oldFilePath, candidatePath)
        await fs.unlink(oldFilePath)
      } else {
        // Cross-filesystem: Safe copy & delete
        const handle = await fs.open(candidatePath, 'wx')
        try {
          const oldFile = await fs.open(oldFilePath, 'r')
          try {
            const readStream = oldFile.createReadStream()
            const writeStream = handle.createWriteStream()
            await new Promise((resolve, reject) => {
              readStream
                .pipe(writeStream)
                .on('finish', () => resolve)
                .on('error', reject)
            })
          } finally {
            await oldFile.close()
          }
        } finally {
          await handle.close()
        }
        await fs.unlink(oldFilePath)
      }
      return candidatePath
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'EEXIST'
      ) {
        n++
        continue
      }
      throw error
    }
  }
}

export default safeRename
