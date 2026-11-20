<script lang="ts">
  import { enhance } from "$app/forms";
  let { data, form } = $props();
</script>

<div class="page-head">
  <h1>Relationships: {data.application}</h1>
  <p><a href={`/applications/${data.application}`}>Back to application</a></p>
</div>

{#if form && "error" in form}
  <p role="alert">{form.error}</p>
{:else if form && "message" in form}
  <p role="status">
    {form.message}
    {#if form.auditEventId}Audit event {form.auditEventId}.{/if}
  </p>
{/if}

<form method="GET" class="filters">
  <input name="object" value={data.object} placeholder="Object, e.g. team:eng" aria-label="Object" />
  <input name="relation" value={data.relation} placeholder="Relation" aria-label="Relation" />
  <button type="submit">Filter</button>
</form>
{#if data.filterError}<p role="alert">{data.filterError}</p>{/if}

<div class="panel">
  {#if data.items.length === 0}
    <p class="empty">No relationships.</p>
  {:else}
    <table>
      <thead>
        <tr><th>Subject</th><th>Relation</th><th>Object</th>{#if data.canWrite}<th></th>{/if}</tr>
      </thead>
      <tbody>
        {#each data.items as t (`${t.subject}|${t.relation}|${t.object}`)}
          <tr>
            <td class="id">{t.subject}</td>
            <td class="id">{t.relation}</td>
            <td class="id">{t.object}</td>
            {#if data.canWrite}
              <td class="actions">
                <form method="POST" action="?/revoke" use:enhance>
                  <input type="hidden" name="subject" value={t.subject} />
                  <input type="hidden" name="relation" value={t.relation} />
                  <input type="hidden" name="object" value={t.object} />
                  <details>
                    <summary>Revoke</summary>
                    <button type="submit" name="confirm" value="yes">Confirm revoke</button>
                  </details>
                </form>
              </td>
            {/if}
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>

{#if data.nextCursor}
  <div class="pager"><a href={`?${new URLSearchParams({ ...(data.object ? { object: data.object } : {}), ...(data.relation ? { relation: data.relation } : {}), cursor: data.nextCursor })}`}>Next page</a></div>
{/if}

{#if data.canWrite}
  <h2>Grant</h2>
  <form method="POST" action="?/grant" use:enhance class="filters">
    <input name="subject" placeholder="user:anne" aria-label="Subject" required />
    <input name="relation" placeholder="member" aria-label="Grant relation" required />
    <input name="object" placeholder="team:eng" aria-label="Grant object" required />
    <button type="submit">Grant</button>
  </form>
{/if}
