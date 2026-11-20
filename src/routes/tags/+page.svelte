<script lang="ts">
  import { enhance } from "$app/forms";
  let { data, form } = $props();
  const kinds = $derived([
    { kind: "task-types", title: "Task types", hint: "e.g. summarization", tags: data.taskTypes },
    { kind: "domains", title: "Domains", hint: "e.g. legal", tags: data.domains },
  ]);
</script>

<div class="page-head">
  <h1>Task types and domains</h1>
  <p>Callers tag each AI call with one of these, so usage can be broken down by what it was for. Removing a tag keeps past usage; new calls with it are refused.</p>
</div>

{#if form && "error" in form}
  <p role="alert">{form.error}</p>
{:else if form && "message" in form}
  <p role="status">{form.message}</p>
{/if}

{#each kinds as k (k.kind)}
  <h2>{k.title}</h2>
  <div class="panel">
    {#if k.tags.length === 0}
      <p class="empty">None yet.</p>
    {:else}
      <table>
        <thead><tr><th>Id</th><th>Name</th><th></th></tr></thead>
        <tbody>
          {#each k.tags as t (t.id)}
            <tr>
              <td class="id">{t.id}</td>
              <td>
                <form method="POST" action={`?/${k.kind}`} use:enhance class="filters">
                  <input type="hidden" name="id" value={t.id} />
                  <input name="name" value={t.name} aria-label={`Name of ${t.id}`} required maxlength="64" />
                  <button type="submit">Rename</button>
                </form>
              </td>
              <td class="actions">
                <form method="POST" action={`?/${k.kind}`} use:enhance>
                  <input type="hidden" name="id" value={t.id} />
                  <details>
                    <summary>Remove</summary>
                    <button type="submit" name="remove" value="yes">Confirm remove {t.id}</button>
                  </details>
                </form>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </div>
  <form method="POST" action={`?/${k.kind}`} use:enhance class="filters">
    <input type="hidden" name="create" value="yes" />
    <input name="id" placeholder="Id, {k.hint}" aria-label={`New ${k.title.toLowerCase()} id`} required maxlength="48" />
    <input name="name" placeholder="Name" aria-label={`New ${k.title.toLowerCase()} name`} required maxlength="64" />
    <button type="submit">Add</button>
  </form>
{/each}
