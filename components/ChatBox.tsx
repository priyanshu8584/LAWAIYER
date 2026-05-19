"use client";

import { FormEvent, useEffect, useState } from "react";
import { ChatMessage, ChatSession } from "@/types";
import { MessageBubble } from "./MessageBubble";
import { UploadBox } from "./UploadBox";
import { toast } from "sonner";

export function ChatBox() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    async function loadSessions() {
      try {
        const response = await fetch("/api/chat/sessions", {
          cache: "no-store",
        });
        const result = (await response.json()) as { sessions?: ChatSession[] };

        if (response.ok && result.sessions) {
          setSessions(result.sessions);

          if (!activeSessionId && result.sessions[0]?.id) {
            setActiveSessionId(result.sessions[0].id);
          }
        }
      } catch {
        // Keep chat usable even if session bootstrap fails.
      }
    }

    void loadSessions();
  }, [activeSessionId]);

  useEffect(() => {
    async function loadMessages() {
      if (!activeSessionId) {
        setMessages([]);
        return;
      }

      try {
        const response = await fetch(`/api/chat?sessionId=${activeSessionId}`, {
          cache: "no-store",
        });
        const result = (await response.json()) as { messages?: ChatMessage[] };

        if (response.ok && result.messages) {
          setMessages(result.messages);
        }
      } catch {
        // Ignore session load failures and let user continue.
      }
    }

    void loadMessages();
  }, [activeSessionId]);

  async function createNewChat() {
    try {
      const response = await fetch("/api/chat/sessions", {
        method: "POST",
      });
      const result = (await response.json()) as { session?: ChatSession };

      if (response.ok && result.session) {
        setSessions((current) => [result.session!, ...current]);
        setActiveSessionId(result.session.id);
        setMessages([]);
        setShowUpload(false);
      }
    } catch {
      toast.error("Unable to create a new chat.");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = message.trim();
    if (!trimmed) {
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      sessionId: activeSessionId,
    };

    setMessages((current) => [...current, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: trimmed, sessionId: activeSessionId || undefined }),
      });

      const result = (await response.json()) as {
        answer?: string;
        error?: string;
        sessionId?: string;
      };

      if (!response.ok || !result.answer) {
        toast.error(result.error ?? "Chat request failed.");
        return;
      }

      if (result.sessionId && !activeSessionId) {
        setActiveSessionId(result.sessionId);
      }

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: result.answer ?? "",
          sessionId: result.sessionId,
        },
      ]);

      const refreshedSessions = await fetch("/api/chat/sessions", {
        cache: "no-store",
      });
      const refreshedResult =
        (await refreshedSessions.json()) as { sessions?: ChatSession[] };
      if (refreshedSessions.ok && refreshedResult.sessions) {
        setSessions(refreshedResult.sessions);
        if (result.sessionId) {
          setActiveSessionId(result.sessionId);
        }
      }
    } catch {
      toast.error("Unable to reach the chat endpoint.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col overflow-hidden md:flex-row">
      {/* Sidebar */}
      <aside className="flex w-full flex-shrink-0 flex-col border-b border-zinc-800 bg-[#171717] md:w-[260px] md:border-b-0 md:border-r">
        <div className="p-3">
          <button
            type="button"
            onClick={() => {
              createNewChat();
            }}
            className="flex w-full items-center gap-3 rounded-lg bg-zinc-800 px-3 py-3 text-sm font-medium text-zinc-200 transition hover:bg-zinc-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 sm:px-4 sm:py-3">
          {sessions.length === 0 ? (
            <div className="px-2 py-3 text-xs text-zinc-500">
              No chats yet.
            </div>
          ) : (
            sessions.map((session) => (
              <button
                key={session.id}
                type="button"
                onClick={() => {
                  setActiveSessionId(session.id);
                  setShowUpload(false);
                }}
                className={`block w-full rounded-lg px-3 py-2.5 text-left transition ${
                  activeSessionId === session.id && !showUpload
                    ? "bg-zinc-800 text-zinc-100"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                }`}
              >
                <p className="truncate text-sm font-medium">{session.title}</p>
              </button>
            ))
          )}
        </div>

        <div className="p-3 border-t border-zinc-800">
          <button
            type="button"
            onClick={() => setShowUpload(true)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
              showUpload
                ? "bg-zinc-800 text-zinc-100"
                : "text-zinc-300 hover:bg-zinc-800 hover:text-zinc-200"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Knowledge Base
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex flex-1 flex-col relative bg-[#212121]">
        {showUpload ? (
          <div className="flex-1 overflow-y-auto flex justify-center py-16 px-4 sm:px-6">
            <div className="w-full max-w-2xl">
              <UploadBox />
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-8 flex flex-col items-center sm:px-6 sm:py-10">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                  <h1 className="text-3xl font-semibold text-zinc-200 mb-4">Law AI</h1>
                  <p>How can I help you with your legal documents today?</p>
                </div>
              ) : (
                <div className="w-full max-w-3xl space-y-6">
                  {messages.map((entry) => (
                    <MessageBubble key={entry.id} {...entry} />
                  ))}
                </div>
              )}
            </div>

            <div className="w-full max-w-3xl mx-auto px-4 pb-6 pt-2">
              <form
                onSubmit={handleSubmit}
                className="relative flex items-end rounded-3xl bg-[#2f2f2f] shadow-[0_0_15px_rgba(0,0,0,0.1)] border border-zinc-700/50 focus-within:border-zinc-500 focus-within:ring-1 focus-within:ring-zinc-500 transition-all duration-200"
              >
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      // Submit form programmatically
                      const form = e.currentTarget.form;
                      if (form) {
                        form.requestSubmit();
                      }
                    }
                  }}
                  placeholder="Message Law AI..."
                  className="w-full min-h-[52px] max-h-48 resize-none bg-transparent px-5 py-3.5 pr-12 text-[15px] leading-6 text-zinc-100 outline-none placeholder:text-zinc-500"
                  rows={1}
                />
                <button
                  type="submit"
                  disabled={isLoading || !message.trim()}
                  className="absolute right-3 bottom-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-zinc-900 transition hover:bg-zinc-300 disabled:opacity-40 disabled:hover:bg-zinc-200"
                >
                  {isLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="12" y1="19" x2="12" y2="5"></line>
                      <polyline points="5 12 12 5 19 12"></polyline>
                    </svg>
                  )}
                </button>
              </form>
              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-zinc-500">
                <span>Law AI can make mistakes. Consider verifying important information.</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
