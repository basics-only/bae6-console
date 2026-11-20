<script lang="ts">
  import { compact, usd } from "$lib/format";
  import Concentration from "$lib/Concentration.svelte";
  import Sparkline from "$lib/Sparkline.svelte";
  let { data } = $props();

  const ranges = [7, 30, 90];
  const groups = [
    ["taskType", "Task type"],
    ["domain", "Domain"],
    ["model", "Model"],
    ["organization", "Organization"],
  ];
  type Day = (typeof data.series)[number];
  const tokens = (m: { inputTokens: number; outputTokens: number }) => m.inputTokens + m.outputTokens;
  const ms = (v: number | null) => (v === null ? "" : `${compact(v)} ms`);
  const msOf = (v: number) => `${compact(v)} ms`;

  const totals = $derived({
    requests: data.series.reduce((n: number, d: Day) => n + d.requests, 0),
    tokens: data.series.reduce((n: number, d: Day) => n + tokens(d), 0),
    cost: data.series.reduce((n: number, d: Day) => n + Number(d.cost), 0),
  });
  const latest = $derived<Day | undefined>(data.series.at(-1));
  const active = $derived(latest?.activeUsers ?? { day: 0, week: 0, month: 0 });
  const days = $derived(data.series.map((d: Day) => d.day));

  const plots = $derived([
    { title: "Requests", headline: compact(totals.requests), values: data.series.map((d: Day) => d.requests), format: compact },
    { title: "Tokens", headline: compact(totals.tokens), values: data.series.map(tokens), format: compact },
    { title: "Spend", headline: usd(totals.cost), values: data.series.map((d: Day) => Number(d.cost)), format: usd },
    { title: "Daily active users", headline: compact(active.day), values: data.series.map((d: Day) => d.activeUsers.day), format: compact },
    { title: "Latency p50", headline: ms(latest?.latencyMs.p50 ?? null), values: data.series.map((d: Day) => d.latencyMs.p50), format: msOf },
    { title: "Latency p95", headline: ms(latest?.latencyMs.p95 ?? null), values: data.series.map((d: Day) => d.latencyMs.p95), format: msOf },
    { title: "First token p50", headline: ms(latest?.firstTokenMs.p50 ?? null), values: data.series.map((d: Day) => d.firstTokenMs.p50), format: msOf },
    { title: "First token p95", headline: ms(latest?.firstTokenMs.p95 ?? null), values: data.series.map((d: Day) => d.firstTokenMs.p95), format: msOf },
  ]);
</script>

<div class="page-head">
  <h1>Usage</h1>
  <p>Active users, spend and latency across AI calls. Totals are for the range; latency is the latest day.</p>
</div>

<div class="pinned">
  <form method="GET" class="filters">
    <select name="days" aria-label="Range">
      {#each ranges as d}<option value={d} selected={d === data.days}>Last {d} days</option>{/each}
    </select>
    <select name="by" aria-label="Break down by">
      {#each groups as [value, label]}<option {value} selected={value === data.by}>By {label.toLowerCase()}</option>{/each}
    </select>
    <select name="measure" aria-label="Distribution of">
      <option value="tokens" selected={data.measure === "tokens"}>Users by tokens</option>
      <option value="cost" selected={data.measure === "cost"}>Users by spend</option>
    </select>
    <button type="submit">Show</button>
  </form>
  {#if data.filterError}<p role="alert">{data.filterError}</p>{/if}

  <div class="tiles" aria-label="Totals">
    <div><b>{compact(active.day)}</b><span>Daily active users</span></div>
    <div><b>{compact(active.week)}</b><span>Weekly active users</span></div>
    <div><b>{compact(active.month)}</b><span>Monthly active users</span></div>
    <div><b>{compact(totals.tokens)}</b><span>Tokens</span></div>
    <div><b>{usd(totals.cost)}</b><span>Spend</span></div>
    <div><b>{compact(totals.requests)}</b><span>Requests</span></div>
  </div>
</div>

<h2>Trends</h2>
{#if data.series.length === 0}
  <div class="panel"><p class="empty">No usage in this range.</p></div>
{:else}
  <div class="plots">
    {#each plots as p (p.title)}
      <Sparkline title={p.title} headline={p.headline} values={p.values} {days} format={p.format} />
    {/each}
  </div>
{/if}

<h2>Concentration across users</h2>
<Concentration
  users={data.distribution.users}
  noun={data.measure === "cost" ? "spend" : "tokens"}
  points={data.distribution.data}
/>

<h2>By {groups.find(([v]) => v === data.by)?.[1].toLowerCase()}</h2>
<div class="panel">
  {#if data.groups.length === 0}
    <p class="empty">No usage in this range.</p>
  {:else}
    <table>
      <thead>
        <tr>
          <th>Group</th><th class="num">Requests</th><th class="num">Tokens</th><th class="num">Spend</th>
          <th class="num">p50</th><th class="num">p95</th><th class="num">First token p50</th><th class="num">First token p95</th>
          <th class="num">DAU</th><th class="num">WAU</th><th class="num">MAU</th>
        </tr>
      </thead>
      <tbody>
        {#each data.groups as g (g.key)}
          <tr>
            <td>{g.key}</td>
            <td class="num">{compact(g.requests)}</td>
            <td class="num">{compact(tokens(g))}</td>
            <td class="num">{usd(g.cost)}</td>
            <td class="num">{ms(g.latencyMs.p50)}</td>
            <td class="num">{ms(g.latencyMs.p95)}</td>
            <td class="num">{ms(g.firstTokenMs.p50)}</td>
            <td class="num">{ms(g.firstTokenMs.p95)}</td>
            <td class="num">{compact(g.activeUsers.day)}</td>
            <td class="num">{compact(g.activeUsers.week)}</td>
            <td class="num">{compact(g.activeUsers.month)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>
{#if data.truncated}<p role="status">Showing the 100 largest groups.</p>{/if}

<style>
  .pinned {
    position: sticky;
    top: 0;
    z-index: 5;
    margin: 16px -36px 0;
    padding: 12px 36px;
    border-top: 1px solid var(--line);
    background: var(--canvas);
    border-bottom: 1px solid var(--line);
  }
  .pinned > * + * {
    margin-top: 12px;
  }
  .tiles {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
    gap: 1rem;
  }
  .tiles div {
    display: flex;
    flex-direction: column;
  }
  .tiles b {
    font-size: 1.5rem;
  }
  .plots {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 12px;
  }
</style>
