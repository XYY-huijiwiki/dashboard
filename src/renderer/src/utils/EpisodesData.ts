import { writeFile, utils } from 'xlsx'

type EpisodesRecord = {
  _id: string
} & Record<string, unknown>

type EpisodesResponse = {
  _id: string
  _return: number
  _embedded: Array<EpisodesRecord>
}

async function json2xlsx(json: EpisodesRecord[]) {
  // make objects strings, otherwise they won't show in the table
  json.forEach((element) => {
    Object.keys(element).forEach((key) => {
      if (typeof element[key] === 'object') {
        element[key] = JSON.stringify(element[key])
      }
    })
  })

  // convert json to worksheet
  const worksheet = utils.json_to_sheet(json)
  // convert sheet to workbook
  const workbook = utils.book_new()
  utils.book_append_sheet(workbook, worksheet, 'Tabelle')

  return workbook
}

async function downloadJson(
  json: EpisodesRecord[],
  fileName: string,
): Promise<void> {
  const a = document.createElement('a')
  const blob = new Blob([JSON.stringify(json)], { type: 'application/json' })
  a.href = URL.createObjectURL(blob)
  a.download = `${fileName}.json`
  a.click()
  URL.revokeObjectURL(a.href)
}

async function downloadXlsx(
  json: EpisodesRecord[],
  fileName: string,
): Promise<void> {
  const wb = await json2xlsx(json)
  writeFile(wb, `${fileName}.xlsx`, { bookType: 'xlsx' })
}

export { downloadJson, downloadXlsx }
export type { EpisodesRecord, EpisodesResponse }
