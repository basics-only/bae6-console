import { env } from "$env/dynamic/private";
import { discover, type OidcConfig, type OidcMetadata } from "./oidc.js";
import { createSessionStore } from "./session.js";

function required(name: string): string {
  const value = env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

export const sessions = createSessionStore();
export const SESSION_COOKIE = "console_session";
export const LOGIN_COOKIE = "console_login";

export const SERVICES = {
  authz: "BAE6_AUTHZ_URL",
  ai: "BAE6_AI_URL",
  evals: "BAE6_EVAL_URL",
  agents: "BAE6_AGENT_URL",
  mcp: "BAE6_MCP_REGISTRY_URL",
} as const;
export type Service = keyof typeof SERVICES;

/** The base URL of a service, or null when this console is not set up for it. */
export const serviceUrl = (service: Service): string | null =>
  env[SERVICES[service]]?.replace(/\/$/, "") || null;

export const configuredServices = () =>
  (Object.keys(SERVICES) as Service[]).filter((s) => serviceUrl(s));

export const oidcConfig = (): OidcConfig => ({
  issuer: required("OIDC_ISSUER"),
  clientId: required("OIDC_CLIENT_ID"),
  redirectUri: required("OIDC_REDIRECT_URI"),
  ...(env.OIDC_CLIENT_SECRET ? { clientSecret: env.OIDC_CLIENT_SECRET } : {}),
  ...(env.OIDC_AUDIENCE ? { audience: env.OIDC_AUDIENCE } : {}),
});

let metadata: Promise<OidcMetadata> | undefined;
/** Discovered once; a failed discovery is retried on the next request. */
export function oidcMetadata(): Promise<OidcMetadata> {
  metadata ??= discover(oidcConfig().issuer).catch((err) => {
    metadata = undefined;
    throw err;
  });
  return metadata;
}
