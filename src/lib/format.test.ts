import assert from "node:assert/strict";
import { test } from "node:test";
import { compact, usd } from "./format.js";

test("compact leaves small numbers alone and scales thousands, millions and billions", () => {
  assert.equal(compact(0), "0");
  assert.equal(compact(999), "999");
  assert.equal(compact(3100), "3.1k");
  assert.equal(compact(2_400_000), "2.4M");
  assert.equal(compact(1_200_000_000), "1.2B");
  assert.equal(compact(3000), "3k");
});

test("compact moves to the next unit when rounding reaches a thousand", () => {
  assert.equal(compact(999_950), "1M");
  assert.equal(compact(999_949), "999.9k");
});

test("usd keeps cents below a thousand and compacts above", () => {
  assert.equal(usd(0), "$0.00");
  assert.equal(usd("12.5"), "$12.50");
  assert.equal(usd(3100), "$3.1k");
  assert.equal(usd("2400000"), "$2.4M");
});

test("usd does not show a real charge as zero", () => {
  assert.equal(usd("0.004"), "<$0.01");
});

test("compact rounds fractions below a thousand and carries into thousands", () => {
  assert.equal(compact(812.4375), "812.4");
  assert.equal(compact(999.96), "1k");
});

test("usd does not print a thousand dollars as $1000.00", () => {
  assert.equal(usd(999.996), "$1k");
  assert.equal(usd(999.99), "$999.99");
});
