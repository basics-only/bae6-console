<script lang="ts">
  let { data } = $props();
  const run = $derived(data.run);
</script>

<h1>Eval run {run.id}</h1>
<dl>
  <dt>Name</dt><dd>{run.name}</dd>
  <dt>Model</dt><dd>{run.model}</dd>
  <dt>Dataset</dt><dd>{run.datasetVersion}</dd>
  <dt>Status</dt><dd>{run.status}{run.stop ? ` (${run.stop})` : ""}</dd>
  <dt>Submitted by</dt><dd>{run.submitterId}</dd>
  <dt>Attempt</dt><dd>{run.attempt}</dd>
  <dt>Created</dt><dd>{run.createdAt}</dd>
  <dt>Started</dt><dd>{run.startedAt ?? ""}</dd>
  <dt>Finished</dt><dd>{run.finishedAt ?? ""}</dd>
</dl>

{#if run.summary}
  <h2>Summary</h2>
  <p>{run.summary.cases} cases, {run.summary.failures} failures.</p>
  <table>
    <thead><tr><th>Scorer</th><th>Mean</th></tr></thead>
    <tbody>
      {#each Object.entries(run.summary.mean) as [scorer, mean] (scorer)}
        <tr><td>{scorer}</td><td>{mean}</td></tr>
      {/each}
    </tbody>
  </table>
{:else}
  <p>No summary yet.</p>
{/if}

<a href="/evals">All eval runs</a>
