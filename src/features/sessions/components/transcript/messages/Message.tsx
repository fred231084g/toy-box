import type { Message as SessionTranscriptMessage } from "../../../model";
import { AssistantMessage } from "./AssistantMessage";
import { SessionUserMessage } from "./SessionUserMessage";
import { SystemMessage } from "./SystemMessage";

export function Message({
  message,
  isStreaming,
  isBusy = isStreaming,
  isLast,
}: {
  message: SessionTranscriptMessage;
  isStreaming: boolean;
  isBusy?: boolean;
  isLast: boolean;
}) {
  if (message.role === "user") return <SessionUserMessage message={message} />;
  if (message.role === "system") return <SystemMessage message={message} />;

  return (
    <AssistantMessage message={message} isStreaming={isStreaming} isBusy={isBusy} isLast={isLast} />
  );
}
