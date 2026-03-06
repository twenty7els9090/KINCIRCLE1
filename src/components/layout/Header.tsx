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
        return 'Вишлист'
      case 'profile':
        return 'Профиль'
      default:
        return 'KINCIRCLE'
    }
  }

  return (
    <header
      className="sticky top-0 z-40"
      style={{
        paddingTop: '64px',
        background: 'linear-gradient(180deg, rgba(245, 255, 250, 0.95) 0%, rgba(245, 255, 250, 0.85) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div className="max-w-[450px] mx-auto px-4 pb-3">
        <div className="flex items-center justify-between">
          {/* Left: Family selector or App name */}
          <div className="flex items-center gap-2">
            {activeTab === 'tasks' && families.length > 0 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background: 'rgba(255, 255, 255, 0.75)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      border: '1px solid rgba(62, 0, 12, 0.08)',
                      boxShadow: '0 2px 12px rgba(62, 0, 12, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.7)',
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #3E000C 0%, #5a1525 100%)',
                      }}
                    >
                      <Users className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="font-semibold text-[#1a1a1a]">
                      {currentFamily?.name || 'Выберите семью'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-[#3E000C]/40" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-48"
                  style={{
                    background: 'rgba(255, 255, 255, 0.92)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(62, 0, 12, 0.08)',
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(62, 0, 12, 0.1)',
                  }}
                >
                  {families.map((family) => (
                    <DropdownMenuItem
                      key={family.id}
                      onClick={() => setCurrentFamily(family.id)}
                      className={cn(
                        'cursor-pointer rounded-lg mx-1 my-0.5',
                        family.id === currentFamilyId ? 'bg-[#3E000C]/5' : 'hover:bg-[#3E000C]/5 focus:bg-[#3E000C]/5'
                      )}
                    >
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center mr-2"
                        style={{
                          background: family.id === currentFamilyId
                            ? 'linear-gradient(135deg, #3E000C 0%, #5a1525 100%)'
                            : 'rgba(62, 0, 12, 0.1)',
                        }}
                      >
                        <Users className="w-3 h-3 text-white" style={{ opacity: family.id === currentFamilyId ? 1 : 0 }} />
                      </div>
                      <span className="text-[#1a1a1a]">{family.name}</span>
                      {family.id === currentFamilyId && (
                        <Badge
                          className="ml-auto text-[10px] font-semibold"
                          style={{
                            background: 'rgba(62, 0, 12, 0.08)',
                            color: '#3E000C',
                            border: 'none',
                          }}
                        >
                          {family.members?.length || 0}
                        </Badge>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <h1
                className="text-2xl font-bold"
                style={{
                  background: 'linear-gradient(135deg, #3E000C 0%, #5a1525 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {getTabTitle()}
              </h1>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <button
              onClick={onNotificationsClick}
              className="relative p-2.5 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(62, 0, 12, 0.08)',
                boxShadow: '0 2px 12px rgba(62, 0, 12, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.7)',
              }}
            >
              <Bell className="w-5 h-5 text-[#1a1a1a]/60" />
              {/* Notification badge */}
              <span
                className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #3E000C 0%, #5a1525 100%)',
                  boxShadow: '0 0 8px rgba(62, 0, 12, 0.4)',
                }}
              />
            </button>

            {/* User avatar / Settings */}
            <button
              onClick={onSettingsClick}
              className="flex items-center gap-2 p-0.5 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Avatar
                className="w-10 h-10"
                style={{
                  boxShadow: '0 2px 12px rgba(62, 0, 12, 0.15), 0 0 0 2px rgba(62, 0, 12, 0.1)',
                }}
              >
                <AvatarImage src={user?.avatar_url || undefined} alt={user?.first_name || ''} />
                <AvatarFallback
                  className="text-sm font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #3E000C 0%, #5a1525 100%)',
                    color: '#FFFFFF',
                  }}
                >
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
