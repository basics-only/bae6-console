import { render, screen } from "@testing-library/svelte";
import { expect, test } from "vitest";
import Page from "./+page.svelte";

const version = (name: string, state: string) => ({
  version: name,
  state,
  scanStatus: "unscanned",
  endpoint: "https://mcp.example/crm",
  publishedBy: "user:bo",
});
const server = {
  id: "crm",
  team: "sales",
  name: "CRM",
  versions: [
    version("1.0.0", "approved"),
    version("1.1.0", "pending"),
    version("0.9.0", "revoked"),
  ],
};

test("only a pending version can be approved and only a live one revoked", () => {
  render(Page, {
    data: { items: [server], nextCursor: null, filterError: null },
  } as never);
  expect(screen.getAllByRole("button", { name: "Approve" })).toHaveLength(1);
  expect(screen.getAllByText("Revoke")).toHaveLength(2);
});

test("a registry refusal is shown next to the list", () => {
  render(Page, {
    data: { items: [server], nextCursor: null, filterError: null },
    form: { status: 403, error: "Missing scope mcp:approve." },
  } as never);
  expect(screen.getByRole("alert")).toHaveTextContent("Missing scope");
});
