import { isHttpError } from "@sveltejs/kit";

const MAX_RUN_IDS = 50;
const MAX_RUN_ID_LENGTH = 64;
const WINDOW_MS = 92 * 86_400_000;

type Lookup = (
  path: string,
) => Promise<{ data: { key: string; cost: string }[] }>;

export interface RunSpend {
  spend: Record<string, string> | null;
  spendFailed: boolean;
}

/**
 * Spend per run, keyed by the run's own id. The gateway keeps 93 days of usage per query,
 * so a run older than that has no figure. Null spend when there is no AI gateway or the
 * lookup was refused; the list then renders without the column.
 */
export async function spendFor(
  lookup: Lookup | null,
  prefix: "eval_" | "run_",
  ids: string[],
): Promise<RunSpend> {
  if (!lookup) return { spend: null, spendFailed: false };
  const asked = ids
    .filter((id) => (prefix + id).length <= MAX_RUN_ID_LENGTH)
    .slice(0, MAX_RUN_IDS);
  if (asked.length === 0) return { spend: {}, spendFailed: false };
  const now = Date.now();
  const q = new URLSearchParams({
    groupBy: "run",
    from: new Date(now - WINDOW_MS).toISOString(),
    to: new Date(now).toISOString(),
  });
  for (const id of asked) q.append("runId", prefix + id);
  try {
    const summary = await lookup(`/v1/usage/summary?${q}`);
    return {
      spend: Object.fromEntries(
        summary.data.map((r) => [r.key.slice(prefix.length), r.cost]),
      ),
      spendFailed: false,
    };
  } catch (err) {
    if (isHttpError(err)) return { spend: null, spendFailed: true };
    throw err;
  }
}
