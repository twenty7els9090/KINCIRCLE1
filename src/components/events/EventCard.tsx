'use client'

import { useState } from 'react'
import {
  Calendar,
  MapPin,
  Users,
  Check,
  X,
  Clock,
  Trash2,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import type { Event, EventParticipant, User } from '@/lib/supabase/database.types'

interface EventWithParticipants extends Event {
  creator?: User
  participants?: (EventParticipant & { user?: User })[]
}

interface EventCardProps {
  event: EventWithParticipants
  currentUserId?: string
  onRespond?: (eventId: string, response: 'going' | 'not_going') => void
  onDelete?: (eventId: string) => void
}

export function EventCard({
  event,
  currentUserId,
  onRespond,
  onDelete,
}: EventCardProps) {
  const [isPressed, setIsPressed] = useState(false)

  const eventDate = new Date(event.event_date)
  const isPast = eventDate < new Date()
  
  // Get current user's response
  const currentUserParticipant = event.participants?.find(
    (p) => p.user_id === currentUserId
  )
  const userResponse = currentUserParticipant?.response || null

  // Get list of people going
  const goingParticipants = event.participants?.filter((p) => p.response === 'going') || []
  const goingCount = goingParticipants.length

  const isCreator = event.created_by === currentUserId

  // Gradient for events without image
  const getGradient = () => {
    return 'linear-gradient(135deg, #8B1E3F 0%, #A93B5C 50%, #C2587A 100%)'
  }

  return (
    <div
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={cn(
        'relative rounded-[20px] overflow-hidden',
        'transition-all duration-300 ease-out',
        isPressed && 'scale-[0.98]',
        isPast && 'opacity-70'
      )}
      style={{
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
        height: '280px',
      }}
    >
      {/* Background image/gradient */}
      <div className="absolute inset-0">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div 
            className="w-full h-full"
            style={{ background: getGradient() }}
          />
        )}
      </div>

      {/* Overlay gradient for text readability */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)'
        }}
      />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-between p-4">
        {/* Top row */}
        <div className="flex items-start justify-between">
          {/* Date badges */}
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm">
              <span className="text-sm font-medium text-white">
                {format(eventDate, 'd MMM', { locale: ru })}
              </span>
            </div>
            <div className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm">
              <span className="text-sm font-medium text-white">
                {format(eventDate, 'HH:mm')}
              </span>
            </div>
          </div>

          {/* Delete button for creator */}
          {isCreator && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(event.id)
              }}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 bg-white/20 backdrop-blur-sm"
            >
              <Trash2 className="w-4 h-4 text-white" />
            </button>
          )}
        </div>

        {/* Bottom content */}
        <div className="space-y-3">
          {/* Title */}
          <h3 className="text-2xl font-bold text-white drop-shadow-md">
            {event.title}
          </h3>

          {/* Location */}
          {event.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-white/70" />
              <span className="text-sm text-white/80">{event.location}</span>
            </div>
          )}

          {/* Going participants - show avatars and names */}
          {goingCount > 0 && (
            <div className="flex items-center gap-2">
              {/* Avatars stack */}
              <div className="flex -space-x-2">
                {goingParticipants.slice(0, 4).map((p) => (
                  <Avatar key={p.id} className="w-7 h-7 border-2 border-white/20">
                    <AvatarImage src={p.user?.avatar_url || undefined} />
                    <AvatarFallback className="bg-burgundy text-white text-xs">
                      {p.user?.first_name?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {goingCount > 4 && (
                  <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/20">
                    <span className="text-xs text-white font-medium">+{goingCount - 4}</span>
                  </div>
                )}
              </div>
              
              {/* Names */}
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                <Users className="w-4 h-4 text-white" />
                <span className="text-sm text-white">
                  {goingCount} {goingCount === 1 ? 'пойдёт' : goingCount < 5 ? 'пойдут' : 'пойдут'}
                </span>
              </div>
            </div>
          )}

          {/* Response buttons - always show for non-past events */}
          {!isPast && currentUserId && !isCreator && (
            <div className="flex gap-2 pt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onRespond?.(event.id, 'going')
                }}
                className={cn(
                  'flex items-center justify-center gap-1.5 px-4 py-2 rounded-full',
                  'text-sm font-medium transition-all duration-200',
                  'flex-1',
                  userResponse === 'going'
                    ? 'bg-white text-burgundy'
                    : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
                )}
              >
                <Check className="w-4 h-4" />
                Пойду
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onRespond?.(event.id, 'not_going')
                }}
                className={cn(
                  'flex items-center justify-center gap-1.5 px-4 py-2 rounded-full',
                  'text-sm font-medium transition-all duration-200',
                  'flex-1',
                  userResponse === 'not_going'
                    ? 'bg-red-500 text-white'
                    : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
                )}
              >
                <X className="w-4 h-4" />
                Не пойду
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
