import { error, json } from "@sveltejs/kit";
import { callApi } from "$lib/server/call";
import { pick } from "$lib/server/suggest";
import type { RequestHandler } from "./$types";

const APPLICATION = /^[a-z0-9][a-z0-9-]{0,62}$/;
const PRINCIPAL = /^[A-Za-z0-9._@+-]{1,128}$/;

// shortcut: suggestions come from the first 100 relationships, upgrade when an API search exists.
const SAMPLE = 100;

export const GET: RequestHandler = async ({ locals, url }) => {
  const field = url.searchParams.get("field");
  const q = (url.searchParams.get("q") ?? "").trim().slice(0, 64);

  if (field === "application") {
    const page = await callApi<{ items: { id: string; name: string }[] }>(
      locals,
      `/v1/applications?limit=${SAMPLE}`,
    );
    const needle = q.toLowerCase();
    const ids = page.items
      .filter((a) => `${a.id} ${a.name}`.toLowerCase().includes(needle))
      .map((a) => a.id);
    return json({ items: pick(ids, "") });
  }

  if (field !== "principal" && field !== "relation" && field !== "object") {
    error(400, "Unknown field.");
  }
  const application = url.searchParams.get("application") ?? "";
  if (!APPLICATION.test(application)) {
    error(400, "Choose an application first.");
  }
  const page = await callApi<{
    items: { subject: string; relation: string; object: string }[];
  }>(locals, `/v1/relationships?application=${application}&limit=${SAMPLE}`);
  const values =
    field === "principal"
      ? page.items
          .map((t) => t.subject.replace(/^user:/, ""))
          .filter((s) => PRINCIPAL.test(s))
      : page.items.map((t) => t[field]);
  return json({ items: pick(values, q) });
};
