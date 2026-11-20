import assert from "node:assert/strict";
import { test } from "node:test";
import { listQuery, RUN_STATUSES, SAFE_ID } from "./paging.js";

test("listQuery sends the status and cursor that were given, with a bounded page size", () => {
  const q = listQuery(
    new URLSearchParams({ status: "running", cursor: "123" }),
    RUN_STATUSES,
  );
  assert.ok(!("error" in q));
  assert.equal(q.query.toString(), "limit=50&status=running&cursor=123");
});

test("listQuery refuses a status or cursor the API would not take", () => {
  assert.ok(
    "error" in
      listQuery(new URLSearchParams({ status: "bogus" }), RUN_STATUSES),
  );
  assert.ok(
    "error" in listQuery(new URLSearchParams({ cursor: "1&limit=9999" })),
  );
  assert.ok("error" in listQuery(new URLSearchParams({ status: "running" })));
});

test("SAFE_ID rejects ids that could change an API path", () => {
  assert.ok(SAFE_ID.test("run_123-a.b"));
  for (const bad of ["../x", "a/b", "a?b", "", "a".repeat(65)]) {
    assert.ok(!SAFE_ID.test(bad), bad);
  }
});
