import { fireEvent, render, screen } from "@testing-library/svelte";
import { expect, test } from "vitest";
import Sparkline from "$lib/Sparkline.svelte";

const props = (values: (number | null)[]) => ({
  title: "Latency p50",
  headline: "800 ms",
  values,
  days: values.map((_, i) => `2026-03-0${i + 1}`),
  format: String,
});

test("a day with no data breaks the line instead of being drawn through", () => {
  const { container } = render(Sparkline, props([1, 2, null, 3, 4]));
  expect(container.querySelectorAll("polyline")).toHaveLength(2);
});

test("hovering a plot reads out the nearest day's value", async () => {
  const { container } = render(Sparkline, props([1, 2, 3]));
  const svg = container.querySelector("svg") as SVGSVGElement;
  svg.getBoundingClientRect = () => ({ left: 0, width: 260 }) as DOMRect;
  await fireEvent.mouseMove(svg, { clientX: 130 });
  expect(screen.getByText(/2026-03-02\s+2/)).toBeInTheDocument();
  await fireEvent.mouseLeave(svg);
  expect(screen.queryByText(/2026-03-02\s+2/)).toBeNull();
});

test("a plot with no data says so", () => {
  render(Sparkline, props([null, null]));
  expect(screen.getByText("No data")).toBeInTheDocument();
});
