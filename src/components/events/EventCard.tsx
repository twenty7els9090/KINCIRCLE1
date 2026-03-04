'use client'

import { useState } from 'react'
import {
  Calendar,
  MapPin,
  Users,
  Check,
  X,
  Clock,
  MoreVertical,
  Trash2,
  Edit,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  onEdit?: (eventId: string) => void
  onDelete?: (eventId: string) => void
  onClick?: (eventId: string) => void
}

export function EventCard({
  event,
  currentUserId,
  onRespond,
  onEdit,
  onDelete,
  onClick,
}: EventCardProps) {
  const [isPressed, setIsPressed] = useState(false)

  const eventDate = new Date(event.event_date)
  const isPast = eventDate < new Date()
  
  // Get current user's response
  const currentUserParticipant = event.participants?.find(
    (p) => p.user_id === currentUserId
  )
  const userResponse = currentUserParticipant?.response || 'pending'

  // Count responses
  const goingCount = event.participants?.filter((p) => p.response === 'going').length || 0
  const notGoingCount = event.participants?.filter((p) => p.response === 'not_going').length || 0
  const pendingCount = event.participants?.filter((p) => p.response === 'pending').length || 0

  const isCreator = event.created_by === currentUserId

  return (
    <div
      onClick={() => onClick?.(event.id)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={cn(
        'bg-[#F8F5F5] rounded-2xl overflow-hidden transition-all duration-200',
        'hover:shadow-card cursor-pointer',
        isPressed && 'scale-[0.98]',
        isPast && 'opacity-60'
      )}
    >
      {/* Event image */}
      {event.image_url && (
        <div className="aspect-[16/9] overflow-hidden">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h4 className="font-medium text-[#1C1C1E]">{event.title}</h4>
            {event.description && (
              <p className="text-sm text-[#8E8E93] mt-1 line-clamp-2">
                {event.description}
              </p>
            )}
          </div>

          {/* Actions menu for creator */}
          {isCreator && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-[#8E8E93]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit(event.id)
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Редактировать
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(event.id)
                    }}
                    className="text-red-500"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Удалить
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Date and location */}
        <div className="flex flex-wrap gap-3 mt-3">
          <div className="flex items-center gap-1.5 text-sm text-[#8E8E93]">
            <Calendar className="w-4 h-4 text-burgundy" />
            <span>{format(eventDate, 'd MMM, EEEE', { locale: ru })}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-[#8E8E93]">
            <Clock className="w-4 h-4 text-burgundy" />
            <span>{format(eventDate, 'HH:mm')}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-1.5 text-sm text-[#8E8E93]">
              <MapPin className="w-4 h-4 text-burgundy" />
              <span>{event.location}</span>
            </div>
          )}
        </div>

        {/* Participants preview */}
        {event.participants && event.participants.length > 0 && (
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {event.participants.slice(0, 5).map((p) => (
                  <Avatar key={p.id} className="w-6 h-6 border-2 border-white">
                    <AvatarImage src={p.user?.avatar_url || undefined} />
                    <AvatarFallback className="bg-burgundy text-white text-[10px]">
                      {p.user?.first_name?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {event.participants.length > 5 && (
                  <div className="w-6 h-6 rounded-full bg-[#F0E8E8] flex items-center justify-center text-[10px] text-[#8E8E93] border-2 border-white">
                    +{event.participants.length - 5}
                  </div>
                )}
              </div>
              <div className="flex gap-1">
                {goingCount > 0 && (
                  <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700">
                    {goingCount} идёт
                  </Badge>
                )}
                {notGoingCount > 0 && (
                  <Badge variant="secondary" className="text-[10px] bg-red-100 text-red-700">
                    {notGoingCount} не идёт
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Response buttons */}
        {!isPast && currentUserId && (
          <div className="flex gap-2 mt-3">
            <Button
              variant={userResponse === 'going' ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'flex-1',
                userResponse === 'going' && 'bg-green-500 hover:bg-green-600'
              )}
              onClick={(e) => {
                e.stopPropagation()
                onRespond?.(event.id, 'going')
              }}
            >
              <Check className="w-4 h-4 mr-1" />
              Пойду
            </Button>
            <Button
              variant={userResponse === 'not_going' ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'flex-1',
                userResponse === 'not_going' && 'bg-red-500 hover:bg-red-600'
              )}
              onClick={(e) => {
                e.stopPropagation()
                onRespond?.(event.id, 'not_going')
              }}
            >
              <X className="w-4 h-4 mr-1" />
              Не пойду
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
