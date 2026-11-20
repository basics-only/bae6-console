<script lang="ts">
  let { data } = $props();
</script>

<div class="page-head">
  <h1>{data.application.name}</h1>
  <p><a href="/applications">All applications</a> · <a href={`/applications/${data.application.id}/relationships`}>Relationships</a></p>
</div>

<div class="panel">
  <dl class="facts">
    <dt>Environment</dt>
    <dd>{data.application.environment}</dd>
    <dt>Created</dt>
    <dd>{data.application.createdAt}</dd>
    <dt>Active model</dt>
    <dd>{data.active ? data.active.id : "None"}</dd>
  </dl>
</div>

<h2>Prior models</h2>
<div class="panel">
  {#if data.prior.length === 0}
    <p class="empty">No prior models.</p>
  {:else}
    <table>
      <thead><tr><th>Model</th><th>Bound</th></tr></thead>
      <tbody>
        {#each data.prior as model (model.id)}
          <tr><td class="id">{model.id}</td><td>{model.createdAt}</td></tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>
