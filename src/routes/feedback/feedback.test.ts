import { render, screen } from "@testing-library/svelte";
import { expect, test } from "vitest";
import Page from "./+page.svelte";

const entry = {
  requestId: "req_1",
  submitterId: "user:anne",
  model: "claude-x",
  verdict: "negative",
  label: "inaccurate",
  comment: "<img src=x onerror=alert(1)>",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

test("a feedback comment is shown as text, never as markup", () => {
  const { container } = render(Page, {
    data: { items: [entry], nextCursor: null, filterError: null },
  } as never);
  expect(screen.getByText("<img src=x onerror=alert(1)>")).toBeInTheDocument();
  expect(container.querySelector("img")).toBeNull();
});

test("the next page link carries the cursor", () => {
  render(Page, {
    data: { items: [entry], nextCursor: "42", filterError: null },
  } as never);
  expect(screen.getByRole("link", { name: "Next page" })).toHaveAttribute(
    "href",
    "?cursor=42",
  );
});
