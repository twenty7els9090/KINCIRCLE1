'use client'

import { useState } from 'react'
import {
  Gift,
  ExternalLink,
  Lock,
  Check,
  Trash2,
  Link,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WishlistItem } from '@/lib/supabase/database.types'

interface WishlistCardProps {
  item: WishlistItem
  isOwner: boolean
  currentUserId?: string
  onBook?: (itemId: string) => void
  onUnbook?: (itemId: string) => void
  onDelete?: (itemId: string) => void
}

export function WishlistCard({
  item,
  isOwner,
  currentUserId,
  onBook,
  onUnbook,
  onDelete,
}: WishlistCardProps) {
  const [isPressed, setIsPressed] = useState(false)

  const isBookedByMe = item.booked_by === currentUserId
  const canBook = !isOwner && !item.is_booked
  const canUnbook = isBookedByMe

  // Get gradient for background
  const getGradient = () => {
    if (item.is_booked) {
      return 'linear-gradient(135deg, #8E8E93 0%, #AEAEB2 100%)'
    }
    return 'linear-gradient(135deg, #D4809A 0%, #E4A8BA 50%, #F0D0D9 100%)'
  }

  return (
    <div
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={cn(
        'relative rounded-[20px] overflow-hidden',
        'transition-all duration-300 ease-out',
        'cursor-pointer',
        isPressed && 'scale-[0.98]',
        item.is_booked && 'opacity-80'
      )}
      style={{
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
        height: '220px',
      }}
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{ background: getGradient() }}
      >
        {/* Gift icon pattern */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Gift className="w-24 h-24 text-white/20" />
        </div>
      </div>

      {/* Overlay gradient for text readability */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)'
        }}
      />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-between p-4">
        {/* Top row */}
        <div className="flex items-start justify-between">
          {/* Booked badge */}
          {item.is_booked && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm">
              <Lock className="w-3.5 h-3.5 text-white" />
              <span className="text-xs font-medium text-white">
                {isBookedByMe ? 'Ваше' : 'Забронировано'}
              </span>
            </div>
          )}

          {/* Delete button for owner */}
          {isOwner && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(item.id)
              }}
              className={cn(
                'w-9 h-9 rounded-full',
                'flex items-center justify-center',
                'transition-all duration-200',
                'hover:scale-110 active:scale-95',
                'bg-white/20 backdrop-blur-sm'
              )}
            >
              <Trash2 className="w-4 h-4 text-white" />
            </button>
          )}
        </div>

        {/* Bottom content */}
        <div className="space-y-2">
          {/* Title */}
          <h3 className="text-2xl font-bold text-white drop-shadow-md">
            {item.title}
          </h3>

          {/* Description */}
          {item.description && (
            <p className="text-sm text-white/80 line-clamp-2">
              {item.description}
            </p>
          )}

          {/* Link */}
          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-sm text-white/80 hover:text-white transition-colors"
            >
              <Link className="w-3.5 h-3.5" />
              <span>Ссылка</span>
            </a>
          )}

          {/* Action button */}
          <div className="flex justify-end pt-2">
            {!isOwner && (
              item.is_booked ? (
                canUnbook && onUnbook && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onUnbook(item.id)
                    }}
                    className={cn(
                      'flex items-center gap-2 px-5 py-2.5 rounded-full',
                      'text-sm font-medium transition-all duration-200',
                      'active:scale-95',
                      'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
                    )}
                  >
                    <Lock className="w-4 h-4" />
                    <span>Отменить</span>
                  </button>
                )
              ) : (
                canBook && onBook && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onBook(item.id)
                    }}
                    className={cn(
                      'flex items-center gap-2 px-5 py-2.5 rounded-full',
                      'text-sm font-medium transition-all duration-200',
                      'active:scale-95',
                      'bg-white text-burgundy'
                    )}
                  >
                    <Gift className="w-4 h-4" />
                    <span>Забронировать</span>
                  </button>
                )
              )
            )}

            {/* Owner view - booked indicator */}
            {isOwner && item.is_booked && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
                <Check className="w-4 h-4 text-white" />
                <span className="text-sm text-white">Кто-то забронировал</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
