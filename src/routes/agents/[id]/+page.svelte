<script lang="ts">
  let { data } = $props();
  const run = $derived(data.run);
</script>

<h1>Agent run {run.id}</h1>
<dl>
  <dt>Model</dt><dd>{run.model}</dd>
  <dt>Status</dt><dd>{run.status}{run.stop ? ` (${run.stop})` : ""}</dd>
  <dt>Submitted by</dt><dd>{run.submitterId}</dd>
  <dt>Attempt</dt><dd>{run.attempt}</dd>
  <dt>Tokens</dt><dd>{run.tokens}</dd>
  <dt>Created</dt><dd>{run.createdAt}</dd>
  <dt>Started</dt><dd>{run.startedAt ?? ""}</dd>
  <dt>Finished</dt><dd>{run.finishedAt ?? ""}</dd>
</dl>

<h2>Result</h2>
{#if run.text}<pre>{run.text}</pre>{:else}<p>No result.</p>{/if}

<h2>Tool calls</h2>
{#if run.receipts.length === 0}
  <p>No tool calls.</p>
{:else}
  <table>
    <thead>
      <tr><th>Step</th><th>Tool</th><th>Outcome</th><th>Duration (ms)</th><th>Input</th><th>Detail</th></tr>
    </thead>
    <tbody>
      {#each run.receipts as r (r.step)}
        <tr>
          <td>{r.step}</td>
          <td>{r.tool}</td>
          <td>{r.outcome}</td>
          <td>{r.durationMs}</td>
          <td><pre>{r.input}{r.truncated ? " …" : ""}</pre></td>
          <td><pre>{r.detail}</pre></td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}

<a href="/agents">All agent runs</a>
