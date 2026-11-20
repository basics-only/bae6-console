<script lang="ts">
  import { page } from "$app/state";
</script>

{#if page.status === 403}
  <div class="page-head"><h1>Not permitted</h1><p>Your account is not allowed to do this.</p></div>
{:else}
  <div class="page-head"><h1>{page.status}</h1><p>{page.error?.message}</p></div>
{/if}
<p><a href="/">Back to overview</a></p>
