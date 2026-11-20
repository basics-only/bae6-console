import { callApi } from "./call";
import { serviceUrl } from "./context";

const MAX_RUN_IDS = 50;
const WINDOW_MS = 92 * 86_400_000;

/**
 * Spend per run, keyed by the run's own id. The gateway keeps 93 days of usage per query,
 * so a run older than that has no figure. Null when this console has no AI gateway.
 */
export async function spendByRun(
  locals: Parameters<typeof callApi>[0],
  prefix: "eval_" | "run_",
  ids: string[],
): Promise<Record<string, string> | null> {
  if (!serviceUrl("ai")) return null;
  if (ids.length === 0) return {};
  const now = Date.now();
  const q = new URLSearchParams({
    groupBy: "run",
    from: new Date(now - WINDOW_MS).toISOString(),
    to: new Date(now).toISOString(),
  });
  for (const id of ids.slice(0, MAX_RUN_IDS)) q.append("runId", prefix + id);
  const summary = await callApi<{ data: { key: string; cost: string }[] }>(
    locals,
    `/v1/usage/summary?${q}`,
    undefined,
    "ai",
  );
  return Object.fromEntries(
    summary.data.map((r) => [r.key.slice(prefix.length), r.cost]),
  );
}
