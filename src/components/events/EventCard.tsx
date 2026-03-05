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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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

const MAX_VISIBLE_AVATARS = 5

export function EventCard({
  event,
  currentUserId,
  onRespond,
  onDelete,
}: EventCardProps) {
  const [isPressed, setIsPressed] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)

  const eventDate = new Date(event.event_date)
  const isPast = eventDate < new Date()
  
  const currentUserParticipant = event.participants?.find(
    (p) => p.user_id === currentUserId
  )
  const userResponse = currentUserParticipant?.response || null

  const goingParticipants = event.participants?.filter((p) => p.response === 'going') || []
  const goingCount = goingParticipants.length
  const notGoingParticipants = event.participants?.filter((p) => p.response === 'not_going') || []
  const notGoingCount = notGoingParticipants.length

  const isCreator = event.created_by === currentUserId

  const visibleParticipants = goingParticipants.slice(0, MAX_VISIBLE_AVATARS)
  const remainingCount = Math.max(0, goingCount - MAX_VISIBLE_AVATARS)

  const getGradient = () => {
    return 'linear-gradient(135deg, #3E000C 0%, #5C0013 50%, #7A001A 100%)'
  }

  return (
    <>
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
          boxShadow: '0 8px 20px rgba(62, 0, 12, 0.15)',
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
            background: 'linear-gradient(to top, rgba(62, 0, 12, 0.9) 0%, rgba(62, 0, 12, 0.4) 50%, transparent 100%)'
          }}
        />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-between p-4">
          {/* Top row */}
          <div className="flex items-start justify-between">
            {/* Date badges */}
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-full bg-[#FFECD1]/20 backdrop-blur-sm">
                <span className="text-sm font-medium text-[#FFECD1]">
                  {format(eventDate, 'd MMM', { locale: ru })}
                </span>
              </div>
              <div className="px-3 py-1.5 rounded-full bg-[#FFECD1]/20 backdrop-blur-sm">
                <span className="text-sm font-medium text-[#FFECD1]">
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
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 bg-[#FFECD1]/20 backdrop-blur-sm"
              >
                <Trash2 className="w-4 h-4 text-[#FFECD1]" />
              </button>
            )}
          </div>

          {/* Bottom content */}
          <div className="space-y-3">
            {/* Title */}
            <h3 className="text-2xl font-bold text-[#FFECD1] drop-shadow-md">
              {event.title}
            </h3>

            {/* Location */}
            {event.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#FFECD1]/70" />
                <span className="text-sm text-[#FFECD1]/80">{event.location}</span>
              </div>
            )}

            {/* Going participants */}
            {goingCount > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowParticipants(true)
                }}
                className="flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                {/* Avatars stack */}
                <div className="flex -space-x-2">
                  {visibleParticipants.map((p) => (
                    <Avatar key={p.id} className="w-7 h-7 border-2 border-[#3E000C]">
                      <AvatarImage src={p.user?.avatar_url || undefined} />
                      <AvatarFallback 
                        className="text-xs"
                        style={{ backgroundColor: '#FFECD1', color: '#3E000C' }}
                      >
                        {p.user?.first_name?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {remainingCount > 0 && (
                    <div className="w-7 h-7 rounded-full bg-[#FFECD1]/20 backdrop-blur-sm flex items-center justify-center border-2 border-[#3E000C]">
                      <span className="text-xs text-[#FFECD1] font-medium">+{remainingCount}</span>
                    </div>
                  )}
                </div>
                
                {/* Count */}
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#FFECD1]/20 backdrop-blur-sm">
                  <Users className="w-4 h-4 text-[#FFECD1]" />
                  <span className="text-sm text-[#FFECD1]">
                    {goingCount} {goingCount === 1 ? 'пойдёт' : 'пойдут'}
                  </span>
                </div>
              </button>
            )}

            {/* Response buttons */}
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
                  )}
                  style={{
                    backgroundColor: userResponse === 'going' ? '#FFECD1' : 'rgba(255, 236, 209, 0.2)',
                    color: userResponse === 'going' ? '#3E000C' : '#FFECD1',
                    backdropFilter: userResponse !== 'going' ? 'blur(8px)' : 'none',
                  }}
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
                  )}
                  style={{
                    backgroundColor: userResponse === 'not_going' ? '#EF4444' : 'rgba(255, 236, 209, 0.2)',
                    color: '#FFECD1',
                    backdropFilter: userResponse !== 'not_going' ? 'blur(8px)' : 'none',
                  }}
                >
                  <X className="w-4 h-4" />
                  Не пойду
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Participants Modal */}
      <Dialog open={showParticipants} onOpenChange={setShowParticipants}>
        <DialogContent 
          className="max-w-sm border-0"
          style={{ 
            borderRadius: '20px',
            backgroundColor: '#f5fffa',
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-[#3E000C]">Участники</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Going */}
            {goingCount > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-[#3E000C]">
                  <div 
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#DCFCE7' }}
                  >
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="font-medium">Пойдут ({goingCount})</span>
                </div>
                <div className="space-y-1">
                  {goingParticipants.map((p) => (
                    <div 
                      key={p.id} 
                      className="flex items-center gap-3 p-2 rounded-xl"
                      style={{ backgroundColor: '#FFFFFF' }}
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={p.user?.avatar_url || undefined} />
                        <AvatarFallback 
                          style={{ backgroundColor: '#3E000C', color: '#f5fffa' }}
                        >
                          {p.user?.first_name?.[0]?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-[#3E000C]">
                          {p.user?.first_name} {p.user?.last_name}
                        </p>
                        {p.user?.username && (
                          <p className="text-sm text-[#3E000C]/60">@{p.user.username}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Not going */}
            {notGoingCount > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-[#3E000C]">
                  <div 
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#FEE2E2' }}
                  >
                    <X className="w-3 h-3 text-red-600" />
                  </div>
                  <span className="font-medium">Не пойдут ({notGoingCount})</span>
                </div>
                <div className="space-y-1">
                  {notGoingParticipants.map((p) => (
                    <div 
                      key={p.id} 
                      className="flex items-center gap-3 p-2 rounded-xl"
                      style={{ backgroundColor: '#FFFFFF' }}
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={p.user?.avatar_url || undefined} />
                        <AvatarFallback 
                          style={{ backgroundColor: '#3E000C', color: '#f5fffa' }}
                        >
                          {p.user?.first_name?.[0]?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-[#3E000C]">
                          {p.user?.first_name} {p.user?.last_name}
                        </p>
                        {p.user?.username && (
                          <p className="text-sm text-[#3E000C]/60">@{p.user.username}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {goingCount === 0 && notGoingCount === 0 && (
              <p className="text-center text-[#3E000C]/60 py-4">
                Пока никто не ответил
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
