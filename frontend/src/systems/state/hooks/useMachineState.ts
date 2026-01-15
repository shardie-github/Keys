'use client';

/**
 * useMachineState
 * 
 * Thin wrapper hook for consuming state machines in UI components.
 * Provides ergonomic access to machine state and actions.
 */

import { useMachine } from '@xstate/react';
import { useMemo } from 'react';
import { useSelector } from '@xstate/react';
import type { AnyActorRef, AnyStateMachine, EventObject } from 'xstate';

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

type ActorRefLike = Pick<AnyActorRef, 'subscribe' | 'getSnapshot' | 'send'>;

/**
 * Hook for reading an actor ref's snapshot (XState v5).
 *
 * This is intentionally lightweight: it exposes the snapshot + a send wrapper,
 * plus a few convenience booleans when the snapshot supports `matches()`.
 */
export function useActorState<TActor extends ActorRefLike, TEvent extends EventObject = EventObject>(
  actorRef: TActor
) {
  const snapshot = useSelector(actorRef, (s) => s);

  const value = useMemo(() => {
    const machineState = snapshot as unknown as MachineState;
    return {
      state: snapshot,
      send: (event: TEvent) => actorRef.send(event),
      service: actorRef,
      // Convenience getters (when supported)
      isIdle: machineState.matches?.('idle') ?? false,
      isLoading:
        machineState.matches?.('loading') ||
        machineState.matches?.('pending') ||
        machineState.matches?.('submitting') ||
        false,
      isError: machineState.matches?.('error') ?? false,
      isSuccess: machineState.matches?.('success') ?? false,
      context: machineState.context ?? {},
      value: machineState.value,
    };
  }, [snapshot, actorRef]);

  return value;
}
