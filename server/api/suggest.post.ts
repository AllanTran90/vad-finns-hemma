import Anthropic from "@anthropic-ai/sdk";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const config = useRuntimeConfig(event);

  const client = new Anthropic({ apiKey: config.anthropicApiKey });

  const message = await client.messages.create({
    model: "claude-haiku-5-5",
    max_tokens: 500,
    messages: [{ role: "user", content: "Säg Hej! hur mår du? på mandarin" }],
  });

  return { received: body, answer: message.content };
});
