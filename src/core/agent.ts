
import type { Message } from "./message.js";

import type { ModelProvider } from "../providers/model-provider.js";

export interface AgentOptions {
  systemPrompt?: string;
}

export class Agent {
  private readonly provider: ModelProvider;
  private readonly systemPrompt: string;

  private messages: Message[];
  private isRunning = false;

  constructor(
    provider: ModelProvider,
    options: AgentOptions = {},
  ) {
    this.provider = provider;

    this.systemPrompt =
      options.systemPrompt ?? "You are a helpful assistant.";

    this.messages = [
      {
        role: "system",
        content: this.systemPrompt,
      },
    ];
  }

  async run(input: string): Promise<string> {
    if (this.isRunning) {
      throw new Error(
        "This agent is already processing a request.",
      );
    }

    if (!input.trim()) {
      throw new Error("Agent input cannot be empty.");
    }

    const previousLength = this.messages.length;

    this.isRunning = true;

    this.messages.push({
      role: "user",
      content: input,
    });

    try {
      const response = await this.provider.generate(
        this.getMessages(),
      );

      if (response.content === null) {
        throw new Error(
          "The model returned no text content.",
        );
      }

      this.messages.push({
        role: "assistant",
        content: response.content,
      });

      return response.content;
    } catch (error) {
      // Roll back the incomplete interaction.
      this.messages.length = previousLength;

      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  getMessages(): Message[] {
    return this.messages.map((message) => ({
      ...message,
    }));
  }

  reset(): void {
    if (this.isRunning) {
      throw new Error(
        "Cannot reset an agent while it is running.",
      );
    }

    this.messages = [
      {
        role: "system",
        content: this.systemPrompt,
      },
    ];
  }
}
