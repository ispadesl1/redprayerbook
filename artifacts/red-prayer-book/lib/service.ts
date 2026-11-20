export const SERVICE_README =
  "https://github.com/ispadesl1/redprayerbook/blob/cursor/vellum-redesign-a106/README.md#companion-service";

export type ServiceState = "checking" | "ready" | "connect";

function withApiPath(value: string): string {
  const trimmed = value.trim().replace(/\/+$/, "");
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
  }
  const https = `https://${trimmed}`;
  return https.endsWith("/api") ? https : `${https}/api`;
}

/** Explicit EXPO_PUBLIC_API_URL keeps its scheme. A bare domain stays https. */
export function apiBase(): string | null {
  const explicit = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (explicit) return withApiPath(explicit);
  const domain = process.env.EXPO_PUBLIC_DOMAIN?.trim();
  if (!domain) return null;
  return withApiPath(domain);
}

export async function probeService(timeoutMs = 4000): Promise<Exclude<ServiceState, "checking">> {
  const base = apiBase();
  if (!base) return "connect";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${base}/service`, { signal: controller.signal });
    if (!response.ok) return "connect";
    const body = (await response.json()) as { aiConfigured?: boolean; databaseConfigured?: boolean };
    return body.aiConfigured && body.databaseConfigured ? "ready" : "connect";
  } catch {
    return "connect";
  } finally {
    clearTimeout(timer);
  }
}
