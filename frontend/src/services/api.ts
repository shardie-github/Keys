import axios from 'axios';
import type {
  CompanionInput,
  PromptAssembly,
  AgentOutput,
  UserProfile,
  VibeConfig,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  // TODO: Add auth token from Supabase session
  return config;
});

export const apiService = {
  // Prompt Assembly
  async assemblePrompt(
    userId: string,
    taskDescription: string,
    vibeConfig: Partial<VibeConfig>
  ): Promise<PromptAssembly> {
    const response = await api.post('/assemble-prompt', {
      userId,
      taskDescription,
      vibeConfig,
    });
    return response.data;
  },

  // Agent Orchestration
  async orchestrateAgent(
    assembledPrompt: PromptAssembly,
    taskIntent: string,
    naturalLanguageInput: string
  ): Promise<AgentOutput> {
    const response = await api.post('/orchestrate-agent', {
      assembledPrompt,
      taskIntent,
      naturalLanguageInput,
    });
    return response.data;
  },

  // User Profile
  async getUserProfile(userId: string): Promise<UserProfile> {
    const response = await api.get(`/profiles/${userId}`);
    return response.data;
  },

  async updateUserProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<UserProfile> {
    const response = await api.patch(`/profiles/${userId}`, updates);
    return response.data;
  },

  // Vibe Config
  async getVibeConfig(userId: string): Promise<VibeConfig> {
    const response = await api.get(`/vibe-configs/${userId}`);
    return response.data;
  },

  async updateVibeConfig(
    userId: string,
    updates: Partial<VibeConfig>
  ): Promise<VibeConfig> {
    const response = await api.patch(`/vibe-configs/${userId}`, updates);
    return response.data;
  },

  // Feedback
  async submitFeedback(
    runId: string,
    feedback: 'approved' | 'rejected' | 'revised',
    detail?: string
  ): Promise<void> {
    await api.post('/feedback', {
      runId,
      feedback,
      detail,
    });
  },
};

export default api;
