'use client'

import { Gift, Cake } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

interface BirthdayUser {
  id: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  birthday: string
  hasWishlist?: boolean
}

interface BirthdayRemindersProps {
  users: BirthdayUser[]
  onUserClick?: (userId: string) => void
}

export function BirthdayReminders({ users, onUserClick }: BirthdayRemindersProps) {
  if (users.length === 0) return null

  // Sort by upcoming birthday
  const sortedUsers = [...users].sort((a, b) => {
    const today = new Date()
    const aDate = new Date(a.birthday)
    const bDate = new Date(b.birthday)
    
    // Set to current year
    aDate.setFullYear(today.getFullYear())
    bDate.setFullYear(today.getFullYear())
    
    // If passed, set to next year
    if (aDate < today) aDate.setFullYear(today.getFullYear() + 1)
    if (bDate < today) bDate.setFullYear(today.getFullYear() + 1)
    
    return aDate.getTime() - bDate.getTime()
  })

  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium text-[#8E8E93] mb-2 px-4">
        Скоро ДР 🎂
      </h3>
      <div className="overflow-x-auto horizontal-scroll -mx-4 px-4">
        <div className="flex gap-3 pb-2">
          {sortedUsers.map((user) => (
            <BirthdayCard
              key={user.id}
              user={user}
              onClick={() => onUserClick?.(user.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

interface BirthdayCardProps {
  user: BirthdayUser
  onClick?: () => void
}

function BirthdayCard({ user, onClick }: BirthdayCardProps) {
  const birthday = new Date(user.birthday)
  const today = new Date()
  
  // Calculate days until birthday
  let nextBirthday = new Date(birthday)
  nextBirthday.setFullYear(today.getFullYear())
  if (nextBirthday < today) {
    nextBirthday.setFullYear(today.getFullYear() + 1)
  }
  
  const daysUntil = Math.ceil(
    (nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )
  
  const isToday = daysUntil === 0
  const isTomorrow = daysUntil === 1

  const formattedDate = format(birthday, 'd MMM', { locale: ru })

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-2xl',
        'bg-gradient-to-br from-[#F8E8EC] to-[#F0D0D9]',
        'transition-all duration-200 hover:scale-105',
        'min-w-[80px]'
      )}
    >
      {/* Avatar with birthday indicator */}
      <div className="relative">
        <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
          <AvatarImage src={user.avatar_url || undefined} />
          <AvatarFallback className="bg-burgundy text-white text-sm">
            {user.first_name?.[0]?.toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>
        
        {/* Cake icon for today */}
        {isToday && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-burgundy flex items-center justify-center">
            <Cake className="w-3 h-3 text-white" />
          </div>
        )}
        
        {/* Wishlist indicator */}
        {user.hasWishlist && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white shadow flex items-center justify-center">
            <Gift className="w-3 h-3 text-burgundy" />
          </div>
        )}
      </div>

      {/* Name */}
      <div className="text-center">
        <p className="text-xs font-medium text-[#1C1C1E] truncate max-w-[70px]">
          {user.first_name}
        </p>
        <p className="text-[10px] text-[#8E8E93]">
          {isToday ? 'Сегодня!' : isTomorrow ? 'Завтра' : formattedDate}
        </p>
      </div>
    </button>
  )
}
