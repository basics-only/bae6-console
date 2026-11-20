<script lang="ts">
  import Badge from "$lib/Badge.svelte";
  let { data } = $props();
  const run = $derived(data.run);
</script>

<div class="page-head">
  <h1>Eval run {run.id}</h1>
  <p><a href="/evals">All eval runs</a></p>
</div>

<div class="panel">
  <dl class="facts">
    <dt>Name</dt><dd>{run.name}</dd>
    <dt>Model</dt><dd>{run.model}</dd>
    <dt>Dataset</dt><dd>{run.datasetVersion}</dd>
    <dt>Status</dt><dd><Badge value={run.status} />{run.stop ? ` (${run.stop})` : ""}</dd>
    <dt>Submitted by</dt><dd>{run.submitterId}</dd>
    <dt>Attempt</dt><dd>{run.attempt}</dd>
    <dt>Created</dt><dd>{run.createdAt}</dd>
    <dt>Started</dt><dd>{run.startedAt ?? ""}</dd>
    <dt>Finished</dt><dd>{run.finishedAt ?? ""}</dd>
  </dl>
</div>

<h2>Summary</h2>
{#if run.summary}
  <p>{run.summary.cases} cases, {run.summary.failures} failures.</p>
  <div class="panel">
    <table>
      <thead><tr><th>Scorer</th><th class="num">Mean</th></tr></thead>
      <tbody>
        {#each Object.entries(run.summary.mean) as [scorer, mean] (scorer)}
          <tr><td>{scorer}</td><td class="num">{mean}</td></tr>
        {/each}
      </tbody>
    </table>
  </div>
{:else}
  <div class="panel"><p class="empty">No summary yet.</p></div>
{/if}
