<script lang="ts">
  let { data } = $props();
</script>

<h1>Model feedback</h1>

{#if data.filterError}<p role="alert">{data.filterError}</p>{/if}

{#if data.items.length === 0}
  <p>No feedback.</p>
{:else}
  <table>
    <thead>
      <tr><th>Updated</th><th>Model</th><th>Verdict</th><th>Label</th><th>Comment</th><th>Submitter</th><th>Request</th></tr>
    </thead>
    <tbody>
      {#each data.items as f (`${f.requestId}|${f.submitterId}`)}
        <tr>
          <td>{f.updatedAt}</td>
          <td>{f.model}</td>
          <td>{f.verdict}</td>
          <td>{f.label ?? ""}</td>
          <td>{f.comment ?? ""}</td>
          <td>{f.submitterId}</td>
          <td>{f.requestId}</td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}

{#if data.nextCursor}<a href={`?${new URLSearchParams({ cursor: data.nextCursor })}`}>Next page</a>{/if}
