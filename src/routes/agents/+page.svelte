<script lang="ts">
  let { data } = $props();
  const statuses = ["queued", "running", "finished", "cancelled"];
</script>

<h1>Agent runs</h1>

<form method="GET">
  <select name="status" aria-label="Status">
    <option value="">Any status</option>
    {#each statuses as s}<option value={s} selected={s === data.status}>{s}</option>{/each}
  </select>
  <button type="submit">Filter</button>
</form>
{#if data.filterError}<p role="alert">{data.filterError}</p>{/if}

{#if data.items.length === 0}
  <p>No agent runs.</p>
{:else}
  <table>
    <thead>
      <tr><th>Run</th><th>Model</th><th>Status</th><th>Stop</th><th>Tokens</th><th>Submitter</th><th>Created</th></tr>
    </thead>
    <tbody>
      {#each data.items as r (r.id)}
        <tr>
          <td><a href={`/agents/${encodeURIComponent(r.id)}`}>{r.id}</a></td>
          <td>{r.model}</td>
          <td>{r.status}</td>
          <td>{r.stop ?? ""}</td>
          <td>{r.tokens}</td>
          <td>{r.submitterId}</td>
          <td>{r.createdAt}</td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}

{#if data.nextCursor}
  <a href={`?${new URLSearchParams({ ...(data.status ? { status: data.status } : {}), cursor: data.nextCursor })}`}>Next page</a>
{/if}
