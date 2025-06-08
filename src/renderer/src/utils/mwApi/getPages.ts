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

export { getPagesByCategory };
