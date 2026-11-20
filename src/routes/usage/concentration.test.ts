import { fireEvent, render, screen } from "@testing-library/svelte";
import { expect, test } from "vitest";
import Concentration from "$lib/Concentration.svelte";

const points = Array.from({ length: 100 }, (_, i) => ({
  topUsersPercent: i + 1,
  share: i + 1 === 10 ? 0.85 : (i + 1) / 100,
}));

test("hovering the curve says what share the top users account for", async () => {
  const { container } = render(Concentration, {
    users: 40,
    noun: "tokens",
    points,
  });
  const svg = container.querySelector("svg") as SVGSVGElement;
  svg.getBoundingClientRect = () => ({ left: 0, width: 520 }) as DOMRect;
  await fireEvent.mouseMove(svg, { clientX: 87 });
  expect(screen.getByText(/of users use/).textContent).toBe(
    "The top 10% of users use 85% of the tokens",
  );
  await fireEvent.mouseLeave(svg);
  expect(screen.queryByText(/of users use/)).toBeNull();
});

test("says so when no end user made a call", () => {
  render(Concentration, { users: 0, noun: "tokens", points: [] });
  expect(
    screen.getByText("No end-user calls in this range."),
  ).toBeInTheDocument();
});
