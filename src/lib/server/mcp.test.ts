import assert from "node:assert/strict";
import { test } from "node:test";
import { approve, revoke } from "./mcp.js";
import type { Mutator } from "./relationships.js";

const form = (fields: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return f;
};

const calls: { path: string; body: unknown }[] = [];
const accepting: Mutator = async (path, init) => {
  calls.push({ path, body: init.body });
  return { ok: true, auditEventId: null };
};

test("approve never claims a clean scan, whatever the form says", async () => {
  calls.length = 0;
  const result = await approve(
    accepting,
    form({ server: "crm", version: "1.0.0", scanStatus: "clean" }),
  );
  assert.equal(result.status, 200);
  assert.deepEqual(calls, [
    {
      path: "/v1/servers/crm/approve",
      body: { version: "1.0.0", scanStatus: "unscanned" },
    },
  ]);
});

test("approve reports the registry's refusal, such as approving your own version", async () => {
  const refusing: Mutator = async () => ({
    ok: false,
    status: 403,
    message: "a version cannot be approved by its publisher",
  });
  assert.deepEqual(
    await approve(refusing, form({ server: "crm", version: "1.0.0" })),
    { status: 403, error: "a version cannot be approved by its publisher" },
  );
});

test("revoke without confirmation does not call the registry", async () => {
  calls.length = 0;
  const result = await revoke(
    accepting,
    form({ server: "crm", version: "1.0.0" }),
  );
  assert.equal(result.status, 400);
  assert.equal(calls.length, 0);
});

test("a server id that could change the path is refused before any call", async () => {
  calls.length = 0;
  const result = await revoke(
    accepting,
    form({ server: "../v1/audit", version: "1.0.0", confirm: "yes" }),
  );
  assert.equal(result.status, 400);
  assert.equal(calls.length, 0);
});
