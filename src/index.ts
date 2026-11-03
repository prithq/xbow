
import { loadConfig } from "./config.js";

import { OpenAICompatibleProvider } from "./providers/openai-compatible-provider.js";

import type { Message } from "./core/message.js";

async function main() {
  const config = loadConfig();

  const provider = new OpenAICompatibleProvider({
    apiKey: config.apiKey,
    baseUrl: config.baseUrl,
    model: config.model,
    timeoutMs: config.timeoutMs,
  });

  const messages: Message[] = [
    {
      role: "system",
      content: "You are a helpful assistant.",
    },
    {
      role: "user",
      content: "Explain how an HTTP server works in simple terms.",
    },
  ];

  const response = await provider.generate(messages);

  console.log("\nxbow response:\n");
  console.log(response.content);
  console.log("\nFinish reason:", response.finishReason);
}

main().catch((error: unknown) => {
  console.error("xbow encountered an error:", error);
  process.exitCode = 1;
});
