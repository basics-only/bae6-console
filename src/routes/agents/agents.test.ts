import { render, screen } from "@testing-library/svelte";
import { expect, test } from "vitest";
import Page from "./[id]/+page.svelte";

const run = {
  id: "run_1",
  status: "finished",
  model: "claude-x",
  submitterId: "user:anne",
  attempt: 1,
  createdAt: "2026-01-01T00:00:00.000Z",
  startedAt: null,
  finishedAt: null,
  stop: "final",
  text: "<script>window.pwned = true</script>done",
  tokens: 12,
  receipts: [
    {
      step: 1,
      tool: "search",
      input: "<b>q</b>",
      outcome: "denied",
      detail: "not allowed",
      truncated: true,
      durationMs: 3,
    },
  ],
};

test("model output and tool input are shown as text, never as markup", () => {
  const { container } = render(Page, { data: { run } } as never);
  expect(container.querySelector("script")).toBeNull();
  expect(container.querySelector("b")).toBeNull();
  expect(screen.getByText(/window.pwned = true/)).toBeInTheDocument();
  expect(screen.getByText("denied")).toBeInTheDocument();
});
