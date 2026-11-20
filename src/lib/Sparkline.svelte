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

  const W = 240;
  const H = 56;
  const PAD = 4;

  const known = $derived(values.filter((v): v is number => v !== null));
  const lo = $derived(Math.min(0, ...known));
  const hi = $derived(Math.max(...known, 1));
  const x = (i: number) => PAD + (i * (W - 2 * PAD)) / Math.max(values.length - 1, 1);
  const y = (v: number) => H - PAD - ((v - lo) / (hi - lo)) * (H - 2 * PAD);

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
  const last = $derived(values.length - 1);
</script>

<figure>
  <figcaption>
    <span>{title}</span>
    <b>{headline}</b>
  </figcaption>
  {#if known.length === 0}
    <p class="none">No data</p>
  {:else}
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${title}, ${days[0]} to ${days[last]}, high ${format(hi)}`}>
      {#each segments as seg}
        {#if seg.length === 1}
          {@const [cx, cy] = seg[0].split(",")}
          <circle {cx} {cy} r="2" />
        {:else}
          <polyline points={seg.join(" ")} />
        {/if}
      {/each}
      {#each values as v, i}
        {#if v !== null}
          <circle class="hit" cx={x(i)} cy={y(v)} r="5"><title>{days[i]}: {format(v)}</title></circle>
        {/if}
      {/each}
    </svg>
    <div class="axis"><span>{days[0]}</span><span>{days[last]}</span></div>
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
  .hit {
    fill: transparent;
  }
  .hit:hover {
    fill: var(--green);
    fill-opacity: 0.25;
  }
  .axis {
    display: flex;
    justify-content: space-between;
    color: var(--muted);
    font-size: 11px;
  }
  .none {
    margin: 12px 0;
    color: var(--muted);
  }
</style>
