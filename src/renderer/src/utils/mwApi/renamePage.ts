import { i18n } from '@renderer/main'
import { is } from '@renderer/utils'

const { t } = i18n.global

/**
 * Parameters for the move operation.
 * @see {@link https://www.mediawiki.org/wiki/Special:MyLanguage/API:Move}
 */
type RenameParams = RenameParamsFrom | RenameParamsFromId

interface RenameParamsBase {
  /** Title to rename the page to. This parameter is required. */
  to: string

  /** Reason for the rename. Default: (empty) */
  reason?: string

  /** Rename the talk page, if it exists. */
  movetalk?: boolean

  /** Rename subpages, if applicable. */
  movesubpages?: boolean

  /** Don't create a redirect. */
  noredirect?: boolean

  /**
   * Unconditionally add or remove the page from the current user's watchlist,
   * use preferences (ignored for bot users) or do not change watch.
   * One of the following values: nochange, preferences, unwatch, watch
   * Default: preferences
   */
  watchlist?: 'nochange' | 'preferences' | 'unwatch' | 'watch'

  /** Ignore any warnings. */
  ignorewarnings?: boolean

  /**
   * Change tags to apply to the entry in the move log and to the null revision on the destination page.
   * Values (separate with | or alternative):
   */
  tags?: string[]
}

interface RenameParamsFrom extends RenameParamsBase {
  /** Title of the page to rename. Cannot be used together with fromid. */
  from: string
}

interface RenameParamsFromId extends RenameParamsBase {
  /** Page ID of the page to rename. Cannot be used together with from. */
  fromid: number
}

interface RenameResponse {
  move: {
    from: string
    to: string
    reason: string
    talkfrom: string
    talkto: string
  }
}

async function renamePage(renameParams: RenameParams): Promise<
  | {
      ok: true
      body: RenameResponse['move']
    }
  | {
      ok: false
      body: string
    }
> {
  return new Promise((resolve) => {
    if (is.dev) console.groupCollapsed('renamePage')
    new mw.Api()
      .postWithToken('csrf', {
        action: 'move',
        ...renameParams
      })
      .done((data) => {
        const { move: renameResponse } = data as RenameResponse
        window.$message.success(
          t('mediawiki.msg-page-renamed', [renameResponse.from, renameResponse.to])
        )
        if (is.dev) {
          console.log(data)
        }
        resolve({ ok: true, body: renameResponse })
      })
      .fail((data: string) => {
        window.$notification.error({
          title: t('general.error'),
          content: t('mediawiki.msg-page-rename-failed', [data]),
          meta: new Date().toLocaleString()
        })
        if (is.dev) {
          console.log(data)
        }
        resolve({ ok: false, body: data })
      })
      .always(() => {
        if (is.dev) {
          console.groupEnd()
        }
      })
  })
}

export default renamePage
