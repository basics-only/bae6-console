<script lang="ts">
  import Badge from "$lib/Badge.svelte";
  let { data } = $props();
</script>

<div class="page-head">
  <h1>Model feedback</h1>
  <p>What users said about model answers. Comments are shown as written.</p>
</div>

{#if data.filterError}<p role="alert">{data.filterError}</p>{/if}

<div class="panel">
  {#if data.items.length === 0}
    <p class="empty">No feedback.</p>
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
            <td><Badge value={f.verdict} /></td>
            <td>{f.label ?? ""}</td>
            <td class="wrap">{f.comment ?? ""}</td>
            <td>{f.submitterId}</td>
            <td class="id">{f.requestId}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>

{#if data.nextCursor}<div class="pager"><a href={`?${new URLSearchParams({ cursor: data.nextCursor })}`}>Next page</a></div>{/if}
