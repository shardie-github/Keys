/**
 * useMachineState
 * 
 * Thin wrapper hook for consuming state machines in UI components.
 * Provides ergonomic access to machine state and actions.
 */

import { useMachine, useActor } from '@xstate/react';
import { useMemo } from 'react';
import type { ActorRefFrom, AnyStateMachine, EventObject, StateFrom, AnyActorRef } from 'xstate';

interface MachineState {
  matches: (state: string) => boolean;
  context: Record<string, unknown>;
  value: unknown;
}

/**
 * Hook for using a state machine
 * 
 * @param machine - The state machine definition
 * @param options - Options for the machine
 * @returns Machine state, send function, and service
 */
export function useMachineState<TMachine extends AnyStateMachine>(
  machine: TMachine,
  options?: Parameters<typeof useMachine<TMachine>>[1]
) {
  const [state, send, service] = useMachine(machine, options);

  const value = useMemo(() => {
    const machineState = state as unknown as MachineState;
    return {
      state,
      send,
      service,
      // Convenience getters
      isIdle: machineState.matches('idle'),
      isLoading: machineState.matches('loading') || machineState.matches('pending') || machineState.matches('submitting'),
      isError: machineState.matches('error'),
      isSuccess: machineState.matches('success'),
      // Context access
      context: machineState.context,
      // Current state value
      value: machineState.value,
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
export function useActorState<TEvent extends EventObject = EventObject>(
  actorRef: ActorRefFrom<AnyStateMachine> | { send: (event: TEvent) => void; getSnapshot: () => MachineState }
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [state, send] = useActor(actorRef as any);

  const value = useMemo(() => {
    const machineState = state as unknown as MachineState;
    return {
      state,
      send,
      // Convenience getters
      isIdle: machineState.matches?.('idle') ?? false,
      isLoading: machineState.matches?.('loading') || machineState.matches?.('pending') || machineState.matches?.('submitting') || false,
      isError: machineState.matches?.('error') ?? false,
      isSuccess: machineState.matches?.('success') ?? false,
      // Context access
      context: machineState.context,
      // Current state value
      value: machineState.value,
    };
  }, [state, send]);

  return value;
}
