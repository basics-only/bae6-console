<script lang="ts">
  let { data } = $props();
  const areas = $derived(
    [
      ["authz", "/applications", "Applications", "Who owns each application and which model governs it."],
      ["authz", "/audit", "Audit log", "Every administrative change, with actor and time."],
      ["authz", "/explorer", "Access explorer", "Check whether a principal holds a relation on an object."],
      ["ai", "/usage", "Usage", "Active users, spend and latency by organization, task type and domain."],
      ["ai", "/tags", "Task types", "The task types and domains calls can be tagged with."],
      ["ai", "/feedback", "Feedback", "What users said about model answers."],
      ["evals", "/evals", "Eval runs", "Scored test runs and their failures."],
      ["agents", "/agents", "Agent runs", "What agents did, step by step."],
      ["mcp", "/mcp", "MCP servers", "Review and approve tool servers before agents can use them."],
    ].filter(([service]) => (data.services as string[]).includes(service)),
  );
</script>

<div class="page-head">
  <h1>Overview</h1>
  <p>Operate the bae6 services you are signed in to. Sections appear for each service this console is connected to.</p>
</div>

{#if areas.length === 0}
  <div class="panel"><p class="empty">No services are configured. Set the service URLs in the environment and restart the console.</p></div>
{:else}
  <div class="areas">
    {#each areas as [, href, title, blurb] (href)}
      <a class="area" {href}><strong>{title}</strong><span>{blurb}</span></a>
    {/each}
  </div>
{/if}
