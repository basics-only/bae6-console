import type { ActionResult, Mutator } from "./relationships.js";

const SERVER_ID = /^[a-z0-9][a-z0-9._-]{0,63}$/;
const VERSION = /^[A-Za-z0-9][A-Za-z0-9._+-]{0,63}$/;

const outcome = (
  r: Awaited<ReturnType<Mutator>>,
  done: string,
): ActionResult =>
  r.ok
    ? { status: 200, message: done, auditEventId: r.auditEventId }
    : { status: r.status, error: r.message };

function target(form: FormData): { id: string; version: string } | string {
  const id = String(form.get("server") ?? "").trim();
  const version = String(form.get("version") ?? "").trim();
  if (!SERVER_ID.test(id)) return "Server id is not valid.";
  if (!VERSION.test(version)) return "Version is not valid.";
  return { id, version };
}

// A refusal by the registry is reported as-is: hiding a button is not the enforcement.
// The scan status is always `unscanned`: the console never vouches for a scan it did not run.
export async function approve(
  mutator: Mutator,
  form: FormData,
): Promise<ActionResult> {
  const t = target(form);
  if (typeof t === "string") return { status: 400, error: t };
  return outcome(
    await mutator(`/v1/servers/${encodeURIComponent(t.id)}/approve`, {
      method: "POST",
      body: { version: t.version, scanStatus: "unscanned" },
    }),
    `Approved ${t.id} ${t.version}.`,
  );
}

export async function revoke(
  mutator: Mutator,
  form: FormData,
): Promise<ActionResult> {
  // The page asks first, but a request that skips the page must not skip the question.
  if (form.get("confirm") !== "yes") {
    return { status: 400, error: "Revoking needs confirmation." };
  }
  const t = target(form);
  if (typeof t === "string") return { status: 400, error: t };
  return outcome(
    await mutator(`/v1/servers/${encodeURIComponent(t.id)}/revoke`, {
      method: "POST",
      body: { version: t.version },
    }),
    `Revoked ${t.id} ${t.version}.`,
  );
}
