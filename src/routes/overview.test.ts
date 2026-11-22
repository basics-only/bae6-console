import { render, screen } from "@testing-library/svelte";
import { expect, test } from "vitest";
import Page from "./+page.svelte";

test("an AI gateway adds usage and task type cards", () => {
  render(Page, { data: { services: ["ai"] } } as never);
  expect(screen.getByRole("link", { name: /Usage/ })).toHaveAttribute(
    "href",
    "/usage",
  );
  expect(screen.getByRole("link", { name: /Task types/ })).toHaveAttribute(
    "href",
    "/tags",
  );
});
