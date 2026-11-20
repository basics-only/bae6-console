import { render, screen } from "@testing-library/svelte";
import { expect, test } from "vitest";
import Page from "./+page.svelte";

const m = (over = {}) => ({
  requests: 1200,
  inputTokens: 1_000_000,
  outputTokens: 1_400_000,
  cost: "12.5",
  latencyMs: { p50: 800, p95: 2400 },
  firstTokenMs: { p50: null, p95: null },
  activeUsers: { day: 3, week: 10, month: 40 },
  ...over,
});

test("totals and group rows are rounded for reading", () => {
  render(Page, {
    data: {
      days: 30,
      by: "taskType",
      measure: "tokens",
      distribution: { users: 0, total: "0", data: [] },
      concentration: [],
      series: [{ day: "2026-03-30", ...m() }],
      groups: [{ key: "summarization", ...m() }],
      truncated: false,
      filterError: null,
    },
  } as never);
  expect(screen.getByLabelText("Totals")).toHaveTextContent("2.4M");
  expect(screen.getByLabelText("Totals")).toHaveTextContent("$12.50");
  expect(screen.getByText("summarization")).toBeInTheDocument();
});

test("a truncated breakdown says so", () => {
  render(Page, {
    data: {
      days: 30,
      by: "model",
      measure: "tokens",
      distribution: { users: 0, total: "0", data: [] },
      concentration: [],
      series: [],
      groups: [],
      truncated: true,
      filterError: null,
    },
  } as never);
  expect(screen.getByRole("status")).toHaveTextContent("100 largest");
});
