import { callApi } from "$lib/server/call";
import { listQuery, RUN_STATUSES } from "$lib/server/paging";
import type { PageServerLoad } from "./$types";

interface AgentRun {
  id: string;
  status: string;
  model: string;
  submitterId: string;
  createdAt: string;
  stop: string | null;
  tokens: number;
}

export const load: PageServerLoad = async ({ locals, url }) => {
  const q = listQuery(url.searchParams, RUN_STATUSES);
  if ("error" in q) {
    return {
      status: "",
      items: [] as AgentRun[],
      nextCursor: null,
      filterError: q.error,
    };
  }
  const page = await callApi<{ data: AgentRun[]; nextCursor: string | null }>(
    locals,
    `/v1/agent-runs?${q.query}`,
    undefined,
    "agents",
  );
  return {
    status: q.status,
    items: page.data,
    nextCursor: page.nextCursor,
    filterError: null,
  };
};
