'use client';

import { ChatInterface } from '@/components/CompanionChat/ChatInterface';
import { useVibeConfig } from '@/hooks/useVibeConfig';

export default function ChatPage() {
  // TODO: Get userId from auth session
  const userId = 'demo-user'; // Replace with actual auth
  const { vibeConfig, loading } = useVibeConfig(userId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-200 bg-white p-4">
        <h1 className="text-xl font-bold">Cursor Venture Companion</h1>
        <p className="text-sm text-gray-600">Your AI cofounder for the entire product lifecycle</p>
      </header>
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          userId={userId}
          initialVibeConfig={vibeConfig || undefined}
        />
      </div>
    </div>
  );
}
