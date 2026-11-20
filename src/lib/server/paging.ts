export const RUN_STATUSES = [
  "queued",
  "running",
  "finished",
  "cancelled",
] as const;

const CURSOR = /^[A-Za-z0-9_-]{1,200}$/;
const PAGE_SIZE = "50";

/**
 * The API query for a paged list. The cursor and status are checked here because they
 * are put into an API path; a bad one is reported instead of becoming an API 400.
 */
export function listQuery(
  params: URLSearchParams,
  statuses?: readonly string[],
):
  | { status: string; cursor: string; query: URLSearchParams }
  | { error: string } {
  const status = params.get("status")?.trim() ?? "";
  const cursor = params.get("cursor") ?? "";
  if (status && !statuses?.includes(status)) {
    return { error: `status is one of ${(statuses ?? []).join(", ")}.` };
  }
  if (cursor && !CURSOR.test(cursor)) {
    return { error: "cursor is not one this page returned." };
  }
  const query = new URLSearchParams({ limit: PAGE_SIZE });
  if (status) query.set("status", status);
  if (cursor) query.set("cursor", cursor);
  return { status, cursor, query };
}

/** An id from the URL, checked before it is put in an API path. */
export const SAFE_ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;
