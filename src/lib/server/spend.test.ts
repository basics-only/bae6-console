import assert from "node:assert/strict";
import { test } from "node:test";
import { error } from "@sveltejs/kit";
import { spendFor } from "./spend.js";

const reply = (data: { key: string; cost: string }[]) => async () => ({ data });

test("spend is keyed by the run's own id", async () => {
  const r = await spendFor(reply([{ key: "run_a", cost: "3.1" }]), "run_", [
    "a",
  ]);
  assert.deepEqual(r, { spend: { a: "3.1" }, spendFailed: false });
});

test("without an AI gateway there is no spend and no failure", async () => {
  assert.deepEqual(await spendFor(null, "run_", ["a"]), {
    spend: null,
    spendFailed: false,
  });
});

test("a refused lookup degrades to no spend and says so", async () => {
  const refused = async () => error(403, "Missing scope ai:usage:read.");
  assert.deepEqual(await spendFor(refused, "run_", ["a"]), {
    spend: null,
    spendFailed: true,
  });
});

test("a failure that is not an HTTP refusal still surfaces", async () => {
  const broken = async () => {
    throw new TypeError("boom");
  };
  await assert.rejects(spendFor(broken, "run_", ["a"]), TypeError);
});

test("ids too long for a run id are left out so they cannot fail the whole lookup", async () => {
  let path = "";
  await spendFor(
    async (p) => {
      path = p;
      return { data: [] };
    },
    "run_",
    ["ok", "x".repeat(61)],
  );
  assert.deepEqual(new URL(`http://x${path}`).searchParams.getAll("runId"), [
    "run_ok",
  ]);
});
