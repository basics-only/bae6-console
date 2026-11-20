<script lang="ts">
  let { data } = $props();
</script>

<div class="page-head">
  <h1>Applications</h1>
  <p>Applications you can administer or audit.</p>
</div>

<form method="GET" class="filters">
  <input name="q" value={data.q} placeholder="Search" aria-label="Search applications" />
  <button type="submit">Search</button>
</form>

<div class="panel">
  {#if data.items.length === 0}
    <p class="empty">No applications.</p>
  {:else}
    <table>
      <thead>
        <tr><th>Name</th><th>Environment</th><th>Created</th></tr>
      </thead>
      <tbody>
        {#each data.items as app (app.id)}
          <tr>
            <td><a href={`/applications/${app.id}`}>{app.name}</a></td>
            <td>{app.environment}</td>
            <td>{app.createdAt}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>

{#if data.nextCursor}
  <div class="pager"><a href={`?cursor=${encodeURIComponent(data.nextCursor)}`}>Next page</a></div>
{/if}
