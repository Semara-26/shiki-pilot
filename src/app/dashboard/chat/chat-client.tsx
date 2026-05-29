"use client";

import { useState, useRef, useEffect, memo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { Loader2, TrashIcon } from "lucide-react";
import { DashboardHeader } from "@/src/components/dashboard-header";
import { saveMessage } from "@/src/lib/actions/chat";
import { PhantomSkeleton } from "@/src/components/ui/phantom-skeleton";

export type UIMessageLike = {
  id: string;
  role: "user" | "assistant" | "system";
  parts: Array<{ type: "text"; text: string }>;
};

function getMessageText(parts: unknown[] | undefined): string {
  if (!Array.isArray(parts)) return "";
  return parts
    .filter(
      (p): p is { type: string; text?: string } =>
        p != null &&
        typeof p === "object" &&
        "type" in p &&
        (p as { type: string }).type === "text",
    )
    .map((p) => (p.text ?? "") as string)
    .join("");
}

// ─── SDK AI v5 Part Types ─────────────────────────────────────────────────────
// Vercel AI SDK v5 menyimpan tool invocations di message.parts, BUKAN di
// message.toolInvocations. State-nya juga berbeda:
//   'input-streaming'  → AI sedang menggenerate argumen (partial-call)
//   'input-available'  → Argumen sudah lengkap, tool belum dieksekusi
//   'output-available' → Tool sudah selesai, hasil tersedia
// Data args ada di part.input, BUKAN part.args.

type ToolPartState =
  | "input-streaming"
  | "input-available"
  | "output-available"
  | "approval-requested"
  | "approval-responded";

// ─── Helpers ───────────────────────────────────────────────────────────────────────────

// ─── ToolThinkingBubble ───────────────────────────────────────────────────────
// memo dipulihkan untuk stabilitas.

const ToolThinkingBubble = memo(function ToolThinkingBubble({
  parts,
}: {
  parts: unknown[];
}) {
  const [textIndex, setTextIndex] = useState(0);

  const loadingTexts = [
    "Menyiapkan asisten AI...",
    "Membuka catatan gudang...",
    "Mencocokkan data produk...",
    "Menghitung kalkulasi angka...",
    "Menyusun jawaban untukmu...",
    "Tunggu sebentar, mengamankan data...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [loadingTexts.length]);

  // Filter hanya tool-call untuk menghindari duplicate key
  const toolCalls = parts.filter((p): p is Record<string, unknown> => {
    if (typeof p !== "object" || p === null) return false;
    const type =
      typeof (p as Record<string, unknown>).type === "string"
        ? (p as Record<string, unknown>).type
        : "";
    return type === "tool-call" || type === "dynamic-tool";
  });

  // Ambil tool-result jika ada
  const toolResults = parts.filter((p): p is Record<string, unknown> => {
    if (typeof p !== "object" || p === null) return false;
    return (p as Record<string, unknown>).type === "tool-result";
  });

  if (toolCalls.length === 0) return null;

  return (
    <div className="flex justify-start mt-1">
      <div className="max-w-[85%] space-y-1.5">
        {toolCalls.map((part, index) => {
          const resultPart = toolResults.find(
            (r) => r.toolCallId === part.toolCallId,
          );
          const isFinished = !!resultPart || part.state === "output-available";

          let resultText = "";
          if (
            resultPart &&
            "result" in resultPart &&
            typeof resultPart.result === "string"
          ) {
            resultText = resultPart.result;
          }

          return (
            <div
              key={
                typeof part.toolCallId === "string"
                  ? `${part.toolCallId}-${index}`
                  : `tool-${index}`
              }
              className="flex flex-col gap-1.5 rounded-md border border-primary/30 bg-secondary/60 px-3 py-2 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2.5">
                {isFinished ? (
                  <svg
                    className="h-4 w-4 text-green-500 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />
                )}

                <span
                  key={isFinished ? "finished" : textIndex}
                  className={`font-mono text-xs font-medium ${isFinished ? "text-green-600/90 dark:text-green-400/90" : "text-muted-foreground"} animate-in fade-in slide-in-from-left-1 duration-500`}
                >
                  {isFinished ? `Selesai: Berhasil` : loadingTexts[textIndex]}
                </span>
              </div>

              {!isFinished && (
                <div className="mt-3 flex flex-col gap-2 w-full pr-4">
                  <PhantomSkeleton className="h-4 w-full rounded-sm" />
                  <PhantomSkeleton className="h-4 w-[90%] rounded-sm" />
                  <PhantomSkeleton className="h-4 w-[75%] rounded-sm" />
                </div>
              )}

              {/* Tampilkan result teks jika ada untuk respon kilat tanpa LLM */}
              {resultText && (
                <div className="mt-1 ml-6 text-sm text-foreground/90 font-medium">
                  {resultText}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

// ─── AssistantBubble ──────────────────────────────────────────────────────────
// Menangani satu pesan assistant: tool thinking + teks jawaban.
// memo dipulihkan untuk stabilitas UI.

const markdownComponents = {
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="mb-3 ml-5 list-disc space-y-1 last:mb-0">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="mb-3 ml-5 list-decimal space-y-1 last:mb-0">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="leading-relaxed">{children}</li>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-white">{children}</strong>
  ),
  em: ({ children }: { children?: React.ReactNode }) => (
    <em className="italic text-gray-300">{children}</em>
  ),
  code: ({ children }: { children?: React.ReactNode }) => (
    <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-gray-100">
      {children}
    </code>
  ),
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="mb-2 mt-4 text-lg font-semibold text-white first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="mb-2 mt-3 text-base font-semibold text-white first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="mb-1 mt-2 text-sm font-semibold text-white first:mt-0">
      {children}
    </h3>
  ),
};

interface AssistantBubbleProps {
  message: {
    id: string;
    parts?: unknown[];
  };
}

const AssistantBubble = memo(function AssistantBubble({
  message,
}: AssistantBubbleProps) {
  const parts = message.parts ?? [];
  const text = getMessageText(parts);

  // Cek apakah ada tool parts (aktif ATAU sudah selesai)
  const hasToolParts = parts.some((p) => {
    if (typeof p !== "object" || p === null) return false;
    const type =
      typeof (p as Record<string, unknown>).type === "string"
        ? (p as Record<string, unknown>).type
        : "";
    return type === "tool-call" || type === "dynamic-tool";
  });

  return (
    <div className="flex flex-col gap-1">
      {/* 1. Tool indicators — selalu tampil selama ada tool parts (aktif maupun selesai) */}
      {hasToolParts && <ToolThinkingBubble parts={parts} />}

      {/* 2. Teks jawaban (hanya tampil jika ada konten) */}
      {text.length > 0 && (
        <div className="flex justify-start">
          <div className="max-w-[85%] rounded-md border border-border bg-secondary px-4 py-2.5 text-foreground">
            <div className="font-sans text-base leading-relaxed text-gray-200">
              <ReactMarkdown components={markdownComponents}>
                {text}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

// ─── ChatClient ───────────────────────────────────────────────────────────────

interface ChatClientProps {
  chatId: string;
  initialMessages: UIMessageLike[];
}

export function ChatClient({ chatId, initialMessages }: ChatClientProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pendingUserMessage, setPendingUserMessage] = useState<string | null>(
    null,
  );

  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- UIMessageLike compatible with UIMessage at runtime
    messages: initialMessages as any,
    onFinish: async ({ message, isAbort, isDisconnect, isError }) => {
      if (isAbort || isDisconnect || isError) return;
      const text = getMessageText(message.parts);
      if (!text) return;
      await saveMessage(chatId, "assistant", text);
    },
  });

  const handleClearChat = () => {
    if (messages.length === 0) return;
    setMessages([]);
  };

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, pendingUserMessage]);

  if (pendingUserMessage != null) {
    const last = messages[messages.length - 1];
    if (
      last?.role === "user" &&
      getMessageText(last.parts) === pendingUserMessage
    ) {
      // Adjusting state during render is a valid React pattern to prevent cascading effects.
      // React will safely bail out of the current render and retry with the new state instantly.
      setPendingUserMessage(null);
    }
  }

  const [persistentError, setPersistentError] = useState<Error | null>(null);
  const [prevError, setPrevError] = useState<Error | undefined>(error);

  if (error !== prevError) {
    setPrevError(error);
    if (error) setPersistentError(error);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    setPersistentError(null);
    setPendingUserMessage(text);
    await saveMessage(chatId, "user", text);
    sendMessage({ text });
  };

  // Text Cycling untuk Global Loading
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const loadingTexts = [
    "Menyiapkan asisten AI...",
    "Membuka catatan gudang...",
    "Mencocokkan data produk...",
    "Menghitung kalkulasi angka...",
    "Menyusun jawaban untukmu...",
    "Tunggu sebentar, mengamankan data...",
  ];

  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setLoadingTextIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isLoading, loadingTexts.length]);

  // Build display list — termasuk optimistic user message
  const lastMessage = messages[messages.length - 1];
  const isLastAssistant = lastMessage?.role === "assistant";
  const lastMessageText = getMessageText(lastMessage?.parts);

  const showOptimisticUser =
    pendingUserMessage != null &&
    (messages.length === 0 ||
      !isLastAssistant ||
      lastMessageText !== pendingUserMessage);

  // Deteksi Fase Optimistic UI
  // Kita berada di fase optimistik jika ini pesan asisten, belum ada teks, TAPI sudah ada tool-result.
  const hasToolResult =
    isLastAssistant &&
    Array.isArray(lastMessage.parts) &&
    lastMessage.parts.some(
      (p) =>
        typeof p === "object" &&
        p !== null &&
        (p as Record<string, unknown>).type === "tool-result",
    );

  const isOptimisticPhase =
    isLoading &&
    isLastAssistant &&
    lastMessageText.length === 0 &&
    hasToolResult;
  const showGlobalLoading =
    isLoading &&
    (lastMessage?.role === "user" ||
      showOptimisticUser ||
      (isLastAssistant && lastMessageText.length === 0 && !hasToolResult));

  const displayMessages = [...messages];
  if (showOptimisticUser) {
    displayMessages.push({
      id: "optimistic-user",
      role: "user",
      parts: [{ type: "text", text: pendingUserMessage }],
    } as (typeof messages)[0]);
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white dark:bg-[#0a0a0a] text-foreground">
      <div className="flex-none flex justify-between items-center pr-4">
        <DashboardHeader breadcrumbs="TERMINAL" title="AI ASSISTANT" />
        <button
          onClick={handleClearChat}
          disabled={messages.length === 0}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all duration-200 shrink-0"
          title="Bersihkan Chat"
        >
          <TrashIcon className="w-3.5 h-3.5" />
          Bersihkan Chat
        </button>
      </div>

      <div className="flex flex-1 flex-col min-h-0 bg-white dark:bg-[#0a0a0a]">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Empty state */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="font-mono text-lg font-black text-ink dark:text-white">
                Asisten Toko ShikiPilot
              </p>
              <p className="mt-1 font-mono text-sm text-gray-600 dark:text-gray-400">
                Tanyakan tentang produk toko Anda. Saya akan menjawab
                berdasarkan katalog yang tersedia.
              </p>
            </div>
          )}

          {/* Message list */}
          {displayMessages.map((message) => {
            const isUser = message.role === "user";

            if (isUser) {
              const text = getMessageText(message.parts);
              return (
                <div key={message.id} className="flex justify-end">
                  <div className="max-w-[85%] rounded-md px-4 py-2.5 bg-primary text-primary-foreground">
                    <p className="font-mono text-sm whitespace-pre-wrap">
                      {text}
                    </p>
                  </div>
                </div>
              );
            }

            // Assistant — delegate ke AssistantBubble (handle toolInvocations + text)
            return (
              <AssistantBubble
                key={message.id}
                message={message as AssistantBubbleProps["message"]}
              />
            );
          })}

          {/* Global loading dots & Optimistic UI */}
          {(showGlobalLoading || isOptimisticPhase) && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-md border border-border bg-secondary px-4 py-2.5 text-foreground shadow-sm">
                <div className="flex items-center gap-2.5">
                  {isOptimisticPhase ? (
                    <>
                      <svg
                        className="h-4 w-4 text-green-500 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="font-mono text-xs font-medium text-green-600/90 dark:text-green-400/90 animate-in fade-in duration-500">
                        ✅ Data gudang berhasil diperbarui! Sedang merapikan
                        laporan untukmu...
                      </span>
                    </>
                  ) : (
                    <>
                      <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />
                      <span
                        key={loadingTextIndex}
                        className="font-mono text-xs font-medium text-muted-foreground animate-in fade-in duration-500"
                      >
                        {loadingTexts[loadingTextIndex]}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Custom Error State */}
          {persistentError &&
            (() => {
              const msg = persistentError.message?.toLowerCase() || "";
              const isTraffic =
                msg.includes("503") ||
                msg.includes("429") ||
                msg.includes("high demand") ||
                msg.includes("quota");

              const title = isTraffic
                ? "🚦 Jalur AI Sedang Padat!"
                : "🔌 Ups, Ada Gangguan Koneksi!";
              const content = isTraffic ? (
                <>
                  &quot;Otak AI ShikiPilot lagi melayani banyak antrean nih.
                  Tapi tenang aja, datamu aman! Kalau kamu tadi minta ubah stok,
                  sistem kemungkinan besar sudah mencatatnya di gudang. Boleh
                  tunggu 1 menitan, lalu coba cek stoknya lagi ya?&quot;
                </>
              ) : (
                <>
                  &quot;Sistem kesulitan memproses permintaanmu. Pastikan
                  koneksi internet stabil atau coba refresh halaman ini
                  ya.&quot;
                </>
              );

              return (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-orange-800 shadow-sm mb-4">
                    <h4 className="font-semibold text-sm mb-1">{title}</h4>
                    <p className="text-sm leading-relaxed">{content}</p>
                  </div>
                </div>
              );
            })()}
        </div>

        {/* Input form */}
        <form
          onSubmit={handleSubmit}
          className="border-t-2 border-ink dark:border-white/10 bg-white dark:bg-surface-dark p-4"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanya tentang produk..."
              className="flex-1 rounded-md border-2 border-ink dark:border-white/20 bg-paper dark:bg-[#0a0a0a] px-4 py-2.5 font-mono text-sm text-ink dark:text-white placeholder:text-gray-500 focus:outline-none focus:border-primary dark:focus:border-primary transition-colors"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="rounded-md bg-primary px-5 py-2.5 font-mono text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:pointer-events-none disabled:opacity-60"
            >
              Kirim
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
