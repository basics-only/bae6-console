<script lang="ts">
  import { compact, usd } from "$lib/format";
  let { data } = $props();

  const ranges = [7, 30, 90];
  const groups = [
    ["taskType", "Task type"],
    ["domain", "Domain"],
    ["model", "Model"],
    ["organization", "Organization"],
  ];
  const tokens = (m: { inputTokens: number; outputTokens: number }) => m.inputTokens + m.outputTokens;
  const ms = (v: number | null) => (v === null ? "" : `${compact(v)} ms`);

  const totals = $derived({
    requests: data.series.reduce((n: number, d: { requests: number }) => n + d.requests, 0),
    tokens: data.series.reduce((n: number, d: { inputTokens: number; outputTokens: number }) => n + tokens(d), 0),
    cost: data.series.reduce((n: number, d: { cost: string }) => n + Number(d.cost), 0),
  });
  const latest = $derived(data.series.at(-1)?.activeUsers ?? { day: 0, week: 0, month: 0 });
</script>

<div class="page-head">
  <h1>Usage</h1>
  <p>Active users, spend and latency across AI calls.</p>
</div>

<form method="GET" class="filters">
  <select name="days" aria-label="Range">
    {#each ranges as d}<option value={d} selected={d === data.days}>Last {d} days</option>{/each}
  </select>
  <select name="by" aria-label="Break down by">
    {#each groups as [value, label]}<option {value} selected={value === data.by}>By {label.toLowerCase()}</option>{/each}
  </select>
  <button type="submit">Show</button>
</form>
{#if data.filterError}<p role="alert">{data.filterError}</p>{/if}

<div class="tiles" aria-label="Totals">
  <div><b>{compact(latest.day)}</b><span>Daily active users</span></div>
  <div><b>{compact(latest.week)}</b><span>Weekly active users</span></div>
  <div><b>{compact(latest.month)}</b><span>Monthly active users</span></div>
  <div><b>{compact(totals.tokens)}</b><span>Tokens</span></div>
  <div><b>{usd(totals.cost)}</b><span>Spend</span></div>
  <div><b>{compact(totals.requests)}</b><span>Requests</span></div>
</div>

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

<h2>By day</h2>
<div class="panel">
  {#if data.series.length === 0}
    <p class="empty">No usage in this range.</p>
  {:else}
    <table>
      <thead>
        <tr><th>Day</th><th class="num">Requests</th><th class="num">Tokens</th><th class="num">Spend</th><th class="num">p50</th><th class="num">p95</th><th class="num">DAU</th></tr>
      </thead>
      <tbody>
        {#each data.series as d (d.day)}
          <tr>
            <td>{d.day}</td>
            <td class="num">{compact(d.requests)}</td>
            <td class="num">{compact(tokens(d))}</td>
            <td class="num">{usd(d.cost)}</td>
            <td class="num">{ms(d.latencyMs.p50)}</td>
            <td class="num">{ms(d.latencyMs.p95)}</td>
            <td class="num">{compact(d.activeUsers.day)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>

<style>
  .tiles {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
    gap: 1rem;
    margin: 1rem 0 1.5rem;
  }
  .tiles div {
    display: flex;
    flex-direction: column;
  }
  .tiles b {
    font-size: 1.75rem;
  }
</style>
