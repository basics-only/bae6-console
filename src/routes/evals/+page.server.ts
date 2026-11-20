import { callApi } from "$lib/server/call";
import { listQuery, RUN_STATUSES } from "$lib/server/paging";
import type { PageServerLoad } from "./$types";

interface EvalRun {
  id: string;
  status: string;
  model: string;
  name: string;
  datasetVersion: string;
  caseCount: number;
  createdAt: string;
  summary: { cases: number; failures: number } | null;
}

export const load: PageServerLoad = async ({ locals, url }) => {
  const q = listQuery(url.searchParams, RUN_STATUSES);
  if ("error" in q) {
    return {
      status: "",
      items: [] as EvalRun[],
      nextCursor: null,
      filterError: q.error,
    };
  }
  const page = await callApi<{ data: EvalRun[]; nextCursor: string | null }>(
    locals,
    `/v1/eval-runs?${q.query}`,
    undefined,
    "evals",
  );
  return {
    status: q.status,
    items: page.data,
    nextCursor: page.nextCursor,
    filterError: null,
  };
};
