import { error } from "@sveltejs/kit";
import { callApi } from "$lib/server/call";
import { SAFE_ID } from "$lib/server/paging";
import type { PageServerLoad } from "./$types";

interface EvalRun {
  id: string;
  status: string;
  model: string;
  name: string;
  datasetVersion: string;
  caseCount: number;
  scorers: string[];
  submitterId: string;
  attempt: number;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  stop: string | null;
  summary: {
    cases: number;
    failures: number;
    mean: Record<string, number>;
  } | null;
}

export const load: PageServerLoad = async ({ locals, params }) => {
  if (!SAFE_ID.test(params.id)) error(404, "Eval run not found.");
  return {
    run: await callApi<EvalRun>(
      locals,
      `/v1/eval-runs/${params.id}`,
      undefined,
      "evals",
    ),
  };
};
