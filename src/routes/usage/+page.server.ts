import { callApi } from "$lib/server/call";
import { type Measures, usageQuery } from "$lib/server/usage";
import type { PageServerLoad } from "./$types";

export interface Distribution {
  users: number;
  total: string;
  data: { topUsersPercent: number; share: number }[];
}

export interface ConcentrationDay {
  month: string;
  users: number;
  top5: number;
  top10: number;
  top20: number;
}

export const load: PageServerLoad = async ({ locals, url }) => {
  const q = usageQuery(url.searchParams);
  const measure =
    url.searchParams.get("measure") === "cost" ? "cost" : "tokens";
  if ("error" in q) {
    return {
      days: 30,
      by: "taskType",
      measure,
      series: [] as ({ day: string } & Measures)[],
      groups: [] as ({ key: string } & Measures)[],
      distribution: { users: 0, total: "0", data: [] } as Distribution,
      concentration: [] as ConcentrationDay[],
      truncated: false,
      filterError: q.error,
    };
  }
  const range = new URLSearchParams({ from: q.from, to: q.to });
  const [series, summary, distribution, concentration] = await Promise.all([
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
    callApi<Distribution>(
      locals,
      `/v1/usage/distribution?${new URLSearchParams({ from: q.from, to: q.to, measure })}`,
      undefined,
      "ai",
    ),
    callApi<{ data: ConcentrationDay[] }>(
      locals,
      `/v1/usage/concentration?${new URLSearchParams({ from: q.from, to: q.to, measure })}`,
      undefined,
      "ai",
    ),
  ]);
  return {
    days: q.days,
    by: q.by,
    measure,
    series: series.data,
    groups: summary.data,
    distribution: {
      users: distribution.users,
      total: distribution.total,
      data: distribution.data,
    },
    concentration: concentration.data,
    truncated: summary.truncated,
    filterError: null,
  };
};
