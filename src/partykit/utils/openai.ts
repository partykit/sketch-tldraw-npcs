import OpenAI from "openai";
import { OpenAIStream } from "ai";

export type AIMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;
export type AIFunction = OpenAI.Chat.ChatCompletionCreateParams.Function;

type Params = {
  env: Record<string, any>;
  messages: AIMessage[];
  functions?: any[];
  onStartCallback: () => void;
  onTokenCallback: (token: string) => void;
  onFunctionCall?: (name: string, args: any) => object;
};

export async function getChatCompletionResponse(params: Params) {
  const { env, messages, functions, onStartCallback, onTokenCallback } = params;
  const openai = new OpenAI({
    organization: env.OPENAI_API_ORGANIZATION,
    apiKey: env.OPENAI_API_KEY,
  });

  const openAIParams: OpenAI.Chat.ChatCompletionCreateParams = {
    model: "gpt-3.5-turbo",
    stream: true,
    messages,
    functions,
  };
  const openaiResponse = await openai.chat.completions.create(openAIParams);

  async function onFunctionCall(
    {
      name,
      arguments: args,
    }: { name: string; arguments: Record<string, unknown> },
    createFunctionCallMessages: any
  ) {
    // if you skip the function call and return nothing, the `function_call`
    // message will be sent to the client for it to handle
    console.log("onFunctionCall", name, JSON.stringify(args));
    const dataResponse = params.onFunctionCall!(name, args);
    console.log("dataResponse", JSON.stringify(dataResponse, null, 2));
    // `createFunctionCallMessages` constructs the relevant "assistant" and "function" messages for you
    const newMessages = await createFunctionCallMessages(dataResponse);
    return openai.chat.completions.create({
      messages: [...messages, ...newMessages],
      stream: true,
      model: "gpt-3.5-turbo-0613",
      // see "Recursive Function Calls" below
      functions,
    });
  }

  const stream = OpenAIStream(openaiResponse, {
    onStart: async () => onStartCallback(),
    onToken: async (token) => onTokenCallback(token),
    experimental_onFunctionCall: params.onFunctionCall
      ? async ({ name, arguments: args }, createFunctionCallMessages) =>
          onFunctionCall({ name, arguments: args }, createFunctionCallMessages)
      : undefined,
  });

  // @ts-ignore
  for await (const _ of stream) {
    // no-op, just read the stream, onToken callback above will handle the tokens
  }

  return null;
}
