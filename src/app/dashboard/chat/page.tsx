'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import ReactMarkdown from 'react-markdown';
import { DashboardHeader } from '@/src/components/dashboard-header';

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

export default function ChatPage() {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
    sendMessage({ text });
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background text-foreground">
      <div className="flex-none">
        <DashboardHeader
          breadcrumbs="TERMINAL"
          title="COMMUNICATION // AI ASSISTANT"
        />
      </div>

      <div className="flex flex-1 flex-col min-h-0">
        {/* Chat history placeholder - optional sidebar removed for consistency */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <p className="font-mono text-lg font-medium text-foreground">
                Asisten Toko ShikiPilot
              </p>
              <p className="mt-1 font-mono text-sm">
                Tanyakan tentang produk toko Anda. Saya akan menjawab berdasarkan
                katalog yang tersedia.
              </p>
            </div>
          )}

          {messages.map((message) => {
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
                    <div className="prose prose-sm max-w-none prose-invert prose-p:my-1 prose-ul:my-1 prose-li:my-0 font-mono text-sm text-foreground">
                      <ReactMarkdown>{text}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex justify-start">
              <div className="rounded-md border border-border bg-secondary px-4 py-2.5">
                <span className="font-mono text-sm text-muted-foreground">
                  Mengetik...
                  <span className="inline-flex gap-0.5 ml-1">
                    <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                  </span>
                </span>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="border-t border-destructive/50 bg-destructive/10 px-4 py-2">
            <p className="font-mono text-sm text-destructive">{error.message}</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="border-t border-border bg-card p-4"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanya tentang produk..."
              className="flex-1 rounded-md border border-border bg-secondary/50 px-4 py-2.5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
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
