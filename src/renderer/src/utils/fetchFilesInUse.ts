import ky from 'ky'

interface QueryPageResult {
  value: string
  ns: number
  title: string
}

interface HuijiWikiResponse {
  batchcomplete?: string
  continue?: {
    qpoffset: number
    continue: string
  }
  query: {
    querypage: {
      name: string
      results: QueryPageResult[]
    }
  }
}

async function fetchFilesInUse(): Promise<string[]> {
  const filesInUse: string[] = []
  let continueParams: { qpoffset?: number; continue?: string } | undefined

  do {
    const searchParams = {
      t: Date.now().toString(), // avoid cache
      action: 'query',
      list: 'querypage',
      qppage: 'Wantedfiles',
      format: 'json',
      qplimit: 'max',
      ...(continueParams && {
        qpoffset: continueParams.qpoffset?.toString(),
        continue: continueParams.continue
      })
    }

    const response = (await ky
      .get('https://xyy.huijiwiki.com/api.php', { searchParams })
      .json()) as HuijiWikiResponse

    const processedItems = response.query.querypage.results.map((item) =>
      decodeURIComponent(item.title)
        .replace(/ /g, '_')
        .replace(/^文件:/, '')
    )

    filesInUse.push(...processedItems)
    continueParams = response.continue
      ? {
          qpoffset: response.continue.qpoffset,
          continue: response.continue.continue
        }
      : undefined
  } while (continueParams)

  return filesInUse
    .filter((item) => item.startsWith('GitHub:'))
    .map((item) => item.replace(/^GitHub:/, ''))
}

export default fetchFilesInUse
