import { getOrCreateChat, getChatHistory } from '@/src/lib/actions/chat';
import { ChatClient, type UIMessageLike } from './chat-client';
import { DashboardHeader } from '@/src/components/dashboard-header';

function dbMessagesToUIMessages(
  rows: { id: string; role: string; content: string }[]
): UIMessageLike[] {
  return rows
    .filter((r) => r.role === 'user' || r.role === 'assistant')
    .map((r) => ({
      id: r.id,
      role: r.role as 'user' | 'assistant',
      parts: [{ type: 'text' as const, text: r.content }],
    }));
}

export default async function ChatPage() {
  const chatResult = await getOrCreateChat();
  if ('error' in chatResult) {
    return (
      <div className="flex h-full flex-col overflow-hidden bg-white dark:bg-[#0a0a0a] text-foreground">
        <div className="flex-none">
          <DashboardHeader
            breadcrumbs="TERMINAL"
            title="COMMUNICATION // AI ASSISTANT"
          />
        </div>
        <div className="flex flex-1 items-center justify-center p-4">
          <p className="font-mono text-sm text-destructive">{chatResult.error}</p>
        </div>
      </div>
    );
  }

  const { chatId } = chatResult;
  const historyResult = await getChatHistory(chatId);
  const initialMessages: UIMessageLike[] =
    'messages' in historyResult
      ? dbMessagesToUIMessages(historyResult.messages)
      : [];

  return <ChatClient chatId={chatId} initialMessages={initialMessages} />;
}
