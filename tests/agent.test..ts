
import { describe, it, expect } from "vitest";

import { Agent } from "../src/core/agent.js";

import type { ModelProvider } from "../src/providers/model-provider.js";

import type { Message } from "../src/core/message.js";

describe("Agent", () => {
  it("maintains conversation history", async () => {
    const provider: ModelProvider = {
      async generate(messages: Message[]) {
        expect(messages).toHaveLength(2);

        return {
          content: "Node.js is a JavaScript runtime.",
          finishReason: "stop",
        };
      },
    };

    const agent = new Agent(provider);

    const response = await agent.run(
      "What is Node.js?",
    );

    expect(response).toBe(
      "Node.js is a JavaScript runtime.",
    );

    const history = agent.getMessages();

    expect(history).toHaveLength(3);
    expect(history[0]?.role).toBe("system");
    expect(history[1]?.role).toBe("user");
    expect(history[2]?.role).toBe("assistant");
  });

  it("preserves history across multiple requests", async () => {
    let callCount = 0;

    const provider: ModelProvider = {
      async generate() {
        callCount++;

        return {
          content: `Response ${callCount}`,
          finishReason: "stop",
        };
      },
    };

    const agent = new Agent(provider);

    await agent.run("First question");

    await agent.run("Second question");

    expect(agent.getMessages()).toHaveLength(5);
  });

  it("rolls back conversation state when the provider fails", async () => {
    const provider: ModelProvider = {
      async generate() {
        throw new Error("API unavailable");
      },
    };

    const agent = new Agent(provider);

    await expect(
      agent.run("Hello"),
    ).rejects.toThrow("API unavailable");

    expect(agent.getMessages()).toHaveLength(1);
  });

  it("resets conversation history", async () => {
    const provider: ModelProvider = {
      async generate() {
        return {
          content: "Hello!",
          finishReason: "stop",
        };
      },
    };

    const agent = new Agent(provider);

    await agent.run("Hello");

    agent.reset();

    const history = agent.getMessages();

    expect(history).toHaveLength(1);
    expect(history[0]?.role).toBe("system");
  });
});
