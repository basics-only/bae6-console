<script lang="ts">
  let {
    users,
    noun,
    points,
  }: {
    users: number;
    noun: string;
    points: { topUsersPercent: number; share: number }[];
  } = $props();

  const W = 520;
  const H = 210;
  const LEFT = 40;
  const RIGHT = 10;
  const TOP = 18;
  const BOTTOM = 178;

  const x = (p: number) => LEFT + (p / 100) * (W - LEFT - RIGHT);
  const y = (s: number) => BOTTOM - s * (BOTTOM - TOP);
  const pct = (s: number) => `${Math.round(s * 100)}%`;

  const line = $derived(
    [{ topUsersPercent: 0, share: 0 }, ...points].map((p) => `${x(p.topUsersPercent).toFixed(1)},${y(p.share).toFixed(1)}`),
  );
  const area = $derived(`${x(0)},${BOTTOM} ${line.join(" ")} ${x(100)},${BOTTOM}`);

  let hover = $state<number | null>(null);
  function track(e: MouseEvent) {
    const box = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
    if (box.width === 0) return;
    const at = ((e.clientX - box.left) / box.width) * W;
    const p = Math.round(((at - LEFT) / (W - LEFT - RIGHT)) * 100);
    hover = Math.min(Math.max(p, 1), 100);
  }
  const picked = $derived(hover === null ? null : (points.find((p) => p.topUsersPercent === hover) ?? null));
</script>

{#if users === 0}
  <p class="none">No end-user calls in this range.</p>
{:else}
  <figure>
    <figcaption>
      {#if picked}
        The top <b>{picked.topUsersPercent}%</b> of users use <b>{pct(picked.share)}</b> of the {noun}
      {:else}
        {users} users, heaviest first. Hover to see how much the top percent use.
      {/if}
    </figcaption>
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Share of ${noun} used by the top percent of ${users} users`}
      onmousemove={track}
      onmouseleave={() => (hover = null)}
    >
      {#each [0, 0.5, 1] as t}
        <line class:zero={t === 0} x1={LEFT} x2={W - RIGHT} y1={y(t)} y2={y(t)} />
        <text class="tick" x={LEFT - 5} y={y(t) + 3} text-anchor="end">{pct(t)}</text>
      {/each}
      {#each [0, 50, 100] as p}
        <text class="tick" x={x(p)} y={H - 8} text-anchor={p === 0 ? "start" : p === 100 ? "end" : "middle"}>
          {p}%
        </text>
      {/each}
      <line class="even" x1={x(0)} y1={y(0)} x2={x(100)} y2={y(1)} />
      <polygon points={area} />
      <polyline points={line.join(" ")} />
      {#if picked}
        <line class="guide" x1={x(picked.topUsersPercent)} x2={x(picked.topUsersPercent)} y1={TOP} y2={BOTTOM} />
        <circle cx={x(picked.topUsersPercent)} cy={y(picked.share)} r="3.5" />
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
    max-width: 640px;
  }
  figcaption {
    min-height: 1.4em;
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
  line.even {
    stroke: var(--muted);
    stroke-dasharray: 3 3;
  }
  .tick {
    fill: var(--muted);
    font-size: 9px;
    font-family: var(--mono);
  }
  polygon {
    fill: var(--green);
    opacity: 0.18;
  }
  polyline {
    fill: none;
    stroke: var(--green);
    stroke-width: 1.75;
    stroke-linejoin: round;
  }
  circle {
    fill: var(--green);
  }
  line.guide {
    stroke: var(--green);
    stroke-dasharray: 2 2;
  }
  .none {
    margin: 12px 0;
    color: var(--muted);
  }
</style>
