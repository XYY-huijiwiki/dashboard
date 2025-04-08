import { is } from '@renderer/utils'

interface EditResponse {
  edit: {
    result: string
    pageid: number
    title: string
    contentmodel: string
    oldrevid: number
    newrevid: number
    newtimestamp: string
  }
}

type EditErrorResponse =
  | 'notitle' // The title parameter must be set.
  | 'missingparam' //	At least one of the parameters text, appendtext and undo is required.
  | 'notoken' //	The token parameter must be set.
  | 'invalidsection' //	The section parameter must be a valid section ID or new.
  | 'protectedpage' //	This page has been protected to prevent editing or other actions.
  | 'cantcreate' //	You do not have permission to create new pages.
  | 'cantcreate-anon' //	Anonymous users can't create new pages
  | 'articleexists' //	The page you tried to create has been created already.
  | 'noimageredirect' //-anon	Anonymous users can't create image redirects.
  | 'noimageredirect' //	You don't have permission to create image redirects.
  | 'spamdetected' //	Your edit was refused because it contained a spam fragment: Wikitext.
  | 'abusefilter-warning' //	This action has been automatically identified as harmful.
  | 'abusefilter-disallowed' //	This action has been automatically identified as harmful, and therefore disallowed.
  | 'contenttoobig' //	⧼Apierror-contenttoobig⧽ Where bytes is the value of $wgMaxArticleSize.
  | 'noedit-anon' //	Anonymous users can't edit pages.
  | 'noedit' //	You don't have permission to edit pages.
  | 'pagedeleted' //	The page has been deleted since you fetched its timestamp.
  | 'emptypage' //	Creating new, empty pages is not allowed.
  | 'emptynewsection' //	Creating empty new sections is not possible.
  | 'editconflict' //	Edit conflict.
  | 'revwrongpage' //	rrevid is not a revision of pagename. Thrown if an invalid revid is given for undo or undoafter
  | 'undofailure' //	The edit could not be undone due to conflicting intermediate edits.
  | 'missingtitle' //	The page you specified doesn't exist. (see above nocreate parameter)
  | 'mustbeposted' //	The edit module requires a POST request.
  | 'readapidenied' //	You need read permission to use this module.
  | 'writeapidenied' //	You're not allowed to edit this wiki through the API.
  | 'noapiwrite' //	Editing of this wiki through the API is disabled.
  | 'badtoken' //	Invalid CSRF token.
  | 'missingparam' //	The title, pageid parameter must be set.
  | 'invalidparammix' //	The parameters title, pageid can not be used together.
  | 'invalidtitle' //	Bad title "title".
  | 'invalid-content-data' //	Invalid content data. Occurs when trying to edit a JSON page with non-conforming data, or while trying to edit a MassMessageListContent page
  | 'nosuchpageid' //	There is no page with ID pageid.
  | 'pagecannotexist' //	Namespace doesn't allow actual pages.
  | 'nosuchrevid' //	There is no revision with ID undo.
  | 'nosuchrevid' //	There is no revision with ID undoafter.
  | 'badmd5' //	The supplied MD5 hash was incorrect.
  | 'hookaborted' //	The modification you tried to make was aborted by an extension.
  | 'parseerror' //	Content serialization failed: parseerror
  | 'summaryrequired' //	⧼apierror-summaryrequired⧽
  | 'blocked' //	You have been blocked from editing.
  | 'ratelimited' //	You've exceeded your rate limit. Please wait some time and try again.
  | 'unknownerror' //	Unknown error: "retval".
  | 'nosuchsection' //	There is no section $1.
  | 'sectionsnotsupported' //	Sections are not supported for content model $1.
  | 'editnotsupported' //	Editing of this type of page is not supported using the text based edit API.
  | 'appendnotsupported' //	Can't append to pages using content model $1.
  | 'redirect-appendonly' //	You have attempted to edit using the redirect-following mode, which must be used in conjunction with section=new, prependtext, or appendtext.
  | 'edit-invalidredirect' //	Cannot edit $1 while following redirects, as target $2 is not valid.
  | 'badformat' //	The requested format $1 is not supported for content model $2 used by $3.
  | 'customcssprotected' //	You do not have permission to edit this CSS page because it contains another user's personal settings.
  | 'customjsprotected' //	You do not have permission to edit this JavaScript page because it contains another user's personal settings.
  | 'taggingnotallowed' //	You don't have permission to set change tags
  | 'badtags' //	The tag "Tag" is not allowed to be manually applied. The following tags are not allowed to be manually applied: Tag1, Tag2
  | 'tpt-target-page' //	This page cannot be updated manually. This page is a translation of the page $1 and the translation can be updated using [$2 the translation tool]. When using Extension:Translate, editing of a translated subpage is not allowed.
  | string // Other error

/**
 * Edits a MediaWiki page with the given parameters.
 * @async
 * @param {Object} editParams - The parameters for the edit.
 * @param {string} editParams.title - Title of the page to edit. Cannot be used together with `pageid`.
 * @param {number} [editParams.pageid] - Page ID of the page to edit. Cannot be used together with `title`.
 * @param {number|string} [editParams.section] - Section identifier. `0` for the top section, `new` for a new section. Often a positive integer, but can also be non-numeric.
 * @param {string} [editParams.sectiontitle] - The title for a new section when using section=new.
 * @param {string} editParams.text - Page content.
 * @param {string} [editParams.summary] - Edit summary. When this parameter is not provided or empty, an edit summary may be generated automatically. When using section=new and sectiontitle is not provided, the value of this parameter is used for the section title instead, and an edit summary is generated automatically.
 * @param {string} [editParams.tags] - Change tags to apply to the revision. Values (separate with | or alternative): convenient-discussions, possible vandalism, repeating characters
 * @param {boolean} [editParams.minor] - Mark this edit as a minor edit.
 * @param {boolean} [editParams.notminor] - Do not mark this edit as a minor edit even if the "Mark all edits minor by default" user preference is set.
 * @param {boolean} [editParams.bot] - Mark this edit as a bot edit. Default value depends on if the user groups include bot.
 * @param {boolean} [editParams.createonly] - True for creating the page only if it doesn't exist.
 * @returns {Promise<EditResponse>} A promise that resolves with the edit response.
 */
async function editPage(editParams: {
  title: string
  pageid?: number
  section?: number | 'new'
  sectiontitle?: string
  text: string
  summary?: string
  tags?: string
  minor?: boolean
  notminor?: boolean
  bot?: boolean
  createonly?: boolean
}): Promise<
  | {
      ok: true
      body: EditResponse['edit']
    }
  | {
      ok: false
      body: EditErrorResponse
    }
> {
  // check if the user is bot when bot is not specified
  if (
    editParams.bot === undefined &&
    mw.config.get('wgUserGroups')?.includes('bot')
  ) {
    editParams.bot = true
  }
  return new Promise((resolve) => {
    new mw.Api()
      .postWithToken('csrf', {
        action: 'edit',
        ...editParams,
      })
      .done((data) => {
        const { edit: editResponse } = data as EditResponse
        if (is.dev) console.log(data)
        resolve({
          ok: true,
          body: editResponse,
        })
      })
      .fail((data) => {
        if (is.dev) console.log(data)
        resolve({
          ok: false,
          body: data,
        })
      })
  })
}

export default editPage
