/**
 * Onboarding State Machine
 * 
 * Manages the multi-step onboarding flow with validation, async submission, and error handling.
 */

import { createMachine, assign, fromPromise } from 'xstate';
import type { UserProfile } from '@/types';

/**
 * Context for the onboarding machine
 */
export interface OnboardingMachineContext {
  userId: string;
  currentStep: number;
  totalSteps: number;
  profile: Partial<UserProfile>;
  error?: string;
  retryCount: number;
}

/**
 * Events for the onboarding machine
 */
export type OnboardingMachineEvent =
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'UPDATE_PROFILE'; updates: Partial<UserProfile> }
  | { type: 'SUBMIT' }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SUBMIT_ERROR'; error?: string }
  | { type: 'RETRY' }
  | { type: 'RESET' }
  | { type: 'SKIP' };

/**
 * Onboarding state machine
 * 
 * States:
 * - welcome: Initial welcome screen
 * - limitations: What we cannot do
 * - role: Role and vertical selection
 * - stack: Tech stack selection
 * - brand: Brand and context (optional)
 * - complete: Completion screen
 * - submitting: Async profile creation
 * - success: Profile created successfully
 * - error: Submission failed
 */
export const onboardingMachine = createMachine(
  {
    id: 'onboarding',
    initial: 'welcome',
    context: {
      userId: '',
      currentStep: 0,
      totalSteps: 6,
      profile: {},
      retryCount: 0,
    } as OnboardingMachineContext,
    types: {
      context: {} as OnboardingMachineContext,
      events: {} as OnboardingMachineEvent,
    },
    states: {
      welcome: {
        on: {
          NEXT: {
            target: 'limitations',
            actions: assign({
              currentStep: () => 1,
            }),
          },
          SKIP: {
            target: 'complete',
            actions: assign({
              currentStep: () => 5,
            }),
          },
        },
      },
      limitations: {
        on: {
          NEXT: {
            target: 'role',
            actions: assign({
              currentStep: () => 2,
            }),
          },
          PREV: {
            target: 'welcome',
            actions: assign({
              currentStep: () => 0,
            }),
          },
          SKIP: {
            target: 'complete',
            actions: assign({
              currentStep: () => 5,
            }),
          },
        },
      },
      role: {
        on: {
          NEXT: {
            target: 'stack',
            actions: assign({
              currentStep: () => 3,
            }),
          },
          PREV: {
            target: 'limitations',
            actions: assign({
              currentStep: () => 1,
            }),
          },
          SKIP: {
            target: 'complete',
            actions: assign({
              currentStep: () => 5,
            }),
          },
          UPDATE_PROFILE: {
            actions: assign({
              profile: ({ context, event }) => ({
                ...context.profile,
                ...event.updates,
              }),
            }),
          },
        },
      },
      stack: {
        on: {
          NEXT: {
            target: 'brand',
            actions: assign({
              currentStep: () => 4,
            }),
          },
          PREV: {
            target: 'role',
            actions: assign({
              currentStep: () => 2,
            }),
          },
          SKIP: {
            target: 'complete',
            actions: assign({
              currentStep: () => 5,
            }),
          },
          UPDATE_PROFILE: {
            actions: assign({
              profile: ({ context, event }) => ({
                ...context.profile,
                ...event.updates,
              }),
            }),
          },
        },
      },
      brand: {
        on: {
          NEXT: {
            target: 'complete',
            actions: assign({
              currentStep: () => 5,
            }),
          },
          PREV: {
            target: 'stack',
            actions: assign({
              currentStep: () => 3,
            }),
          },
          SKIP: {
            target: 'complete',
            actions: assign({
              currentStep: () => 5,
            }),
          },
          UPDATE_PROFILE: {
            actions: assign({
              profile: ({ context, event }) => ({
                ...context.profile,
                ...event.updates,
              }),
            }),
          },
        },
      },
      complete: {
        on: {
          SUBMIT: {
            target: 'submitting',
            guard: 'isProfileValid',
          },
          PREV: {
            target: 'brand',
            actions: assign({
              currentStep: () => 4,
            }),
          },
        },
      },
      submitting: {
        invoke: {
          id: 'submitProfile',
          src: 'submitProfileData',
          onDone: {
            target: 'success',
          },
          onError: {
            target: 'error',
            actions: assign({
              error: ({ event }) => {
                const error = event.error as Error | undefined;
                return error?.message || 'Failed to create profile';
              },
              retryCount: ({ context }) => context.retryCount + 1,
            }),
          },
        },
      },
      success: {
        type: 'final',
      },
      error: {
        on: {
          RETRY: {
            target: 'submitting',
            guard: 'canRetry',
            actions: assign({
              error: () => undefined,
            }),
          },
          PREV: {
            target: 'complete',
            actions: assign({
              currentStep: () => 5,
              error: () => undefined,
            }),
          },
        },
      },
    },
  },
  {
    guards: {
      isProfileValid: ({ context }) => {
        return Boolean(context.profile.user_id);
      },
      canRetry: ({ context }) => {
        return context.retryCount < 3;
      },
    },
    actors: {
      submitProfileData: fromPromise(async () => {
        // This will be provided by the component that uses the machine
        // The actual submission logic is handled by the parent component
        throw new Error('submitProfileData actor must be provided');
      }),
    },
  }
);
