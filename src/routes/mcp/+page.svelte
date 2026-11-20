<script lang="ts">
  import { enhance } from "$app/forms";
  import Badge from "$lib/Badge.svelte";
  let { data, form } = $props();
</script>

<div class="page-head">
  <h1>MCP servers</h1>
  <p>Tool servers agents may call. A version must be approved before it can be used, and its publisher cannot approve it.</p>
</div>

{#if form && "error" in form}
  <p role="alert">{form.error}</p>
{:else if form && "message" in form}
  <p role="status">{form.message}</p>
{/if}
{#if data.filterError}<p role="alert">{data.filterError}</p>{/if}

{#if data.items.length === 0}
  <div class="panel"><p class="empty">No MCP servers.</p></div>
{:else}
  {#each data.items as s (s.id)}
    <h2>{s.name} <small>{s.id}, team {s.team}</small></h2>
    {#if s.description}<p>{s.description}</p>{/if}
    <div class="panel">
      <table>
        <thead>
          <tr><th>Version</th><th>State</th><th>Scan</th><th>Endpoint</th><th>Published by</th><th>Decided by</th><th></th></tr>
        </thead>
        <tbody>
          {#each s.versions as v (v.version)}
            <tr>
              <td class="id">{v.version}</td>
              <td><Badge value={v.state} /></td>
              <td><Badge value={v.scanStatus} /></td>
              <td class="wrap">{v.endpoint}</td>
              <td>{v.publishedBy}</td>
              <td>{v.decidedBy ?? ""}</td>
              <td class="actions">
                {#if v.state === "pending"}
                  <form method="POST" action="?/approve" use:enhance>
                    <input type="hidden" name="server" value={s.id} />
                    <input type="hidden" name="version" value={v.version} />
                    <button type="submit">Approve</button>
                  </form>
                {/if}
                {#if v.state !== "revoked"}
                  <form method="POST" action="?/revoke" use:enhance>
                    <input type="hidden" name="server" value={s.id} />
                    <input type="hidden" name="version" value={v.version} />
                    <details>
                      <summary>Revoke</summary>
                      <button type="submit" name="confirm" value="yes">Confirm revoke</button>
                    </details>
                  </form>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/each}
{/if}

{#if data.nextCursor}<div class="pager"><a href={`?${new URLSearchParams({ cursor: data.nextCursor })}`}>Next page</a></div>{/if}
