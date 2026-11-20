<script lang="ts">
  let { data, form } = $props();
</script>

<h1>MCP servers</h1>

{#if form && "error" in form}
  <p role="alert">{form.error}</p>
{:else if form && "message" in form}
  <p role="status">{form.message}</p>
{/if}
{#if data.filterError}<p role="alert">{data.filterError}</p>{/if}

{#if data.items.length === 0}
  <p>No MCP servers.</p>
{:else}
  {#each data.items as s (s.id)}
    <h2>{s.name} <small>{s.id}, team {s.team}</small></h2>
    {#if s.description}<p>{s.description}</p>{/if}
    <table>
      <thead>
        <tr><th>Version</th><th>State</th><th>Scan</th><th>Endpoint</th><th>Published by</th><th>Decided by</th><th></th></tr>
      </thead>
      <tbody>
        {#each s.versions as v (v.version)}
          <tr>
            <td>{v.version}</td>
            <td>{v.state}</td>
            <td>{v.scanStatus}</td>
            <td>{v.endpoint}</td>
            <td>{v.publishedBy}</td>
            <td>{v.decidedBy ?? ""}</td>
            <td>
              {#if v.state === "pending"}
                <form method="POST" action="?/approve">
                  <input type="hidden" name="server" value={s.id} />
                  <input type="hidden" name="version" value={v.version} />
                  <button type="submit">Approve</button>
                </form>
              {/if}
              {#if v.state !== "revoked"}
                <form method="POST" action="?/revoke">
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
  {/each}
{/if}

{#if data.nextCursor}<a href={`?${new URLSearchParams({ cursor: data.nextCursor })}`}>Next page</a>{/if}
