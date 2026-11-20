import { fail } from "@sveltejs/kit";
import { callApi, mutate } from "$lib/server/call";
import { approve, revoke } from "$lib/server/mcp";
import { listQuery } from "$lib/server/paging";
import type { Actions, PageServerLoad } from "./$types";

interface Version {
  version: string;
  state: "pending" | "approved" | "revoked";
  scanStatus: string;
  endpoint: string;
  publishedBy: string;
  decidedBy?: string;
}

interface McpServer {
  id: string;
  team: string;
  name: string;
  description?: string;
  versions: Version[];
}

export const load: PageServerLoad = async ({ locals, url }) => {
  const q = listQuery(url.searchParams);
  if ("error" in q) {
    return {
      items: [] as McpServer[],
      nextCursor: null,
      filterError: q.error,
    };
  }
  const page = await callApi<{ items: McpServer[]; nextCursor?: string }>(
    locals,
    `/v1/servers?${q.query}`,
    undefined,
    "mcp",
  );
  return {
    items: page.items,
    nextCursor: page.nextCursor ?? null,
    filterError: null,
  };
};

export const actions: Actions = {
  approve: async ({ locals, request }) => {
    const result = await approve(
      (path, init) => mutate(locals, path, init, "mcp"),
      await request.formData(),
    );
    return result.status === 200 ? result : fail(result.status, result);
  },
  revoke: async ({ locals, request }) => {
    const result = await revoke(
      (path, init) => mutate(locals, path, init, "mcp"),
      await request.formData(),
    );
    return result.status === 200 ? result : fail(result.status, result);
  },
};
