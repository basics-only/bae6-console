<script lang="ts">
  let {
    title,
    headline,
    values,
    days,
    format,
  }: {
    title: string;
    headline: string;
    values: (number | null)[];
    days: string[];
    format: (n: number) => string;
  } = $props();

  const W = 260;
  const H = 104;
  const LEFT = 44;
  const RIGHT = 8;
  const TOP = 14;
  const BOTTOM = 82;

  const known = $derived(values.filter((v): v is number => v !== null));

  // The top of the axis is 1, 2 or 5 times a power of ten, so the tick labels read cleanly.
  const top = $derived.by(() => {
    const max = Math.max(...known, 0);
    if (max <= 0) return 1;
    const unit = 10 ** Math.floor(Math.log10(max));
    return ([1, 2, 5, 10].find((m) => m * unit >= max) ?? 10) * unit;
  });
  const ticks = $derived([0, top / 2, top]);
  const x = (i: number) => LEFT + (i * (W - LEFT - RIGHT)) / Math.max(values.length - 1, 1);
  const y = (v: number) => BOTTOM - (v / top) * (BOTTOM - TOP);
  const last = $derived(values.length - 1);

  let hover = $state<number | null>(null);
  function track(e: MouseEvent) {
    const box = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
    if (box.width === 0) return;
    const at = ((e.clientX - box.left) / box.width) * W;
    const i = Math.round(((at - LEFT) / (W - LEFT - RIGHT)) * last);
    const v = values[Math.min(Math.max(i, 0), last)];
    hover = v === null ? null : Math.min(Math.max(i, 0), last);
  }
  const middle = $derived(Math.floor(last / 2));

  // A missing day breaks the line instead of drawing through it.
  const segments = $derived.by(() => {
    const out: string[][] = [];
    let run: string[] = [];
    values.forEach((v, i) => {
      if (v === null) {
        if (run.length) out.push(run);
        run = [];
      } else {
        run.push(`${x(i).toFixed(1)},${y(v).toFixed(1)}`);
      }
    });
    if (run.length) out.push(run);
    return out;
  });
</script>

<figure>
  <figcaption>
    <span>{title}</span>
    <b>{headline}</b>
  </figcaption>
  {#if known.length === 0}
    <p class="none">No data</p>
  {:else}
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      onmousemove={track}
      onmouseleave={() => (hover = null)}
      aria-label={`${title}, ${days[0]} to ${days[last]}, axis 0 to ${format(top)}`}
    >
      {#each ticks as t}
        <line class:zero={t === 0} x1={LEFT} x2={W - RIGHT} y1={y(t)} y2={y(t)} />
        <text class="tick" x={LEFT - 5} y={y(t) + 3} text-anchor="end">{format(t)}</text>
      {/each}
      <text class="tick" x={x(0)} y={H - 6} text-anchor="start">{days[0]}</text>
      {#if last >= 2}
        <text class="tick" x={x(middle)} y={H - 6} text-anchor="middle">{days[middle]}</text>
      {/if}
      {#if last >= 1}
        <text class="tick" x={x(last)} y={H - 6} text-anchor="end">{days[last]}</text>
      {/if}
      {#each segments as seg}
        {#if seg.length === 1}
          {@const [cx, cy] = seg[0].split(",")}
          <circle {cx} {cy} r="2" />
        {:else}
          <polyline points={seg.join(" ")} />
        {/if}
      {/each}
      {#if hover !== null}
        {@const v = values[hover] as number}
        <line class="guide" x1={x(hover)} x2={x(hover)} y1={TOP} y2={BOTTOM} />
        <circle cx={x(hover)} cy={y(v)} r="3.5" />
        <text class="readout" x={x(hover)} y={TOP - 1} text-anchor={hover > last / 2 ? "end" : "start"}>{days[hover]}  {format(v)}</text>
      {/if}
    </svg>
  {/if}
</figure>

<style>
  figure {
    margin: 0;
    padding: 12px 14px;
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: var(--radius);
  }
  figcaption {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 8px;
  }
  figcaption span {
    color: var(--muted);
  }
  figcaption b {
    font-size: 16px;
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
  .tick {
    fill: var(--muted);
    font-size: 9px;
    font-family: var(--mono);
  }
  polyline {
    fill: none;
    stroke: var(--green);
    stroke-width: 1.75;
    stroke-linejoin: round;
    stroke-linecap: round;
  }
  circle {
    fill: var(--green);
  }
  line.guide {
    stroke: var(--green);
    stroke-dasharray: 2 2;
  }
  .readout {
    fill: var(--text);
    font-size: 10px;
    font-weight: 700;
    font-family: var(--mono);
  }
  .none {
    margin: 12px 0;
    color: var(--muted);
  }
</style>
