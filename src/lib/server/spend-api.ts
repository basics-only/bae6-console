import { callApi } from "./call";
import { serviceUrl } from "./context";
import { spendFor } from "./spend";

export const spendByRun = (
  locals: Parameters<typeof callApi>[0],
  prefix: "eval_" | "run_",
  ids: string[],
) =>
  spendFor(
    serviceUrl("ai") ? (path) => callApi(locals, path, undefined, "ai") : null,
    prefix,
    ids,
  );
