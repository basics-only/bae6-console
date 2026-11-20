import { fireEvent, render, screen } from "@testing-library/svelte";
import { expect, test } from "vitest";
import ConcentrationTrend from "$lib/ConcentrationTrend.svelte";

const points = [
  { day: "2026-11-01", users: 10, top5: 0.3, top10: 0.45, top20: 0.6 },
  { day: "2026-11-02", users: 12, top5: 0.4, top10: 0.5, top20: 0.7 },
];

test("draws one line per top percent and reads out a day on hover", async () => {
  const { container } = render(ConcentrationTrend, { points, noun: "tokens" });
  expect(container.querySelectorAll("polyline")).toHaveLength(3);
  const svg = container.querySelector("svg") as SVGSVGElement;
  svg.getBoundingClientRect = () => ({ left: 0, width: 520 }) as DOMRect;
  await fireEvent.mouseMove(svg, { clientX: 510 });
  const caption = container.querySelector("figcaption") as HTMLElement;
  expect(caption.textContent).toMatch(/2026-11-02.*12 users/);
  expect(caption.textContent).toContain("top 10% use 50%");
  await fireEvent.mouseLeave(svg);
  expect(caption.textContent).not.toContain("12 users");
});

test("says so when there are no end-user days", () => {
  render(ConcentrationTrend, { points: [], noun: "tokens" });
  expect(
    screen.getByText("No end-user calls in this range."),
  ).toBeInTheDocument();
});
