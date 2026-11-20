<script lang="ts">
  import Badge from "$lib/Badge.svelte";
  let { data } = $props();
  const statuses = ["queued", "running", "finished", "cancelled"];
</script>

<div class="page-head">
  <h1>Agent runs</h1>
  <p>What agents did, and why each run stopped.</p>
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
    <p class="empty">No agent runs.</p>
  {:else}
    <table>
      <thead>
        <tr><th>Run</th><th>Model</th><th>Status</th><th>Stop</th><th class="num">Tokens</th><th>Submitter</th><th>Created</th></tr>
      </thead>
      <tbody>
        {#each data.items as r (r.id)}
          <tr>
            <td class="id"><a href={`/agents/${encodeURIComponent(r.id)}`}>{r.id}</a></td>
            <td>{r.model}</td>
            <td><Badge value={r.status} /></td>
            <td>{r.stop ?? ""}</td>
            <td class="num">{r.tokens}</td>
            <td>{r.submitterId}</td>
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
