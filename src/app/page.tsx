'use client'

import { useEffect, useState } from 'react'
import { TabBar } from '@/components/layout/TabBar'
import { Header } from '@/components/layout/Header'
import { TasksSection } from '@/components/tasks/TasksSection'
import { EventsSection } from '@/components/events/EventsSection'
import { WishlistSection } from '@/components/wishlist/WishlistSection'
import { ProfileSection } from '@/components/profile/ProfileSection'
import { BirthdayReminders } from '@/components/shared/BirthdayReminders'
import { useUIStore, useUserStore, useFriendsStore } from '@/store'
import { getSupabaseClient } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

export default function Home() {
  const { activeTab } = useUIStore()
  const { user, setUser, setFamilies, setLoading, isLoading } = useUserStore()
  const { friends } = useFriendsStore()
  const [isInitialized, setIsInitialized] = useState(false)
  const [birthdayUsers, setBirthdayUsers] = useState<any[]>([])

  // Initialize Telegram WebApp and authenticate
  useEffect(() => {
    initializeApp()
  }, [])

  const initializeApp = async () => {
    setLoading(true)

    try {
      // Check if running in Telegram WebApp
      if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
        const tg = (window as any).Telegram.WebApp
        
        // Expand the mini app
        tg.expand()
        
        // Get init data
        const initData = tg.initData
        const tgUser = tg.initDataUnsafe?.user

        if (tgUser) {
          // Authenticate with our backend
          const response = await fetch('/api/auth/telegram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ initData }),
          })

          const data = await response.json()
          
          if (data.user) {
            setUser(data.user)
            
            // Fetch families
            await fetchUserFamilies(data.user.id)
          }
        }
      } else {
        // Demo mode for development
        console.log('Not running in Telegram, using demo mode')
        
        // Create a demo user for development
        const demoUser = {
          id: 'demo-user-id',
          telegram_id: 123456789,
          username: 'demo_user',
          first_name: 'Demo',
          last_name: 'User',
          avatar_url: null,
          birthday: '1990-05-15',
          chat_id: 123456789,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        setUser(demoUser)
        
        // Create demo family
        setFamilies([{
          id: 'demo-family-id',
          name: 'Демо семья',
          created_by: 'demo-user-id',
          created_at: new Date().toISOString(),
          members: [{
            id: 'demo-member-id',
            family_id: 'demo-family-id',
            user_id: 'demo-user-id',
            role: 'admin',
            joined_at: new Date().toISOString(),
            user: demoUser,
          }],
        }])
      }
    } catch (error) {
      console.error('Error initializing app:', error)
    } finally {
      setLoading(false)
      setIsInitialized(true)
    }
  }

  const fetchUserFamilies = async (userId: string) => {
    try {
      const response = await fetch(`/api/families?userId=${userId}`)
      const data = await response.json()
      
      if (data.families) {
        setFamilies(data.families)
      }
    } catch (error) {
      console.error('Error fetching families:', error)
    }
  }

  // Get upcoming birthdays from friends
  useEffect(() => {
    const upcomingBirthdays = friends
      .filter((f) => f.birthday)
      .map((f) => ({
        id: f.id,
        first_name: f.first_name,
        last_name: f.last_name,
        avatar_url: f.avatar_url,
        birthday: f.birthday!,
        hasWishlist: true, // Assume all have wishlist for demo
      }))
      .filter((f) => {
        const birthday = new Date(f.birthday)
        const today = new Date()
        birthday.setFullYear(today.getFullYear())
        if (birthday < today) birthday.setFullYear(today.getFullYear() + 1)
        
        const daysUntil = Math.ceil(
          (birthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        )
        return daysUntil <= 30 // Show birthdays within 30 days
      })
      .slice(0, 5)
    
    setBirthdayUsers(upcomingBirthdays)
  }, [friends])

  // Loading state
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-burgundy animate-spin" />
          <p className="text-[#8E8E93]">Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-[450px] mx-auto">
      {/* Header */}
      <Header />

      {/* Birthday reminders (show on tasks tab) */}
      {activeTab === 'tasks' && birthdayUsers.length > 0 && (
        <div className="px-4 pt-4">
          <BirthdayReminders users={birthdayUsers} />
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col pb-16">
        {activeTab === 'tasks' && <TasksSection />}
        {activeTab === 'events' && <EventsSection />}
        {activeTab === 'wishlist' && <WishlistSection />}
        {activeTab === 'profile' && <ProfileSection />}
      </main>

      {/* Tab bar */}
      <TabBar />
    </div>
  )
}
