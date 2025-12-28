import { useState } from 'react';
import { apiService } from '@/services/api';
import type { PromptAssembly, AgentOutput } from '@/types';

export function useAgentOrchestration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [output, setOutput] = useState<AgentOutput | null>(null);

  const orchestrate = async (
    assembledPrompt: PromptAssembly,
    taskIntent: string,
    naturalLanguageInput: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.orchestrateAgent(
        assembledPrompt,
        taskIntent,
        naturalLanguageInput
      );
      setOutput(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to orchestrate agent');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    orchestrate,
    output,
    loading,
    error,
  };
}
