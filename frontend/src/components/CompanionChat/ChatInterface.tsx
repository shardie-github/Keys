'use client';

import React, { useState, useRef, useEffect } from 'react';
import { InputPanel } from './InputPanel';
import { SuggestionCard } from '../OutputPanel/SuggestionCard';
import { usePromptAssembly } from '@/hooks/usePromptAssembly';
import { useAgentOrchestration } from '@/hooks/useAgentOrchestration';
import type { VibeConfig, AgentOutput } from '@/types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  output?: AgentOutput;
}

interface ChatInterfaceProps {
  userId: string;
  initialVibeConfig?: Partial<VibeConfig>;
}

export function ChatInterface({ userId, initialVibeConfig }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentVibeConfig, setCurrentVibeConfig] = useState<Partial<VibeConfig>>(
    initialVibeConfig || {}
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { assemblePrompt, loading: assembling } = usePromptAssembly();
  const { orchestrate, output, loading: orchestrating } = useAgentOrchestration();

  const loading = assembling || orchestrating;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (
    messageText: string,
    vibeConfig: Partial<VibeConfig>
  ) => {
    // Update vibe config
    setCurrentVibeConfig(vibeConfig);

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      // Assemble prompt
      const promptAssembly = await assemblePrompt(
        userId,
        messageText,
        vibeConfig
      );

      // Orchestrate agent
      const agentOutput = await orchestrate(
        promptAssembly,
        messageText,
        messageText
      );

      // Add assistant message with output
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: agentOutput.content as string,
        timestamp: new Date(),
        output: agentOutput,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg mb-2">Welcome to Hardonia AI Companion</p>
            <p className="text-sm">
              Adjust the sliders below and type your request to get started.
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-3xl rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              {message.output && (
                <div className="mt-4">
                  <SuggestionCard output={message.output} />
                </div>
              )}
              <p className="text-xs opacity-70 mt-2">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-4">
              <p className="text-gray-600">Thinking...</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Panel */}
      <InputPanel
        onSend={handleSend}
        initialVibeConfig={currentVibeConfig}
        loading={loading}
      />
    </div>
  );
}
