<script lang="ts">
  import Badge from "$lib/Badge.svelte";
  let { data } = $props();
  const statuses = ["queued", "running", "finished", "cancelled"];
</script>

<div class="page-head">
  <h1>Eval runs</h1>
  <p>Scored test runs against a model and dataset.</p>
</div>

<form method="GET" class="filters">
  <select name="status" aria-label="Status">
    <option value="">Any status</option>
    {#each statuses as s}<option value={s} selected={s === data.status}>{s}</option>{/each}
  </select>
  <button type="submit">Filter</button>
</form>
{#if data.filterError}<p role="alert">{data.filterError}</p>{/if}

<div class="panel">
  {#if data.items.length === 0}
    <p class="empty">No eval runs.</p>
  {:else}
    <table>
      <thead>
        <tr><th>Run</th><th>Name</th><th>Model</th><th>Dataset</th><th>Status</th><th class="num">Cases</th><th class="num">Failures</th><th>Created</th></tr>
      </thead>
      <tbody>
        {#each data.items as r (r.id)}
          <tr>
            <td class="id"><a href={`/evals/${encodeURIComponent(r.id)}`}>{r.id}</a></td>
            <td>{r.name}</td>
            <td>{r.model}</td>
            <td>{r.datasetVersion}</td>
            <td><Badge value={r.status} /></td>
            <td class="num">{r.caseCount}</td>
            <td class="num">{r.summary?.failures ?? ""}</td>
            <td>{r.createdAt}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>

{#if data.nextCursor}
  <div class="pager"><a href={`?${new URLSearchParams({ ...(data.status ? { status: data.status } : {}), cursor: data.nextCursor })}`}>Next page</a></div>
{/if}
