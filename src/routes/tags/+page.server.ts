import { fail } from "@sveltejs/kit";
import { callApi, mutate } from "$lib/server/call";
import { changeTag, type TagKind } from "$lib/server/usage";
import type { Actions, PageServerLoad } from "./$types";

interface Tag {
  id: string;
  name: string;
  updatedAt: string;
}

export const load: PageServerLoad = async ({ locals }) => {
  const [taskTypes, domains] = await Promise.all([
    callApi<{ data: Tag[] }>(locals, "/v1/task-types", undefined, "ai"),
    callApi<{ data: Tag[] }>(locals, "/v1/domains", undefined, "ai"),
  ]);
  return { taskTypes: taskTypes.data, domains: domains.data };
};

const action =
  (kind: TagKind): Actions[string] =>
  async ({ locals, request }) => {
    const form = await request.formData();
    const existing =
      form.get("create") === "yes"
        ? (
            await callApi<{ data: Tag[] }>(
              locals,
              `/v1/${kind}`,
              undefined,
              "ai",
            )
          ).data.map((t) => t.id)
        : [];
    const result = await changeTag(
      (path, init) => mutate(locals, path, init, "ai"),
      kind,
      form,
      existing,
    );
    return result.status === 200 ? result : fail(result.status, result);
  };

export const actions: Actions = {
  "task-types": action("task-types"),
  domains: action("domains"),
};
