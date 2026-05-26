import OpenAI, { toFile } from "openai";

export type AIProvider = "groq" | "nim";

const PROVIDER_CONFIG: Record<
  AIProvider,
  { baseURL: string; apiKeyEnv: string; chatModel: string; whisperModel: string }
> = {
  groq: {
    baseURL: "https://api.groq.com/openai/v1",
    apiKeyEnv: "GROQ_API_KEY",
    chatModel: "llama-3.3-70b-versatile",
    whisperModel: "whisper-large-v3",
  },
  nim: {
    baseURL: "https://integrate.api.nvidia.com/v1",
    apiKeyEnv: "NIM_API_KEY",
    chatModel: "meta/llama-3.3-70b-instruct",
    whisperModel: "whisper-large-v3",
  },
};

function getPrimaryProvider(): AIProvider {
  const env = process.env.AI_PRIMARY_PROVIDER as AIProvider;
  return env === "nim" ? "nim" : "groq";
}

function createClient(provider: AIProvider): OpenAI | null {
  const config = PROVIDER_CONFIG[provider];
  const apiKey = process.env[config.apiKeyEnv];
  if (!apiKey) return null;
  return new OpenAI({ apiKey, baseURL: config.baseURL });
}

export function getAvailableProviders(): AIProvider[] {
  return (["groq", "nim"] as AIProvider[]).filter(
    (p) => !!process.env[PROVIDER_CONFIG[p].apiKeyEnv]
  );
}

export function getChatModel(provider: AIProvider = getPrimaryProvider()): string {
  return PROVIDER_CONFIG[provider].chatModel;
}

export function getWhisperModel(provider: AIProvider = getPrimaryProvider()): string {
  return PROVIDER_CONFIG[provider].whisperModel;
}

export async function withProviderFallback<T>(
  fn: (client: OpenAI, provider: AIProvider) => Promise<T>
): Promise<T> {
  const primary = getPrimaryProvider();
  const fallback: AIProvider = primary === "groq" ? "nim" : "groq";
  const order = [primary, fallback].filter(
    (p, i, arr) => arr.indexOf(p) === i
  );

  let lastError: Error | null = null;

  for (const provider of order) {
    const client = createClient(provider);
    if (!client) continue;
    try {
      return await fn(client, provider);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      const status = (err as { status?: number }).status;
      if (status === 429 || status === 503) continue;
      throw lastError;
    }
  }

  throw lastError ?? new Error("No AI provider configured. Set GROQ_API_KEY or NIM_API_KEY.");
}

export async function transcribeAudio(
  audioBuffer: Buffer,
  filename = "audio.webm"
): Promise<string> {
  return withProviderFallback(async (client, provider) => {
    const file = await toFile(audioBuffer, filename, { type: "audio/webm" });
    const response = await client.audio.transcriptions.create({
      file,
      model: getWhisperModel(provider),
      language: "en",
    });
    return response.text;
  });
}

export async function createChatCompletion(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  options?: {
    tools?: OpenAI.Chat.ChatCompletionTool[];
    stream?: boolean;
    temperature?: number;
  }
) {
  return withProviderFallback(async (client, provider) => {
    return client.chat.completions.create({
      model: getChatModel(provider),
      messages,
      tools: options?.tools,
      stream: false as const,
      temperature: options?.temperature ?? 0.7,
    });
  });
}

export async function createStreamingChatCompletion(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  options?: {
    tools?: OpenAI.Chat.ChatCompletionTool[];
    temperature?: number;
  }
) {
  return withProviderFallback(async (client, provider) => {
    return client.chat.completions.create({
      model: getChatModel(provider),
      messages,
      tools: options?.tools,
      stream: true,
      temperature: options?.temperature ?? 0.7,
    });
  });
}
