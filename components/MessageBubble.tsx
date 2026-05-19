import React from "react";

type MessageBubbleProps = {
  content: string;
  role: "user" | "assistant";
};

export function MessageBubble({ content, role }: MessageBubbleProps) {
  const isAssistant = role === "assistant";

  return (
    <div className="flex w-full">
      <div
        className={`flex w-full gap-4 ${
          isAssistant ? "items-start" : "items-center justify-end"
        }`}
      >
        {isAssistant && (
          <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-xs font-bold text-zinc-300">
            AI
          </div>
        )}

        <div
          className={`break-words whitespace-pre-wrap text-base leading-7 text-zinc-100 rounded-3xl px-5 py-4 ${
            isAssistant
              ? "max-w-full md:max-w-[calc(100%-3rem)] bg-zinc-900/90"
              : "max-w-[85%] md:max-w-[75%] bg-[#2f2f2f]"
          }`}
        >
          {content}
        </div>
      </div>
    </div>
  );
}
