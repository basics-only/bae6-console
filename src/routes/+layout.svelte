<script lang="ts">
  let { data, children } = $props();
</script>

<header>
  <strong>bae6</strong>
  {#if data.subject}
    <nav>
      <a href="/">Home</a>
      {#if data.services.includes("authz")}
        <a href="/applications">Applications</a>
        <a href="/models">Models</a>
        <a href="/audit">Audit</a>
        <a href="/explorer">Explorer</a>
      {/if}
      {#if data.services.includes("ai")}<a href="/feedback">Feedback</a>{/if}
      {#if data.services.includes("evals")}<a href="/evals">Evals</a>{/if}
      {#if data.services.includes("agents")}<a href="/agents">Agents</a>{/if}
      {#if data.services.includes("mcp")}<a href="/mcp">MCP servers</a>{/if}
    </nav>
    <form method="POST" action="/logout">
      <span>{data.subject}</span>
      <button type="submit">Sign out</button>
    </form>
  {/if}
</header>
<main>{@render children()}</main>
