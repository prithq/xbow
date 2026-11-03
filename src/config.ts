
import { z } from "zod";

const configSchema = z.object({
  apiKey: z.string().min(1, "XBOW_API_KEY is required"),

  baseUrl: z.string().url().default(
    "https://api.openai.com/v1",
  ),

  model: z.string().min(1, "XBOW_MODEL is required"),

  timeoutMs: z.coerce.number().int().positive().default(30_000),
});

export function loadConfig() {
  return configSchema.parse({
    apiKey: process.env.XBOW_API_KEY,
    baseUrl: process.env.XBOW_BASE_URL || undefined,
    model: process.env.XBOW_MODEL,
    timeoutMs: process.env.XBOW_TIMEOUT_MS,
  });
}
