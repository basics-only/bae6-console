import assert from "node:assert/strict";
import { test } from "node:test";
import type { Mutator } from "./relationships.js";
import { changeTag, usageQuery } from "./usage.js";

const form = (fields: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return f;
};
const never: Mutator = async () => {
  throw new Error("must not be called");
};

test("usageQuery defaults to 30 days by task type ending now", () => {
  const now = new Date("2026-03-31T12:00:00.000Z");
  assert.deepEqual(usageQuery(new URLSearchParams(), now), {
    days: 30,
    by: "taskType",
    from: "2026-03-01T12:00:00.000Z",
    to: "2026-03-31T12:00:00.000Z",
  });
});

test("usageQuery rejects a range or grouping the page did not offer", () => {
  assert.ok("error" in usageQuery(new URLSearchParams("days=365")));
  assert.ok("error" in usageQuery(new URLSearchParams("by=run")));
});

test("changeTag rejects a malformed or reserved id without calling the API", async () => {
  for (const id of ["../x", "Upper", "untagged", ""]) {
    const r = await changeTag(never, "task-types", form({ id, name: "n" }));
    assert.equal(r.status, 400);
  }
});

test("changeTag rejects a name outside 1 to 64 characters without calling the API", async () => {
  for (const name of ["  ", "x".repeat(65)]) {
    const r = await changeTag(never, "domains", form({ id: "legal", name }));
    assert.equal(r.status, 400);
  }
});

test("changeTag puts the trimmed name under the kind's path", async () => {
  const calls: unknown[] = [];
  const mutator: Mutator = async (path, init) => {
    calls.push([path, init]);
    return { ok: true, auditEventId: null };
  };
  await changeTag(
    mutator,
    "task-types",
    form({ id: "summarization", name: " Summaries " }),
  );
  assert.deepEqual(calls, [
    [
      "/v1/task-types/summarization",
      { method: "PUT", body: { name: "Summaries" } },
    ],
  ]);
});

test("changeTag deletes only when removal is confirmed", async () => {
  const calls: unknown[] = [];
  const mutator: Mutator = async (path, init) => {
    calls.push([path, init.method]);
    return { ok: true, auditEventId: null };
  };
  await changeTag(mutator, "domains", form({ id: "legal", remove: "yes" }));
  assert.deepEqual(calls, [["/v1/domains/legal", "DELETE"]]);
});

test("changeTag reports the gateway's refusal", async () => {
  const mutator: Mutator = async () => ({
    ok: false,
    status: 403,
    message: "Missing scope ai:usage:admin.",
  });
  assert.deepEqual(
    await changeTag(mutator, "domains", form({ id: "legal", name: "Legal" })),
    { status: 403, error: "Missing scope ai:usage:admin." },
  );
});

test("changeTag refuses to add an id that already exists", async () => {
  const r = await changeTag(
    never,
    "domains",
    form({ id: "legal", name: "Law", create: "yes" }),
    ["legal"],
  );
  assert.equal(r.status, 409);
});

test("changeTag still renames an existing id from the list", async () => {
  const calls: string[] = [];
  const mutator: Mutator = async (path, init) => {
    calls.push(`${init.method} ${path}`);
    return { ok: true, auditEventId: null, body: null };
  };
  const r = await changeTag(
    mutator,
    "domains",
    form({ id: "legal", name: "Law" }),
    ["legal"],
  );
  assert.equal(r.status, 200);
  assert.deepEqual(calls, ["PUT /v1/domains/legal"]);
});
