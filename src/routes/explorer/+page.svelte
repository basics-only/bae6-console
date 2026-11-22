<script lang="ts">
  import { enhance } from "$app/forms";
  import Badge from "$lib/Badge.svelte";
  import Suggest from "$lib/Suggest.svelte";
  let { form } = $props();
  let application = $state(form?.query?.application ?? "");
  let principal = $state(form?.query?.principal ?? "");
  let relation = $state(form?.query?.relation ?? "");
  let object = $state(form?.query?.object ?? "");
</script>

<div class="page-head">
  <h1>Access explorer</h1>
  <p>Can a principal hold a relation on an object? Answered queries are audited.</p>
</div>

<form method="POST" action="?/check" use:enhance class="filters">
  <Suggest name="application" label="Application" placeholder="Application, e.g. crm-prod" field="application" bind:value={application} required />
  <Suggest name="principal" label="Principal" placeholder="Principal, e.g. anne" field="principal" {application} bind:value={principal} required />
  <Suggest name="relation" label="Relation" placeholder="Relation, e.g. read" field="relation" {application} bind:value={relation} required />
  <Suggest name="object" label="Object" placeholder="Object, e.g. document:d1" field="object" {application} bind:value={object} required />
  <button type="submit">Check</button>
</form>

{#if form && "error" in form}
  <p role="alert">{form.error}</p>
{:else if form && "answer" in form}
  <div class="panel">
    <dl class="facts" role="status">
      <dt>Decision</dt>
      <dd><Badge value={form.answer.status} /></dd>
      <dt>Model</dt>
      <dd>{form.answer.modelId ?? "None"}</dd>
      <dt>Request</dt>
      <dd>{form.answer.requestId}</dd>
      {#if form.answer.code}
        <dt>Reason</dt>
        <dd>{form.answer.code}</dd>
      {/if}
    </dl>
  </div>
{/if}
