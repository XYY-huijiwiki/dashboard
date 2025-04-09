import renamePage from "@renderer/utils/mwApi/renamePage";
import getPage from "@renderer/utils/mwApi/getPage";
import editPage from "@renderer/utils/mwApi/editPage";
import uploadFile from "@renderer/utils/mwApi/uploadFile";
import deletePage from "@renderer/utils/mwApi/deletePage";
import undeletePage from "@renderer/utils/mwApi/undeletePage";
import type {
  ArvResponse,
  ProcessedArvData,
} from "@renderer/utils/mwApi/types";

/**
 * wiki api base url.
 * use current site api in production
 * use `xyy.huijiwiki.com` api in development
 **/
const url = `${location.origin}/w/api.php`;

export {
  url,
  editPage,
  getPage,
  renamePage,
  uploadFile,
  deletePage,
  undeletePage,
};
export type { ArvResponse, ProcessedArvData };
