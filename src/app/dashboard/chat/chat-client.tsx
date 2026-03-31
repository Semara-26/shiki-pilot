'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { DashboardHeader } from '@/src/components/dashboard-header';
import { saveMessage } from '@/src/lib/actions/chat';

const AI_ERROR_MESSAGE =
  'Maaf, asisten AI sedang mengalami gangguan koneksi. Silakan coba beberapa saat lagi.';

export type UIMessageLike = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  parts: Array<{ type: 'text'; text: string }>;
};

function getMessageText(parts: unknown[] | undefined): string {
  if (!Array.isArray(parts)) return '';
  return parts
    .filter(
      (p): p is { type: string; text?: string } =>
        p != null &&
        typeof p === 'object' &&
        'type' in p &&
        (p as { type: string }).type === 'text'
    )
    .map((p) => (p.text ?? '') as string)
    .join('');
}

interface ChatClientProps {
  chatId: string;
  initialMessages: UIMessageLike[];
}

export function ChatClient({ chatId, initialMessages }: ChatClientProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pendingUserMessage, setPendingUserMessage] = useState<string | null>(null);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- UIMessageLike compatible with UIMessage at runtime
    messages: initialMessages as any,
    onFinish: async ({ message, isAbort, isDisconnect, isError }) => {
      if (isAbort || isDisconnect || isError) return;
      const text = getMessageText(message.parts);
      if (!text) return;
      await saveMessage(chatId, 'assistant', text);
    },
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, pendingUserMessage]);

  useEffect(() => {
    if (pendingUserMessage == null) return;
    const last = messages[messages.length - 1];
    if (last?.role === 'user' && getMessageText(last.parts) === pendingUserMessage) {
      setPendingUserMessage(null);
    }
  }, [messages, pendingUserMessage]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || AI_ERROR_MESSAGE, {
        duration: 5000,
      });
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
    setPendingUserMessage(text);

    await saveMessage(chatId, 'user', text);
    sendMessage({ text });
  };

  const lastMessage = messages[messages.length - 1];
  const showOptimisticUser =
    pendingUserMessage != null &&
    (messages.length === 0 ||
      lastMessage?.role !== 'user' ||
      getMessageText(lastMessage.parts) !== pendingUserMessage);
  const displayMessages = [...messages];
  if (showOptimisticUser) {
    displayMessages.push({
      id: 'optimistic-user',
      role: 'user',
      parts: [{ type: 'text', text: pendingUserMessage }],
    } as (typeof messages)[0]);
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white dark:bg-[#0a0a0a] text-foreground">
      <div className="flex-none">
        <DashboardHeader
          breadcrumbs="TERMINAL"
          title="COMMUNICATION // AI ASSISTANT"
        />
      </div>

      <div className="flex flex-1 flex-col min-h-0 bg-white dark:bg-[#0a0a0a]">
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="font-mono text-lg font-black text-ink dark:text-white">
                Asisten Toko ShikiPilot
              </p>
              <p className="mt-1 font-mono text-sm text-gray-600 dark:text-gray-400">
                Tanyakan tentang produk toko Anda. Saya akan menjawab berdasarkan
                katalog yang tersedia.
              </p>
            </div>
          )}

          {displayMessages.map((message) => {
            const text = getMessageText(message.parts);
            const isUser = message.role === 'user';
            return (
              <div
                key={message.id}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-md px-4 py-2.5 ${
                    isUser
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary border border-border text-foreground'
                  }`}
                >
                  {isUser ? (
                    <p className="font-mono text-sm whitespace-pre-wrap">{text}</p>
                  ) : (
                    <div className="font-sans text-base leading-relaxed text-gray-200">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => (
                            <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>
                          ),
                          ul: ({ children }) => (
                            <ul className="mb-3 ml-5 list-disc space-y-1 last:mb-0">{children}</ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="mb-3 ml-5 list-decimal space-y-1 last:mb-0">{children}</ol>
                          ),
                          li: ({ children }) => (
                            <li className="leading-relaxed">{children}</li>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold text-white">{children}</strong>
                          ),
                          em: ({ children }) => (
                            <em className="italic text-gray-300">{children}</em>
                          ),
                          code: ({ children }) => (
                            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-gray-100">
                              {children}
                            </code>
                          ),
                          h1: ({ children }) => (
                            <h1 className="mb-2 mt-4 text-lg font-semibold text-white first:mt-0">{children}</h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="mb-2 mt-3 text-base font-semibold text-white first:mt-0">{children}</h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="mb-1 mt-2 text-sm font-semibold text-white first:mt-0">{children}</h3>
                          ),
                        }}
                      >
                        {text}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (lastMessage?.role === 'user' || showOptimisticUser) && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-md border border-border bg-secondary px-4 py-2.5 text-foreground shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 overflow-hidden">
                    <span
                      className="h-2 w-2 rounded-full bg-primary animate-pulse"
                      style={{ animationDelay: '0ms' }}
                    />
                    <span
                      className="h-2 w-2 rounded-full bg-primary animate-pulse"
                      style={{ animationDelay: '200ms' }}
                    />
                    <span
                      className="h-2 w-2 rounded-full bg-primary animate-pulse"
                      style={{ animationDelay: '400ms' }}
                    />
                  </span>
                  <span className="font-mono text-xs font-medium text-muted-foreground animate-in fade-in slide-in-from-left-1 duration-300">
                    ShikiPilot AI sedang memproses...
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

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
