/**
 * useMachineState
 * 
 * Thin wrapper hook for consuming state machines in UI components.
 * Provides ergonomic access to machine state and actions.
 */

import { useMachine, useActor } from '@xstate/react';
import { useMemo } from 'react';
import type { ActorRef, AnyActorLogic } from 'xstate';

/**
 * Hook for using a state machine
 * 
 * @param machine - The state machine definition
 * @param options - Options for the machine
 * @returns Machine state, send function, and service
 */
export function useMachineState(
  machine: Parameters<typeof useMachine>[0],
  options?: Parameters<typeof useMachine>[1]
) {
  const [state, send, service] = useMachine(machine, options);

  const value = useMemo(() => {
    const stateValue = state.value;
    const matches = (value: string | string[]) => {
      if (typeof stateValue === 'string') {
        return stateValue === value || (Array.isArray(value) && value.includes(stateValue));
      }
      if (typeof stateValue === 'object' && stateValue !== null) {
        return Object.keys(stateValue).some(key => {
          const nestedValue = (stateValue as Record<string, unknown>)[key];
          return nestedValue === value || (Array.isArray(value) && value.includes(nestedValue as string));
        });
      }
      return false;
    };

    return {
      state,
      send,
      service,
      // Convenience getters
      isIdle: matches('idle'),
      isLoading: matches('loading') || matches('pending') || matches('submitting'),
      isError: matches('error'),
      isSuccess: matches('success'),
      // Context access
      context: state.context,
      // Current state value
      value: stateValue,
    };
  }, [state, send, service]);

  return value;
}

/**
 * Hook for using an actor ref
 * 
 * @param actorRef - The actor ref from a parent machine
 * @returns Actor state, send function, and service
 */
export function useActorState(actorRef: AnyActorLogic | ActorRef<unknown, unknown>) {
  const [state, send] = useActor(actorRef as AnyActorLogic);

  const value = useMemo(() => {
    const stateValue = state.value;
    const matches = (value: string | string[]) => {
      if (typeof stateValue === 'string') {
        return stateValue === value || (Array.isArray(value) && value.includes(stateValue));
      }
      if (typeof stateValue === 'object' && stateValue !== null) {
        return Object.keys(stateValue).some(key => {
          const nestedValue = (stateValue as Record<string, unknown>)[key];
          return nestedValue === value || (Array.isArray(value) && value.includes(nestedValue as string));
        });
      }
      return false;
    };

    return {
      state,
      send,
      // Convenience getters
      isIdle: matches('idle'),
      isLoading: matches('loading') || matches('pending') || matches('submitting'),
      isError: matches('error'),
      isSuccess: matches('success'),
      // Context access
      context: state.context,
      // Current state value
      value: stateValue,
    };
  }, [state, send]);

  return value;
}
