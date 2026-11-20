import { error } from "@sveltejs/kit";
import { callApi } from "$lib/server/call";
import { SAFE_ID } from "$lib/server/paging";
import type { PageServerLoad } from "./$types";

interface Receipt {
  step: number;
  tool: string;
  input: string;
  outcome: string;
  detail: string;
  truncated: boolean;
  durationMs: number;
}

interface AgentRun {
  id: string;
  status: string;
  model: string;
  submitterId: string;
  attempt: number;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  stop: string | null;
  text: string | null;
  tokens: number;
  receipts: Receipt[];
}

export const load: PageServerLoad = async ({ locals, params }) => {
  if (!SAFE_ID.test(params.id)) error(404, "Agent run not found.");
  return {
    run: await callApi<AgentRun>(
      locals,
      `/v1/agent-runs/${params.id}`,
      undefined,
      "agents",
    ),
  };
};
