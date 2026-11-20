import { callApi } from "$lib/server/call";
import { type Measures, usageQuery } from "$lib/server/usage";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
  const q = usageQuery(url.searchParams);
  if ("error" in q) {
    return {
      days: 30,
      by: "taskType",
      series: [] as ({ day: string } & Measures)[],
      groups: [] as ({ key: string } & Measures)[],
      truncated: false,
      filterError: q.error,
    };
  }
  const range = new URLSearchParams({ from: q.from, to: q.to });
  const [series, summary] = await Promise.all([
    callApi<{ data: ({ day: string } & Measures)[] }>(
      locals,
      `/v1/usage/series?${range}`,
      undefined,
      "ai",
    ),
    callApi<{ data: ({ key: string } & Measures)[]; truncated: boolean }>(
      locals,
      `/v1/usage/summary?${new URLSearchParams({ from: q.from, to: q.to, groupBy: q.by })}`,
      undefined,
      "ai",
    ),
  ]);
  return {
    days: q.days,
    by: q.by,
    series: series.data,
    groups: summary.data,
    truncated: summary.truncated,
    filterError: null,
  };
};
