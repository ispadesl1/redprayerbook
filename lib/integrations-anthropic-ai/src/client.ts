import Anthropic from "@anthropic-ai/sdk";

export const ANTHROPIC_DEFAULT_BASE_URL = "https://api.anthropic.com";

export function anthropicConfig(): { apiKey: string; baseURL: string } | null {
  const apiKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY?.trim() ?? "";
  if (!apiKey) return null;
  const baseURL = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL?.trim() || ANTHROPIC_DEFAULT_BASE_URL;
  return { apiKey, baseURL };
}

export function getAnthropic(): Anthropic {
  const config = anthropicConfig();
  if (!config) {
    throw Object.assign(new Error("Anthropic is not configured"), { code: "unconfigured" });
  }
  return new Anthropic({ apiKey: config.apiKey, baseURL: config.baseURL });
}

export function isUnconfigured(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "unconfigured";
}
