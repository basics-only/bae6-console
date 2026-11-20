<script lang="ts">
  let { value }: { value: string } = $props();
  const TONES: Record<string, string> = {
    approved: "good", finished: "good", positive: "good", ok: "good", Active: "good", allowed: "good",
    running: "info", queued: "info",
    pending: "warn", unscanned: "warn",
    revoked: "bad", cancelled: "bad", negative: "bad", not_allowed: "bad", failed: "bad", denied: "bad",
  };
</script>

<span class="badge" data-tone={TONES[value] ?? "neutral"}>{value}</span>
