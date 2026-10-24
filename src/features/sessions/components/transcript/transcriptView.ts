import type { Message } from "../../model";
import type { Settings } from "@workspace/model/config/settings";

export type TranscriptView = Settings["defaultSessionView"];

/** Questions and their answers are conversation, even though providers carry them as tool calls. */
export function messagesInView(messages: Message[], view: TranscriptView): Message[] {
  if (view === "all") return messages;

  return messages.flatMap<Message>((message) => {
    if (message.role === "user") return [message];
    if (message.role === "system") return [];

    const toolCalls = message.toolCalls?.filter((toolCall) => toolCall.question);
    return message.content || message.error || toolCalls?.length ? [{ ...message, toolCalls }] : [];
  });
}
