import type { Mutator } from "./relationships.js";

export const GROUPS = ["taskType", "domain", "model", "organization"] as const;
export type Group = (typeof GROUPS)[number];

export const RANGES = [7, 30, 90] as const;
const DAY_MS = 86_400_000;

export interface Measures {
  requests: number;
  inputTokens: number;
  outputTokens: number;
  cost: string;
  latencyMs: { p50: number | null; p95: number | null };
  firstTokenMs: { p50: number | null; p95: number | null };
  activeUsers: { day: number; week: number; month: number };
}

/** The dashboard's query, or an error for a value the page did not offer. */
export function usageQuery(
  params: URLSearchParams,
  now = new Date(),
): { days: number; by: Group; from: string; to: string } | { error: string } {
  const days = Number(params.get("days") ?? 30);
  const by = params.get("by") ?? "taskType";
  if (!(RANGES as readonly number[]).includes(days)) {
    return { error: `days is one of ${RANGES.join(", ")}.` };
  }
  if (!(GROUPS as readonly string[]).includes(by)) {
    return { error: `by is one of ${GROUPS.join(", ")}.` };
  }
  return {
    days,
    by: by as Group,
    from: new Date(now.getTime() - days * DAY_MS).toISOString(),
    to: now.toISOString(),
  };
}

export const TAG_ID = /^[a-z0-9][a-z0-9-]{0,47}$/;
export const TAG_KINDS = { "task-types": "Task type", domains: "Domain" };
export type TagKind = keyof typeof TAG_KINDS;

export type TagResult =
  | { status: 200; message: string }
  | { status: number; error: string };

/**
 * Creates, renames or removes a tag. The page checks the shape so a mistake is shown next
 * to the input; whether the caller may write tags is the gateway's call.
 */
export async function changeTag(
  mutator: Mutator,
  kind: TagKind,
  form: FormData,
): Promise<TagResult> {
  const id = String(form.get("id") ?? "");
  if (!TAG_ID.test(id) || id === "untagged") {
    return {
      status: 400,
      error:
        "The id is lowercase letters, digits and hyphens, up to 48 characters.",
    };
  }
  const path = `/v1/${kind}/${id}`;
  if (form.get("remove") === "yes") {
    const r = await mutator(path, { method: "DELETE" });
    return r.ok
      ? { status: 200, message: `Removed ${id}.` }
      : { status: r.status, error: r.message };
  }
  const name = String(form.get("name") ?? "").trim();
  if (name.length < 1 || name.length > 64) {
    return { status: 400, error: "The name is 1 to 64 characters." };
  }
  const r = await mutator(path, { method: "PUT", body: { name } });
  return r.ok
    ? { status: 200, message: `Saved ${id}.` }
    : { status: r.status, error: r.message };
}
