
import type { Message } from "../core/message.js";

export interface GenerationOptions {
  temperature?: number;
  maxTokens?: number;
}

export interface ModelResponse {
  content: string | null; //null bcz there might just be tool call by model
  finishReason: string | null;
}

export interface ModelProvider {
  generate(
    messages: Message[],
    options?: GenerationOptions
  ): Promise<ModelResponse>; //bcz http communication to model is async we don't know when the model will respond 

}
