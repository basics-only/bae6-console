<script lang="ts">
  import { page } from "$app/state";
  import "../app.css";

  let { data, children } = $props();
  const here = (href: string) => page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);
  const has = (service: string) => (data.services as string[]).includes(service);
  const groups = $derived(
    [
      {
        name: "Access",
        show: has("authz"),
        links: [
          ["/applications", "Applications"],
          ["/models", "Models"],
          ["/audit", "Audit log"],
          ["/explorer", "Access explorer"],
        ],
      },
      {
        name: "AI platform",
        show: ["ai", "evals", "agents", "mcp"].some(has),
        links: [
          has("ai") && ["/feedback", "Feedback"],
          has("evals") && ["/evals", "Eval runs"],
          has("agents") && ["/agents", "Agent runs"],
          has("mcp") && ["/mcp", "MCP servers"],
        ].filter(Boolean) as string[][],
      },
    ].filter((g) => g.show),
  );
</script>

<svelte:head><title>bae6 console</title></svelte:head>

{#if data.subject}
  <div class="shell">
    <aside class="sidebar">
      <a class="brand" href="/">
        <span class="logo"><img src="/logo.svg" alt="bae6 logo" /></span>
        <span class="wordmark">bae6<span>.</span>console</span>
      </a>
      <nav aria-label="Main">
        {#each groups as group (group.name)}
          <div class="nav-group">{group.name}</div>
          {#each group.links as [href, label] (href)}
            <a class="nav" {href} aria-current={here(href) ? "page" : undefined}>{label}</a>
          {/each}
        {/each}
      </nav>
      <form method="POST" action="/logout" class="account">
        <span class="who">{data.subject}</span>
        <button type="submit">Sign out</button>
      </form>
    </aside>
    <main class="content">{@render children()}</main>
  </div>
{:else}
  <main class="centered">{@render children()}</main>
{/if}
