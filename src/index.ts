
import { loadConfig } from "./config.js";

import { Agent } from "./core/agent.js";

import { OpenAICompatibleProvider } from "./providers/openai-compatible-provider.js";

async function main() {
  const config = loadConfig();

  const provider = new OpenAICompatibleProvider({
    apiKey: config.apiKey,
    baseUrl: config.baseUrl,
    model: config.model,
    timeoutMs: config.timeoutMs,
  });

  const agent = new Agent(provider, {
    systemPrompt:
      "You are xbow, a helpful AI assistant. " +
      "Explain technical concepts clearly.",
  });

  const firstResponse = await agent.run(
    "What is Node.js?",
  );

  console.log("\nxbow:", firstResponse);

  const secondResponse = await agent.run(
    "How does its event loop work?",
  );

  console.log("\nxbow:", secondResponse);

  console.log("\nConversation history:");

  console.log(agent.getMessages());
}

main().catch((error: unknown) => {
  console.error("xbow encountered an error:", error);
  process.exitCode = 1;
});
