
import { z } from "zod";

import type { Message } from "../core/message.js";
import type {
  GenerationOptions,
  ModelProvider,
  ModelResponse,
} from "./model-provider.js";

const apiResponseSchema = z.object({
  choices: z.array(
    z.object({
      message: z.object({
        content: z.string().nullable(),
      }),
      finish_reason: z.string().nullable(),
    })
  ).min(1),
});

export interface OpenAICompatibleProviderConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  timeoutMs?: number;
}

export class OpenAICompatibleProvider implements ModelProvider {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly timeoutMs: number;

  constructor(config: OpenAICompatibleProviderConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl.replace(/\/+$/, "");
    this.model = config.model;
    this.timeoutMs = config.timeoutMs ?? 30_000;
  }

  async generate(
    messages: Message[],
    options: GenerationOptions = {},
  ): Promise<ModelResponse> {
    const response = await fetch(
      `${this.baseUrl}/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: options.temperature,
          max_tokens: options.maxTokens,
        }),
        signal: AbortSignal.timeout(this.timeoutMs),
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();

      throw new Error(
        `Model API request failed (${response.status}): ${errorBody}`,
      );
    }

    const rawData: unknown = await response.json();

    const parsedData = apiResponseSchema.safeParse(rawData);

    if (!parsedData.success) {
      throw new Error(
        `Invalid model API response: ${parsedData.error.message}`,
      );
    }

    const choice = parsedData.data.choices[0]!;

    return {
      content: choice.message.content,
      finishReason: choice.finish_reason,
    };
  }
}
