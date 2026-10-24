import { codePlugins, Markdown } from "@/shared/ui/markdown";
import { TriangleAlert } from "lucide-react";
import type { AssistantMessage as AssistantMessageType } from "../../../model";
import { transcriptLinkComponents, transcriptRehypePlugins } from "./TranscriptFileLink";
import { ToolCallMessage } from "./tools/ToolCallMessage";

export function AssistantMessage({
  message,
  isStreaming,
  isBusy = isStreaming,
  isLast,
}: {
  message: AssistantMessageType;
  isStreaming: boolean;
  isBusy?: boolean;
  isLast: boolean;
}) {
  const toolCalls = message.toolCalls ?? [];
  if (!message.content && !toolCalls.length && !message.error) return null;

  return (
    <div className="flex justify-start">
      <div className="max-w-full @md:max-w-[80%]">
        <div className="space-y-2">
          {/* Response text (intermediate or final) */}
          {message.content && (
            <Markdown
              mode="streaming"
              isAnimating={isLast && isBusy}
              plugins={codePlugins}
              components={transcriptLinkComponents}
              rehypePlugins={transcriptRehypePlugins}
              className="text-sm"
            >
              {message.content}
            </Markdown>
          )}

          {/* (Optional) Tool calls */}
          {toolCalls.length > 0 && (
            <div className="space-y-2">
              {toolCalls.map((toolCall) => (
                <ToolCallMessage
                  key={toolCall.id}
                  toolCall={toolCall}
                  isActive={isStreaming && toolCall.result === undefined}
                />
              ))}
            </div>
          )}

          {/* (Optional) Agent error (e.g. rate limits hit) */}
          {message.error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm"
            >
              <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-amber-500" />
              <Markdown linkSafety={{ enabled: false }} className="min-w-0 break-words">
                {message.error}
              </Markdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
