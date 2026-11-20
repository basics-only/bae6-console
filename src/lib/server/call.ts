import { error, redirect } from "@sveltejs/kit";
import { ApiError, apiJson, apiMutation } from "./api";
import { type Service, serviceUrl } from "./context";
import type { Session } from "./session";

function baseOf(service: Service): string {
  const url = serviceUrl(service);
  // A service this console is not set up for has no pages.
  if (!url) error(404, "Not found.");
  return url;
}

/**
 * Calls a service as the logged-in user. A rejected token sends the user back to login;
 * any other API refusal (403, 404, 409 ...) is shown with its own status.
 */
export async function callApi<T>(
  locals: { session: Session | null },
  path: string,
  init?: { method?: string; body?: unknown },
  service: Service = "authz",
): Promise<T> {
  if (!locals.session) redirect(303, "/login");
  const base = baseOf(service);
  try {
    return await apiJson<T>(base, locals.session, path, init);
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 401) redirect(303, "/login");
      error(err.status, err.message);
    }
    throw err;
  }
}

/**
 * Makes a change as the logged-in user. A refusal is returned, not thrown, so the form
 * can show it next to the input; the API decides, the console only reports.
 */
export async function mutate(
  locals: { session: Session | null },
  path: string,
  init: { method: string; body?: unknown },
  service: Service = "authz",
): Promise<
  | { ok: true; auditEventId: string | null; body: unknown }
  | { ok: false; status: number; message: string }
> {
  if (!locals.session) redirect(303, "/login");
  const base = baseOf(service);
  try {
    return {
      ok: true,
      ...(await apiMutation(base, locals.session, path, init)),
    };
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 401) redirect(303, "/login");
      return { ok: false, status: err.status, message: err.message };
    }
    throw err;
  }
}
