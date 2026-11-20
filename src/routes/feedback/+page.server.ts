import { callApi } from "$lib/server/call";
import { listQuery } from "$lib/server/paging";
import type { PageServerLoad } from "./$types";

interface Feedback {
  requestId: string;
  submitterId: string;
  model: string;
  verdict: "positive" | "negative";
  label: string | null;
  comment: string | null;
  updatedAt: string;
}

export const load: PageServerLoad = async ({ locals, url }) => {
  const q = listQuery(url.searchParams);
  if ("error" in q) {
    return { items: [] as Feedback[], nextCursor: null, filterError: q.error };
  }
  const page = await callApi<{ data: Feedback[]; nextCursor: string | null }>(
    locals,
    `/v1/feedback?${q.query}`,
    undefined,
    "ai",
  );
  return { items: page.data, nextCursor: page.nextCursor, filterError: null };
};
