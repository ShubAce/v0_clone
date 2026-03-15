export function lastAssistantTextMessageContent(result: any) {
  if (!result?.output || !Array.isArray(result.output) || result.output.length === 0) {
    return undefined;
  }

  const lastAssistantTextMessageIndex = result.output.findLastIndex(
    (message: any) => message.role === "assistant"
  );

  if (lastAssistantTextMessageIndex === -1) return undefined;

  const message = result.output[lastAssistantTextMessageIndex];

  return message?.content
    ? typeof message.content === "string"
      ? message.content
      : message.content.map((c: any) => c.text).join("")
    : undefined;
}