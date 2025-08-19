import ky from "ky";
import { url } from "@renderer/utils/mwApi";

async function getPagesByCategory(category: string): Promise<string[]> {
  type CategorymembersResponse = {
    continue?: {
      cmcontinue: string;
      continue: string;
    };
    query: {
      categorymembers: Array<{
        title: string;
        pageid: number;
        ns: number;
      }>;
    };
  };

  const result: string[] = [];
  const params = new URLSearchParams({
    action: "query",
    list: "categorymembers",
    cmtitle: `Category:${category}`,
    cmlimit: "max",
    format: "json",
  });

  while (true) {
    const response = await ky
      .get(`${url}?${params.toString()}`)
      .json<CategorymembersResponse>();
    const pages = response.query.categorymembers;

    if (!pages || pages.length === 0) {
      break;
    }

    result.push(...pages.map((page) => page.title));

    // Check for continuation
    if (!response.continue) {
      break;
    }

    params.set("cmcontinue", response.continue.cmcontinue);
  }

  return result;
}

async function getPagesByKeyword(keyword: string): Promise<string[]> {
  type SearchResponse = {
    continue?: {
      sroffset: number;
      continue: string;
    };
    query: {
      search: Array<{
        title: string;
        pageid: number;
        ns: number;
      }>;
    };
  };

  const result: string[] = [];
  let sroffset = 0;

  while (true) {
    const params = new URLSearchParams({
      action: "query",
      list: "search",
      srsearch: `insource:"${keyword.replace(/"/g, '\\"')}"`,
      srlimit: "500",
      sroffset: sroffset.toString(),
      format: "json",
    });

    const response = await ky
      .get(`${url}?${params.toString()}`)
      .json<SearchResponse>();

    const pages = response.query.search;
    if (!pages || pages.length === 0) {
      break;
    }

    result.push(...pages.map((page) => page.title));

    if (!response.continue) {
      break;
    }
    sroffset = response.continue.sroffset;
  }

  return result;
}

export { getPagesByCategory, getPagesByKeyword };
