'use client';

import React from 'react';
import { useBackgroundEvents } from '@/hooks/useBackgroundEvents';
import { formatRelativeTime } from '@/utils/format';
import type { BackgroundEvent } from '@/types';

interface EventFeedProps {
  userId: string;
  maxEvents?: number;
}

export function EventFeed({ userId, maxEvents = 50 }: EventFeedProps) {
  const { events, loading, error } = useBackgroundEvents(userId);

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>Error loading events: {error.message}</p>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No events yet. Events will appear here as they occur.</p>
      </div>
    );
  }

  const displayEvents = events.slice(0, maxEvents);

  const getEventIcon = (source: BackgroundEvent['source']) => {
    switch (source) {
      case 'code_repo':
        return '📦';
      case 'issue_tracker':
        return '🎫';
      case 'ci_cd':
        return '⚙️';
      case 'infra':
        return '🏗️';
      case 'metrics':
        return '📊';
      case 'schedule':
        return '📅';
      default:
        return '📌';
    }
  };

  const getEventColor = (source: BackgroundEvent['source']) => {
    switch (source) {
      case 'code_repo':
        return 'bg-green-100 text-green-800';
      case 'issue_tracker':
        return 'bg-blue-100 text-blue-800';
      case 'ci_cd':
        return 'bg-yellow-100 text-yellow-800';
      case 'infra':
        return 'bg-purple-100 text-purple-800';
      case 'metrics':
        return 'bg-indigo-100 text-indigo-800';
      case 'schedule':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-2">
      {displayEvents.map((event) => (
        <div
          key={event.id}
          className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <span className="text-2xl">{getEventIcon(event.source)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${getEventColor(
                      event.source
                    )}`}
                  >
                    {event.source}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {event.event_type}
                  </span>
                </div>
                {event.event_data && (
                  <p className="text-sm text-gray-600 truncate">
                    {JSON.stringify(event.event_data).substring(0, 100)}
                    {JSON.stringify(event.event_data).length > 100 ? '...' : ''}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-gray-500">
                    {formatRelativeTime(event.created_at)}
                  </span>
                  {event.suggestion_generated && (
                    <span className="text-xs text-primary-600 font-medium">
                      ✓ Suggestion generated
                    </span>
                  )}
                  {event.user_actioned && (
                    <span className="text-xs text-green-600 font-medium">
                      ✓ Actioned
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
