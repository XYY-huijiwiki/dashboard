import { is } from '@renderer/utils'

/**
 * Parameters for the undelete operation.
 * see alse {@link https://www.mediawiki.org/wiki/API:Undelete}
 */
interface UndeleteParams {
  /** Title of the page to undelete. */
  title: string

  /** Reason for restoring. */
  reason?: string

  /** Change tags to apply to the entry in the deletion log. */
  tags?: string[]

  /** Timestamps of the revisions to undelete. */
  timestamps?: string[]

  /** IDs of the file revisions to restore. */
  fileids?: number[]

  /** Undelete all revisions of the associated talk page, if any. */
  undeletetalk?: boolean

  /** Unconditionally add or remove the page from the current user's watchlist. */
  watchlist?: 'nochange' | 'preferences' | 'unwatch' | 'watch'

  /** Watchlist expiry timestamp. */
  watchlistexpiry?: string
}

/**
 * Response from an successful undelete operation.
 */
interface UndeleteResponse {
  undelete: {
    fileversions: number
    reason: string
    revisions: number
    title: string
  }
}

async function undeletePage(
  undeleteParams: UndeleteParams
): Promise<{ ok: true; body: UndeleteResponse['undelete'] } | { ok: false; body: string }> {
  return new Promise((resolve) => {
    if (is.dev) console.groupCollapsed('undeletePage')
    new mw.Api()
      .postWithToken('csrf', {
        action: 'undelete',
        ...undeleteParams
      })
      .done((data) => {
        const { undelete: undeleteResponse } = data as UndeleteResponse
        if (is.dev) console.log(undeleteResponse)
        resolve({ ok: true, body: undeleteResponse })
      })
      .fail((data: string) => {
        if (is.dev) console.log(data)
        resolve({ ok: false, body: data })
      })
      .always(() => {
        if (is.dev) console.groupEnd()
      })
  })
}

export default undeletePage
