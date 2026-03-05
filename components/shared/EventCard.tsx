'use client';

/**
 * EventCard Component
 * Card for displaying event items
 */
import { MapPin, Calendar, Users, Check, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { Event, User } from '@/lib/supabase/types';

interface EventCardProps {
  event: Event & {
    creator?: Pick<User, 'id' | 'first_name' | 'last_name' | 'avatar_url'> | null;
    participants?: Array<{
      id: string;
      response: 'pending' | 'going' | 'not_going';
      user?: Pick<User, 'id' | 'first_name' | 'last_name' | 'avatar_url'>;
    }>;
    userResponse?: 'pending' | 'going' | 'not_going';
    goingCount?: number;
    notGoingCount?: number;
  };
  onRespond?: (eventId: string, response: 'going' | 'not_going') => void;
  onClick?: (eventId: string) => void;
  className?: string;
}

export function EventCard({
  event,
  onRespond,
  onClick,
  className,
}: EventCardProps) {
  const eventDate = new Date(event.event_date);
  const isPast = eventDate < new Date();
  
  const formatDate = () => {
    return eventDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = () => {
    return eventDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const goingParticipants = event.participants?.filter((p) => p.response === 'going') || [];

  return (
    <div
      onClick={() => onClick?.(event.id)}
      className={cn(
        'kincircle-card cursor-pointer transition-all duration-200',
        'hover:shadow-card-hover',
        isPast && 'opacity-60',
        className
      )}
    >
      {/* Header with image placeholder */}
      {event.image_url && (
        <div className="mb-3 -mx-4 -mt-4 aspect-[16/9] rounded-t-xl overflow-hidden">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Title */}
      <h3 className="font-semibold text-text-primary text-lg mb-1">
        {event.title}
      </h3>

      {/* Date and time */}
      <div className="flex items-center gap-2 text-sm text-burgundy mb-2">
        <Calendar className="w-4 h-4" />
        <span>{formatDate()}</span>
        <span className="text-text-secondary">•</span>
        <span>{formatTime()}</span>
      </div>

      {/* Location */}
      {event.location && (
        <div className="flex items-center gap-2 text-sm text-text-secondary mb-3">
          <MapPin className="w-4 h-4" />
          <span className="truncate">{event.location}</span>
        </div>
      )}

      {/* Description */}
      {event.description && (
        <p className="text-sm text-text-secondary mb-3 line-clamp-2">
          {event.description}
        </p>
      )}

      {/* Participants preview */}
      {goingParticipants.length > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <div className="flex -space-x-2">
            {goingParticipants.slice(0, 5).map((p) => (
              <Avatar key={p.id} className="w-7 h-7 border-2 border-white">
                <AvatarImage src={p.user?.avatar_url || undefined} />
                <AvatarFallback className="text-xs bg-burgundy/10 text-burgundy">
                  {p.user?.first_name?.[0] || '?'}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <span className="text-xs text-text-secondary">
            {goingParticipants.length} going
            {event.notGoingCount && event.notGoingCount > 0 && (
              <> • {event.notGoingCount} not going</>
            )}
          </span>
        </div>
      )}

      {/* Response buttons */}
      {!isPast && event.userResponse && onRespond && (
        <div className="flex gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onRespond(event.id, 'going')}
            className={cn(
              'flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-colors',
              event.userResponse === 'going'
                ? 'bg-burgundy text-white'
                : 'bg-burgundy/10 text-burgundy hover:bg-burgundy/20'
            )}
          >
            <Check className="w-4 h-4" />
            Going
          </button>
          <button
            onClick={() => onRespond(event.id, 'not_going')}
            className={cn(
              'flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-colors',
              event.userResponse === 'not_going'
                ? 'bg-text-secondary text-white'
                : 'bg-card text-text-secondary hover:bg-text-secondary/20'
            )}
          >
            <X className="w-4 h-4" />
            Not Going
          </button>
        </div>
      )}

      {/* Creator */}
      {event.creator && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-divider">
          <Avatar className="w-5 h-5">
            <AvatarImage src={event.creator.avatar_url || undefined} />
            <AvatarFallback className="text-[8px] bg-burgundy/10 text-burgundy">
              {event.creator.first_name[0]}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-text-secondary">
            Created by {event.creator.first_name}
          </span>
        </div>
      )}
    </div>
  );
}
