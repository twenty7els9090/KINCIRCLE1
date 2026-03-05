'use client'

import { Bell, Settings, ChevronDown, Users } from 'lucide-react'
import { useUserStore, useUIStore } from '@/store'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'

interface HeaderProps {
  onNotificationsClick?: () => void
  onSettingsClick?: () => void
}

export function Header({ onNotificationsClick, onSettingsClick }: HeaderProps) {
  const { user, families, currentFamilyId, setCurrentFamily } = useUserStore()
  const { activeTab } = useUIStore()

  const currentFamily = families.find((f) => f.id === currentFamilyId)

  const getTabTitle = () => {
    switch (activeTab) {
      case 'tasks':
        return 'Задачи'
      case 'events':
        return 'Мероприятия'
      case 'wishlist':
        return 'Wishlist'
      case 'profile':
        return 'Профиль'
      default:
        return 'KINCIRCLE'
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-[#f5fffa]" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div className="max-w-[450px] mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Family selector or App name */}
          <div className="flex items-center gap-2">
            {activeTab === 'tasks' && families.length > 0 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#3E000C]/10 hover:bg-[#3E000C]/20 transition-colors">
                    <Users className="w-4 h-4 text-[#3E000C]" />
                    <span className="font-medium text-[#3E000C]">
                      {currentFamily?.name || 'Выберите семью'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-[#3E000C]/60" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {families.map((family) => (
                    <DropdownMenuItem
                      key={family.id}
                      onClick={() => setCurrentFamily(family.id)}
                      className={cn(
                        'cursor-pointer',
                        family.id === currentFamilyId && 'bg-[#3E000C]/10'
                      )}
                    >
                      <Users className="w-4 h-4 mr-2 text-[#3E000C]" />
                      {family.name}
                      {family.id === currentFamilyId && (
                        <Badge 
                          className="ml-auto text-xs bg-[#3E000C] text-[#f5fffa]"
                        >
                          {family.members?.length || 0}
                        </Badge>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <h1 className="text-2xl font-bold text-[#3E000C]">{getTabTitle()}</h1>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <button
              onClick={onNotificationsClick}
              className="relative p-2 rounded-xl bg-[#3E000C]/10 hover:bg-[#3E000C]/20 transition-colors"
            >
              <Bell className="w-5 h-5 text-[#3E000C]" />
              {/* Notification badge */}
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#3E000C] rounded-full" />
            </button>

            {/* User avatar / Settings */}
            <button
              onClick={onSettingsClick}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-[#3E000C]/10 transition-colors"
            >
              <Avatar className="w-8 h-8 border-2 border-[#3E000C]/30">
                <AvatarImage src={user?.avatar_url || undefined} alt={user?.first_name || ''} />
                <AvatarFallback className="bg-[#3E000C] text-[#f5fffa] text-sm font-medium">
                  {user?.first_name?.[0]?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
