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
    <header className="sticky top-0 z-40 bg-[#3E000C]">
      <div className="max-w-[450px] mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Family selector or App name */}
          <div className="flex items-center gap-2">
            {activeTab === 'tasks' && families.length > 0 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#FFECD1]/10 hover:bg-[#FFECD1]/20 transition-colors">
                    <Users className="w-4 h-4 text-[#FFECD1]" />
                    <span className="font-medium text-[#FFECD1]">
                      {currentFamily?.name || 'Выберите семью'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-[#FFECD1]/60" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {families.map((family) => (
                    <DropdownMenuItem
                      key={family.id}
                      onClick={() => setCurrentFamily(family.id)}
                      className={cn(
                        'cursor-pointer',
                        family.id === currentFamilyId && 'bg-[#FFECD1]'
                      )}
                    >
                      <Users className="w-4 h-4 mr-2 text-[#3E000C]" />
                      {family.name}
                      {family.id === currentFamilyId && (
                        <Badge 
                          className="ml-auto text-xs bg-[#3E000C] text-[#FFECD1]"
                        >
                          {family.members?.length || 0}
                        </Badge>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <h1 className="text-2xl font-bold text-[#FFECD1]">{getTabTitle()}</h1>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <button
              onClick={onNotificationsClick}
              className="relative p-2 rounded-xl bg-[#FFECD1]/10 hover:bg-[#FFECD1]/20 transition-colors"
            >
              <Bell className="w-5 h-5 text-[#FFECD1]" />
              {/* Notification badge */}
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#FFECD1] rounded-full" />
            </button>

            {/* User avatar / Settings */}
            <button
              onClick={onSettingsClick}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-[#FFECD1]/10 transition-colors"
            >
              <Avatar className="w-8 h-8 border-2 border-[#FFECD1]/30">
                <AvatarImage src={user?.avatar_url || undefined} alt={user?.first_name || ''} />
                <AvatarFallback className="bg-[#FFECD1] text-[#3E000C] text-sm font-medium">
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
