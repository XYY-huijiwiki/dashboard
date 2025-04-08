import { is } from '@renderer/utils'

/**
 * Possible errors that can occur during the rename operation.
 * @see {@link https://www.mediawiki.org/wiki/Special:MyLanguage/API:Move}
 */
type RenameErrorType =
  | 'nofrom' // The from parameter must be set.
  | 'noto' // The to parameter must be set.
  | 'notoken' // The token parameter must be set.
  | 'cantmove-anon' // Anonymous users can't move pages.
  | 'cantmove' // You don't have permission to move this page.
  | 'cantmovefile' // You don't have permission to move this file.
  | 'selfmove' // Can't move a page to itself.
  | 'immobilenamespace' // You tried to move pages from or to a namespace that is protected from moving.
  | 'articleexists' // The destination article already exists.
  | 'redirectexists' // The destination is a redirect, but is not a single-revision redirect to the source article.
  | 'protectedpage' // You don't have permission to perform this move.
  | 'protectedtitle' // The destination article has been protected from creation.
  | 'nonfilenamespace' // Cannot move file to non-file namespace.
  | 'filetypemismatch' // The new file extension does not match its type.
  | 'mustbeposted' // The move module requires a POST request.
  | string // Other errors

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
      body: RenameErrorType
    }
> {
  return new Promise((resolve) => {
    if (is.dev) console.groupCollapsed('renamePage')
    new mw.Api()
      .postWithToken('csrf', {
        action: 'move',
        ...renameParams,
      })
      .done((data) => {
        const { move: renameResponse } = data as RenameResponse
        if (is.dev) console.log(data)
        resolve({ ok: true, body: renameResponse })
      })
      .fail((data: string) => {
        if (is.dev) console.log(data)
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
