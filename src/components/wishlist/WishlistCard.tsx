'use client'

import { useState } from 'react'
import {
  Gift,
  ExternalLink,
  Lock,
  Unlock,
  MoreVertical,
  Trash2,
  Edit,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { WishlistItem } from '@/lib/supabase/database.types'

interface WishlistCardProps {
  item: WishlistItem
  isOwner: boolean
  currentUserId?: string
  onBook?: (itemId: string) => void
  onUnbook?: (itemId: string) => void
  onEdit?: (itemId: string) => void
  onDelete?: (itemId: string) => void
}

export function WishlistCard({
  item,
  isOwner,
  currentUserId,
  onBook,
  onUnbook,
  onEdit,
  onDelete,
}: WishlistCardProps) {
  const [isPressed, setIsPressed] = useState(false)

  const isBookedByMe = item.booked_by === currentUserId
  const canBook = !isOwner && !item.is_booked
  const canUnbook = isBookedByMe

  // Format price
  const formatPrice = (price: number | null) => {
    if (!price) return null
    return price.toLocaleString('ru-RU') + ' ₽'
  }

  return (
    <div
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={cn(
        'bg-[#F8F5F5] rounded-2xl p-4 transition-all duration-200',
        isPressed && 'scale-[0.98]',
        item.is_booked && 'opacity-75'
      )}
    >
      <div className="flex gap-3">
        {/* Icon/Image */}
        <div
          className={cn(
            'flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center',
            item.is_booked ? 'bg-[#E5E0E0]' : 'gradient-birthday'
          )}
        >
          <Gift
            className={cn(
              'w-7 h-7',
              item.is_booked ? 'text-[#8E8E93]' : 'text-white'
            )}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4
                className={cn(
                  'font-medium text-[#1C1C1E] truncate',
                  item.is_booked && 'line-through text-[#8E8E93]'
                )}
              >
                {item.title}
              </h4>
              {item.description && (
                <p className="text-sm text-[#8E8E93] truncate mt-0.5">
                  {item.description}
                </p>
              )}
            </div>

            {/* Actions menu */}
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-[#8E8E93]"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(item.id)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Редактировать
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={() => onDelete(item.id)}
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

          {/* Link and price */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {item.price && (
              <Badge
                variant="secondary"
                className="bg-burgundy/10 text-burgundy"
              >
                {formatPrice(item.price)}
              </Badge>
            )}
            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-burgundy hover:underline flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                Ссылка
              </a>
            )}
          </div>

          {/* Booking status / actions */}
          {!isOwner && (
            <div className="mt-3">
              {item.is_booked ? (
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#8E8E93]" />
                  <span className="text-sm text-[#8E8E93]">
                    {isBookedByMe ? 'Вы забронировали' : 'Забронировано'}
                  </span>
                  {canUnbook && onUnbook && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-auto"
                      onClick={() => onUnbook(item.id)}
                    >
                      Отменить
                    </Button>
                  )}
                </div>
              ) : (
                canBook &&
                onBook && (
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-burgundy hover:bg-burgundy-light"
                    onClick={() => onBook(item.id)}
                  >
                    <Gift className="w-4 h-4 mr-1" />
                    Забронировать
                  </Button>
                )
              )}
            </div>
          )}

          {/* Owner view of booking */}
          {isOwner && item.is_booked && (
            <div className="mt-3 flex items-center gap-2 text-sm text-[#8E8E93]">
              <Check className="w-4 h-4 text-green-500" />
              <span>Кто-то забронировал этот подарок</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
