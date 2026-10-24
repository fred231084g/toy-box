import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import type { Message } from "../../../model";
import { SessionMessageList } from "../MessageList";
import type { TranscriptView } from "../transcriptView";

test("a live background session displays a static background status instead of responding", () => {
  const markup = renderToStaticMarkup(
    <SessionMessageList
      messages={[{ role: "assistant", content: "Done" }]}
      isStreaming
      isWaiting={false}
      status="background"
      reasoningContent=""
      scrollToBottomRef={{ current: null }}
    />,
  );
  expect(markup).toContain("Background tasks running");
  expect(markup).toContain("lucide-layers");
  expect(markup).not.toContain("Responding");
});

test.each(["", "Partial answer"])(
  "renders an error card alongside assistant content %j",
  (content) => {
    const markup = renderToStaticMarkup(
      <SessionMessageList
        messages={[
          {
            role: "assistant",
            content,
            error:
              "**Usage limit exceeded.** Visit https://example.com/usage or [get help](https://example.com/help).",
          },
        ]}
        isStreaming={false}
        isWaiting={false}
        status="idle"
        reasoningContent=""
        scrollToBottomRef={{ current: null }}
      />,
    );
    expect(markup).toContain('role="alert"');
    expect(markup).toContain("lucide-triangle-alert");
    expect(markup).toContain('data-streamdown="strong">Usage limit exceeded.');
    expect(markup).toContain('href="https://example.com/usage"');
    expect(markup).toContain('href="https://example.com/help"');
    if (content) {
      expect(markup).toContain(content);
      expect(markup.indexOf(content)).toBeLessThan(markup.indexOf('role="alert"'));
    }
  },
);

test.each(["all", "responses"] as const)(
  "%s keeps assistant text and activity while only all shows reasoning",
  (view) => {
    const markup = renderTranscript([{ role: "assistant", content: "Latest response" }], view);
    expect(markup).toContain("Latest response");
    expect(markup).toContain("Reasoning");
    expect(markup.includes("Private reasoning content")).toBe(view === "all");
  },
);

test("responses filter hidden messages before windowing so a tool-only tail cannot hide conversation", () => {
  const messages: Message[] = [
    { role: "assistant", content: "Earlier response" },
    ...Array.from({ length: 25 }, (_, index): Message => ({
      role: "assistant",
      content: "",
      toolCalls: [{ id: `tool-${index}`, name: "hidden_tool", arguments: {} }],
    })),
  ];
  const markup = renderTranscript(messages, "responses");
  expect(markup).toContain("Earlier response");
  expect(markup).not.toContain("Hidden tool");
});

function renderTranscript(messages: Message[], view: TranscriptView): string {
  return renderToStaticMarkup(
    <SessionMessageList
      messages={messages}
      view={view}
      isStreaming
      isWaiting={false}
      status="reasoning"
      reasoningContent="Private reasoning content"
      scrollToBottomRef={{ current: null }}
    />,
  );
}
