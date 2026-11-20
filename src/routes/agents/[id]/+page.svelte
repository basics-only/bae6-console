<script lang="ts">
  import Badge from "$lib/Badge.svelte";
  import { compact } from "$lib/format";
  let { data } = $props();
  const run = $derived(data.run);
</script>

<div class="page-head">
  <h1>Agent run {run.id}</h1>
  <p><a href="/agents">All agent runs</a></p>
</div>

<div class="panel">
  <dl class="facts">
    <dt>Model</dt><dd>{run.model}</dd>
    <dt>Status</dt><dd><Badge value={run.status} />{run.stop ? ` (${run.stop})` : ""}</dd>
    <dt>Submitted by</dt><dd>{run.submitterId}</dd>
    <dt>Attempt</dt><dd>{run.attempt}</dd>
    <dt>Tokens</dt><dd>{compact(run.tokens)}</dd>
    <dt>Created</dt><dd>{run.createdAt}</dd>
    <dt>Started</dt><dd>{run.startedAt ?? ""}</dd>
    <dt>Finished</dt><dd>{run.finishedAt ?? ""}</dd>
  </dl>
</div>

<h2>Result</h2>
{#if run.text}<pre>{run.text}</pre>{:else}<div class="panel"><p class="empty">No result.</p></div>{/if}

<h2>Tool calls</h2>
<div class="panel">
  {#if run.receipts.length === 0}
    <p class="empty">No tool calls.</p>
  {:else}
    <table>
      <thead>
        <tr><th class="num">Step</th><th>Tool</th><th>Outcome</th><th class="num">Duration (ms)</th><th>Input</th><th>Detail</th></tr>
      </thead>
      <tbody>
        {#each run.receipts as r (r.step)}
          <tr>
            <td class="num">{r.step}</td>
            <td class="id">{r.tool}</td>
            <td><Badge value={r.outcome} /></td>
            <td class="num">{r.durationMs}</td>
            <td class="wrap"><pre>{r.input}{r.truncated ? " …" : ""}</pre></td>
            <td class="wrap"><pre>{r.detail}</pre></td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>
