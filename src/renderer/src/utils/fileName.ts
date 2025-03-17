import base62 from './base62'

function fileNameOrgToBase62(fileName: string): string {
  const fileExt = fileName.split('.').pop()
  if (!fileExt) throw new Error('File name must have an extension')
  const fileNameWithoutExt = fileName.slice(0, fileName.length - fileExt.length - 1)
  return `${base62.encode(fileNameWithoutExt)}.${fileExt}`
}

function fileNameBase62ToOrg(fileName: string): string {
  const fileExt = fileName.split('.').pop()
  if (!fileExt) throw new Error('File name must have an extension')
  const fileNameWithoutExtBase62 = fileName.slice(0, fileName.length - fileExt.length - 1)
  return `${base62.decode(fileNameWithoutExtBase62)}.${fileExt}`
}

function fileNameLengthLimitFromOrg(fileName: string): boolean {
  const fileNameBase62 = fileNameOrgToBase62(fileName)
  console.log(`file name length: ${fileName.length}, base62 length: ${fileNameBase62.length}`)
  return fileNameBase62.length <= 255
}

export { fileNameOrgToBase62, fileNameBase62ToOrg, fileNameLengthLimitFromOrg }
