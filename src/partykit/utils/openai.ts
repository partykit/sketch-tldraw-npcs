import OpenAI from "openai";
import { OpenAIStream } from "ai";

export async function getChatCompletionResponse(
  env: Record<string, any>,
  chain: {
    role: "function" | "system" | "user" | "assistant";
    content: string | null;
  }[],
  onStartCallback: () => void,
  onTokenCallback: (token: string) => void
) {
  const openai = new OpenAI({
    organization: env.OPENAI_API_ORGANIZATION,
    apiKey: env.OPENAI_API_KEY,
  });

  const params: OpenAI.Chat.ChatCompletionCreateParams = {
    model: "gpt-3.5-turbo",
    stream: true,
    messages: chain,
  };

  const openaiResponse = await openai.chat.completions.create(params);

  const stream = OpenAIStream(openaiResponse, {
    onStart: async () => onStartCallback(),
    onToken: async (token) => onTokenCallback(token),
  });

  // @ts-ignore
  for await (const _ of stream) {
    // no-op, just read the stream, onToken callback above will handle the tokens
  }

  return null;
}
