<script lang="ts">
  let { data } = $props();
  const statuses = ["queued", "running", "finished", "cancelled"];
</script>

<h1>Eval runs</h1>

<form method="GET">
  <select name="status" aria-label="Status">
    <option value="">Any status</option>
    {#each statuses as s}<option value={s} selected={s === data.status}>{s}</option>{/each}
  </select>
  <button type="submit">Filter</button>
</form>
{#if data.filterError}<p role="alert">{data.filterError}</p>{/if}

{#if data.items.length === 0}
  <p>No eval runs.</p>
{:else}
  <table>
    <thead>
      <tr><th>Run</th><th>Name</th><th>Model</th><th>Dataset</th><th>Status</th><th>Cases</th><th>Failures</th><th>Created</th></tr>
    </thead>
    <tbody>
      {#each data.items as r (r.id)}
        <tr>
          <td><a href={`/evals/${encodeURIComponent(r.id)}`}>{r.id}</a></td>
          <td>{r.name}</td>
          <td>{r.model}</td>
          <td>{r.datasetVersion}</td>
          <td>{r.status}</td>
          <td>{r.caseCount}</td>
          <td>{r.summary?.failures ?? ""}</td>
          <td>{r.createdAt}</td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}

{#if data.nextCursor}
  <a href={`?${new URLSearchParams({ ...(data.status ? { status: data.status } : {}), cursor: data.nextCursor })}`}>Next page</a>
{/if}
