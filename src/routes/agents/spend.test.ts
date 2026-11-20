import { render, screen } from "@testing-library/svelte";
import { expect, test } from "vitest";
import Page from "./+page.svelte";

const run = {
  id: "r1",
  status: "finished",
  model: "claude-x",
  submitterId: "user:anne",
  createdAt: "t",
  stop: "final",
  tokens: 2_400_000,
};
const data = (spend: Record<string, string> | null) => ({
  status: "",
  items: [run],
  nextCursor: null,
  spend,
  spendFailed: false,
  filterError: null,
});

test("a run shows its spend next to its tokens", () => {
  render(Page, { data: data({ r1: "3.1" }) } as never);
  expect(screen.getByText("$3.10")).toBeInTheDocument();
  expect(screen.getByText("2.4M")).toBeInTheDocument();
});

test("a run with no figure shows a dash, not $0.00", () => {
  render(Page, { data: data({}) } as never);
  expect(screen.getByText("–")).toBeInTheDocument();
  expect(screen.queryByText("$0.00")).toBeNull();
});

test("says so when spend could not be loaded", () => {
  render(Page, {
    data: { ...data(null), spendFailed: true },
  } as never);
  expect(
    screen.getByText("Spend is unavailable right now."),
  ).toBeInTheDocument();
});

test("without an AI gateway there is no spend column", () => {
  render(Page, { data: data(null) } as never);
  expect(screen.queryByText("Spend")).toBeNull();
});
