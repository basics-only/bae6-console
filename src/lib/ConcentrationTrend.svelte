<script lang="ts">
  interface Day {
    month: string;
    users: number;
    top5: number;
    top10: number;
    top20: number;
  }
  let { points, noun }: { points: Day[]; noun: string } = $props();

  const W = 520;
  const H = 210;
  const LEFT = 40;
  const RIGHT = 10;
  const TOP = 18;
  const BOTTOM = 178;

  const lines = [
    { key: "top5", label: "Top 5%", color: "#15803d" },
    { key: "top10", label: "Top 10%", color: "#1d4ed8" },
    { key: "top20", label: "Top 20%", color: "#b45309" },
  ] as const;

  const times = $derived(points.map((p) => Date.parse(p.month)));
  const first = $derived(times[0] ?? 0);
  const span = $derived(Math.max((times.at(-1) ?? 0) - first, 1));
  const x = (t: number) => LEFT + ((t - first) / span) * (W - LEFT - RIGHT);
  const y = (s: number) => BOTTOM - s * (BOTTOM - TOP);
  const pct = (s: number) => `${Math.round(s * 100)}%`;
  const path = (key: (typeof lines)[number]["key"]) =>
    points.map((p, i) => `${x(times[i]).toFixed(1)},${y(p[key]).toFixed(1)}`).join(" ");

  let hover = $state<number | null>(null);
  function track(e: MouseEvent) {
    const box = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
    if (box.width === 0) return;
    const at = ((e.clientX - box.left) / box.width) * W;
    let best = 0;
    for (let i = 1; i < points.length; i++) {
      if (Math.abs(x(times[i]) - at) < Math.abs(x(times[best]) - at)) best = i;
    }
    hover = best;
  }
  const picked = $derived(hover === null ? null : (points[hover] ?? null));
</script>

{#if points.length === 0}
  <p class="none">No end-user calls in this range.</p>
{:else}
  <figure>
    <figcaption>
      {#if picked}
        <b>{picked.month}</b>, {picked.users} users:
        {#each lines as l}
          <span style:color={l.color}>{l.label.toLowerCase()} use <b>{pct(picked[l.key])}</b></span>{" "}
        {/each}
      {:else}
        <span class="legend">
          {#each lines as l}<span style:color={l.color}>{l.label}</span>{" "}{/each}
          of users, share of {noun} per month
        </span>
      {/if}
    </figcaption>
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Share of ${noun} used by the top 5%, 10% and 20% of users each month`}
      onmousemove={track}
      onmouseleave={() => (hover = null)}
    >
      {#each [0, 0.5, 1] as t}
        <line class:zero={t === 0} x1={LEFT} x2={W - RIGHT} y1={y(t)} y2={y(t)} />
        <text class="tick" x={LEFT - 5} y={y(t) + 3} text-anchor="end">{pct(t)}</text>
      {/each}
      <text class="tick" x={x(first)} y={H - 8} text-anchor="start">{points[0].month}</text>
      {#if points.length > 1}
        <text class="tick" x={W - RIGHT} y={H - 8} text-anchor="end">{points.at(-1)?.month}</text>
      {/if}
      {#each lines as l}
        {#if points.length === 1}
          <circle cx={x(first)} cy={y(points[0][l.key])} r="2.5" fill={l.color} />
        {:else}
          <polyline points={path(l.key)} stroke={l.color} />
        {/if}
      {/each}
      {#if hover !== null && picked}
        <line class="guide" x1={x(times[hover])} x2={x(times[hover])} y1={TOP} y2={BOTTOM} />
        {#each lines as l}
          <circle cx={x(times[hover])} cy={y(picked[l.key])} r="3.5" fill={l.color} />
        {/each}
      {/if}
    </svg>
  </figure>
{/if}

<style>
  figure {
    margin: 0;
    padding: 12px 14px;
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: var(--radius);
  }
  figcaption {
    min-height: 2.8em;
    color: var(--muted);
  }
  figcaption b {
    color: var(--text);
  }
  svg {
    display: block;
    width: 100%;
    height: auto;
    margin-top: 6px;
  }
  line {
    stroke: var(--line-soft);
    stroke-width: 1;
  }
  line.zero {
    stroke: var(--muted);
  }
  line.guide {
    stroke: var(--muted);
    stroke-dasharray: 2 2;
  }
  .tick {
    fill: var(--muted);
    font-size: 9px;
    font-family: var(--mono);
  }
  polyline {
    fill: none;
    stroke-width: 1.75;
    stroke-linejoin: round;
    stroke-linecap: round;
  }
  .none {
    margin: 12px 0;
    color: var(--muted);
  }
</style>
