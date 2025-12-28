'use client';

import React, { useState, useEffect } from 'react';
import type { InputFilter, LLMProvider, InputStyle, OutputFormat } from '@/types/filters';

interface InputFiltersProps {
  onFilterChange: (filter: InputFilter) => void;
  initialFilter?: InputFilter;
  isPremium?: boolean;
}

export function InputFilters({ onFilterChange, initialFilter, isPremium = false }: InputFiltersProps) {
  const [filter, setFilter] = useState<InputFilter>(initialFilter || {});
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    onFilterChange(filter);
  }, [filter, onFilterChange]);

  const updateFilter = (updates: Partial<InputFilter>) => {
    setFilter((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3 sm:px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Input Filters</h3>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Provider Selection */}
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
            Provider
          </label>
          <select
            value={filter.provider || 'openai'}
            onChange={(e) => updateFilter({ provider: e.target.value as LLMProvider })}
            className="w-full px-2 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
          >
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
            <option value="google">Google</option>
            <option value="meta">Meta</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        {/* Model Selection */}
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
            Model
          </label>
          <select
            value={filter.model || ''}
            onChange={(e) => updateFilter({ model: e.target.value || undefined })}
            className="w-full px-2 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
          >
            {filter.provider === 'openai' && (
              <>
                <option value="">Auto</option>
                <option value="gpt-4-turbo-preview">GPT-4 Turbo</option>
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="o1-preview">O1 Preview</option>
              </>
            )}
            {filter.provider === 'anthropic' && (
              <>
                <option value="">Auto</option>
                <option value="claude-3-opus">Claude 3 Opus</option>
                <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                <option value="claude-3-haiku">Claude 3 Haiku</option>
              </>
            )}
            {filter.provider === 'google' && (
              <>
                <option value="">Auto</option>
                <option value="gemini-pro">Gemini Pro</option>
                <option value="gemini-ultra">Gemini Ultra</option>
              </>
            )}
            {filter.provider === 'meta' && (
              <>
                <option value="">Auto</option>
                <option value="llama-3">Llama 3</option>
                <option value="llama-2">Llama 2</option>
              </>
            )}
            {(!filter.provider || filter.provider === 'custom') && (
              <option value="">Auto</option>
            )}
          </select>
        </div>

        {/* Style Selection */}
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
            Style
          </label>
          <select
            value={filter.style || 'balanced'}
            onChange={(e) => updateFilter({ style: e.target.value as InputStyle })}
            className="w-full px-2 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
          >
            <option value="balanced">Balanced</option>
            <option value="concise">Concise</option>
            <option value="detailed">Detailed</option>
            <option value="technical">Technical</option>
            <option value="conversational">Conversational</option>
            <option value="structured">Structured</option>
            {isPremium && (
              <>
                <option value="prompt_engineering">Prompt Engineering</option>
                <option value="chain_of_thought">Chain of Thought</option>
                <option value="few_shot">Few-Shot</option>
              </>
            )}
          </select>
        </div>

        {/* Output Format */}
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
            Format
          </label>
          <select
            value={filter.outputFormat || 'markdown'}
            onChange={(e) => updateFilter({ outputFormat: e.target.value as OutputFormat })}
            className="w-full px-2 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
          >
            <option value="markdown">Markdown</option>
            <option value="plain_text">Plain Text</option>
            <option value="json">JSON</option>
            <option value="code">Code</option>
            {isPremium && (
              <>
                <option value="structured_prompt">Structured Prompt</option>
                <option value="provider_native">Provider Native</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="providerGuidelines"
              checked={filter.useProviderGuidelines || false}
              onChange={(e) => updateFilter({ useProviderGuidelines: e.target.checked })}
              className="rounded border-slate-300 dark:border-slate-600"
            />
            <label htmlFor="providerGuidelines" className="text-xs text-slate-600 dark:text-slate-400">
              Use Provider Guidelines
            </label>
          </div>

          {isPremium && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="promptEngineering"
                checked={filter.usePromptEngineering || false}
                onChange={(e) => updateFilter({ usePromptEngineering: e.target.checked })}
                className="rounded border-slate-300 dark:border-slate-600"
              />
              <label htmlFor="promptEngineering" className="text-xs text-slate-600 dark:text-slate-400">
                Advanced Prompt Engineering
              </label>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Temperature
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={filter.temperature || 0.7}
              onChange={(e) => updateFilter({ temperature: parseFloat(e.target.value) })}
              className="w-full"
            />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {filter.temperature?.toFixed(1) || '0.7'}
            </span>
          </div>

          {isPremium && (
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Max Tokens
              </label>
              <input
                type="number"
                min="100"
                max="32000"
                step="100"
                value={filter.maxTokens || ''}
                onChange={(e) =>
                  updateFilter({ maxTokens: e.target.value ? parseInt(e.target.value) : undefined })
                }
                placeholder="Auto"
                className="w-full px-2 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
