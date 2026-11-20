import assert from "node:assert/strict";
import { test } from "node:test";
import { pick } from "./suggest.js";

test("pick returns at most ten distinct matches", () => {
  const values = Array.from({ length: 30 }, (_, i) => `doc:${i % 15}`);
  const found = pick(values, "doc");
  assert.equal(found.length, 10);
  assert.equal(new Set(found).size, 10);
});

test("pick matches anywhere, ignores case, and lists prefix matches first", () => {
  assert.deepEqual(pick(["team:eng", "doc:eng-plan", "ENG:x"], "eng"), [
    "ENG:x",
    "team:eng",
    "doc:eng-plan",
  ]);
});

test("pick returns everything up to the limit for an empty query and nothing for no match", () => {
  assert.deepEqual(pick(["a", "b"], ""), ["a", "b"]);
  assert.deepEqual(pick(["a", "b"], "zzz"), []);
});
