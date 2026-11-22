import { fireEvent, render, screen } from "@testing-library/svelte";
import { afterEach, expect, test, vi } from "vitest";
import Page from "./+page.svelte";

afterEach(() => vi.unstubAllGlobals());

const answer = (items: string[]) =>
  vi.fn().mockResolvedValue({ ok: true, json: async () => ({ items }) });

test("matching options appear as the user types and picking one fills the field", async () => {
  const fetchMock = answer(["crm-prod", "crm-dev"]);
  vi.stubGlobal("fetch", fetchMock);
  render(Page, { form: null } as never);

  const input = screen.getByLabelText("Application");
  await fireEvent.input(input, { target: { value: "crm" } });

  const options = await screen.findAllByRole("option");
  expect(options.map((o) => o.textContent?.trim())).toEqual([
    "crm-prod",
    "crm-dev",
  ]);
  expect(fetchMock.mock.calls[0][0]).toContain("field=application");

  await fireEvent.mouseDown(options[1]);
  expect(input).toHaveValue("crm-dev");
  expect(screen.queryByRole("option")).toBeNull();
});

test("the other fields ask for an application before suggesting anything", async () => {
  const fetchMock = answer([]);
  vi.stubGlobal("fetch", fetchMock);
  render(Page, { form: null } as never);

  await fireEvent.input(screen.getByLabelText("Principal"), {
    target: { value: "a" },
  });

  expect(await screen.findByText("Choose an application first.")).toBeVisible();
  expect(fetchMock).not.toHaveBeenCalled();
});

test("a failed lookup is shown instead of an empty list", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 502 }));
  render(Page, { form: null } as never);

  await fireEvent.input(screen.getByLabelText("Application"), {
    target: { value: "c" },
  });

  expect(await screen.findByText("Suggestions unavailable.")).toBeVisible();
});

test("Enter after a failed lookup leaves the typed value alone", async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: ["crm-prod", "crm-dev"] }),
    })
    .mockResolvedValueOnce({ ok: false, status: 502 });
  vi.stubGlobal("fetch", fetchMock);
  render(Page, { form: null } as never);

  const input = screen.getByLabelText("Application");
  await fireEvent.input(input, { target: { value: "crm" } });
  await screen.findAllByRole("option");
  await fireEvent.keyDown(input, { key: "ArrowDown" });
  await fireEvent.input(input, { target: { value: "crm-x" } });
  await screen.findByText("Suggestions unavailable.");

  const notCancelled = await fireEvent.keyDown(input, { key: "Enter" });

  expect(notCancelled).toBe(true);
  expect(input).toHaveValue("crm-x");
});
