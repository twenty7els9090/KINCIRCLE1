'use client'

import { useState, useEffect } from 'react'
import { Calendar, Plus, CalendarDays, Users, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { EventCard } from './EventCard'
import { useEventsStore, useUserStore, useFriendsStore } from '@/store'
import { getSupabaseClient } from '@/lib/supabase'
import type { Event, EventParticipant, User } from '@/lib/supabase/database.types'

interface EventWithParticipants extends Event {
  creator?: User
  participants?: (EventParticipant & { user?: User })[]
}

export function EventsSection() {
  const { events, setEvents, addEvent, updateParticipant } = useEventsStore()
  const { user } = useUserStore()
  const { friends } = useFriendsStore()
  const [isLoading, setIsLoading] = useState(false)
  const [showEventForm, setShowEventForm] = useState(false)
  const [activeFilter, setActiveFilter] = useState<'upcoming' | 'past'>('upcoming')

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    event_date: '',
    event_time: '',
    invite_all: true,
    invited_friends: [] as string[],
  })

  // Fetch events - now includes events from friends
  useEffect(() => {
    if (user) {
      fetchEvents()
    }
  }, [user, friends])

  const fetchEvents = async () => {
    if (!user) return
    setIsLoading(true)

    try {
      const supabase = getSupabaseClient()
      
      // Get friend IDs
      const friendIds = friends.map(f => f.id)
      
      // Get all events - created by user, invited user, or created by friends
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          creator:users!events_created_by_fkey(*),
          participants:event_participants(
            *,
            user:users(*)
          )
        `)
        .order('event_date', { ascending: true })

      if (!error && data) {
        // Filter events that user should see:
        // 1. Created by user
        // 2. User is in invited_users
        // 3. Created by a friend AND (invited_users is empty OR user is in invited_users)
        const visibleEvents = (data as EventWithParticipants[]).filter(event => {
          // User created it
          if (event.created_by === user.id) return true
          
          // User is explicitly invited
          if (event.invited_users?.includes(user.id)) return true
          
          // Created by a friend and invited_users is empty (means all friends)
          if (friendIds.includes(event.created_by) && (!event.invited_users || event.invited_users.length === 0)) return true
          
          return false
        })
        
        setEvents(visibleEvents)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateEvent = async () => {
    if (!user || !formData.title || !formData.event_date) return

    try {
      const supabase = getSupabaseClient()
      const eventDateTime = formData.event_time
        ? `${formData.event_date}T${formData.event_time}:00`
        : `${formData.event_date}T12:00:00`

      // If invite_all, leave invited_users empty (means all friends)
      // Otherwise, use selected friends
      const invitedUsers = formData.invite_all ? [] : formData.invited_friends

      const { data, error } = await supabase
        .from('events')
        .insert({
          created_by: user.id,
          title: formData.title,
          description: formData.description || null,
          location: formData.location || null,
          event_date: eventDateTime,
          invited_users: invitedUsers,
        })
        .select(`
          *,
          creator:users!events_created_by_fkey(*),
          participants:event_participants(
            *,
            user:users(*)
          )
        `)
        .single()

      if (!error && data) {
        addEvent(data as EventWithParticipants)
        // Reset form
        setFormData({
          title: '',
          description: '',
          location: '',
          event_date: '',
          event_time: '',
          invite_all: true,
          invited_friends: [],
        })
        setShowEventForm(false)
      }
    } catch (error) {
      console.error('Error creating event:', error)
    }
  }

  const handleRespond = async (eventId: string, response: 'going' | 'not_going') => {
    if (!user) return

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('event_participants')
        .upsert({
          event_id: eventId,
          user_id: user.id,
          response,
          updated_at: new Date().toISOString(),
        })

      if (!error) {
        updateParticipant(eventId, user.id, response)
      }
    } catch (error) {
      console.error('Error responding to event:', error)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const supabase = getSupabaseClient()
      
      await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', eventId)

      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)

      if (!error) {
        setEvents(events.filter((e) => e.id !== eventId))
      }
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  const toggleFriendInvite = (friendId: string) => {
    setFormData(prev => ({
      ...prev,
      invited_friends: prev.invited_friends.includes(friendId)
        ? prev.invited_friends.filter(id => id !== friendId)
        : [...prev.invited_friends, friendId]
    }))
  }

  // Filter events
  const now = new Date()
  const upcomingEvents = events.filter((e) => new Date(e.event_date) >= now)
  const pastEvents = events.filter((e) => new Date(e.event_date) < now)

  const displayEvents = activeFilter === 'upcoming' ? upcomingEvents : pastEvents

  return (
    <div className="flex-1 flex flex-col">
      {/* Filter tabs */}
      <div className="px-4 py-3">
        <div className="flex gap-2">
          <Button
            variant={activeFilter === 'upcoming' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('upcoming')}
            className={activeFilter === 'upcoming' ? 'bg-burgundy hover:bg-burgundy-light rounded-full' : 'rounded-full'}
          >
            Предстоящие
            {upcomingEvents.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-white/20">
                {upcomingEvents.length}
              </span>
            )}
          </Button>
          <Button
            variant={activeFilter === 'past' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('past')}
            className={activeFilter === 'past' ? 'bg-burgundy hover:bg-burgundy-light rounded-full' : 'rounded-full'}
          >
            Прошедшие
          </Button>
        </div>
      </div>

      {/* Events list */}
      <div className="flex-1 overflow-y-auto px-4 pb-32 space-y-4">
        {displayEvents.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Нет мероприятий"
            description={
              activeFilter === 'upcoming'
                ? 'Создайте мероприятие, чтобы пригласить друзей'
                : 'Прошедших мероприятий нет'
            }
          />
        ) : (
          displayEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              currentUserId={user?.id}
              onRespond={handleRespond}
              onDelete={handleDeleteEvent}
            />
          ))
        )}
      </div>

      {/* Floating action button */}
      <button
        onClick={() => setShowEventForm(true)}
        className="fixed bottom-28 right-4 z-40 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 bg-burgundy"
        style={{
          boxShadow: '0 4px 20px rgba(139, 30, 63, 0.3)'
        }}
      >
        <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
      </button>

      {/* Event form modal */}
      <Dialog open={showEventForm} onOpenChange={setShowEventForm}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-burgundy">Новое мероприятие</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="День рождения, Встреча..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="date">Дата *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Время</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.event_time}
                  onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Место</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Адрес или название места"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Детали мероприятия"
                rows={2}
              />
            </div>

            {/* Guest selection */}
            {friends.length > 0 && (
              <div className="space-y-3">
                <Label>Кого пригласить?</Label>
                
                {/* All friends option */}
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, invite_all: true, invited_friends: [] }))}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                    formData.invite_all 
                      ? 'border-burgundy bg-burgundy/5' 
                      : 'border-[#F0E8E8] hover:border-burgundy/50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    formData.invite_all ? 'border-burgundy bg-burgundy' : 'border-[#8E8E93]'
                  }`}>
                    {formData.invite_all && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <Users className="w-5 h-5 text-[#8E8E93]" />
                  <span className="font-medium text-[#1C1C1E]">Всех друзей</span>
                </button>

                {/* Select specific friends */}
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, invite_all: false }))}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                    !formData.invite_all 
                      ? 'border-burgundy bg-burgundy/5' 
                      : 'border-[#F0E8E8] hover:border-burgundy/50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    !formData.invite_all ? 'border-burgundy bg-burgundy' : 'border-[#8E8E93]'
                  }`}>
                    {!formData.invite_all && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <Users className="w-5 h-5 text-[#8E8E93]" />
                  <span className="font-medium text-[#1C1C1E]">Выбрать конкретных</span>
                </button>

                {/* Friend selection list */}
                {!formData.invite_all && (
                  <div className="space-y-2 max-h-48 overflow-y-auto pl-2">
                    {friends.map((friend) => {
                      const isSelected = formData.invited_friends.includes(friend.id)
                      return (
                        <button
                          key={friend.id}
                          type="button"
                          onClick={() => toggleFriendInvite(friend.id)}
                          className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all ${
                            isSelected ? 'bg-burgundy/10' : 'hover:bg-[#F8F5F5]'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'border-burgundy bg-burgundy' : 'border-[#E5E0E0]'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={friend.avatar_url || undefined} />
                            <AvatarFallback className="bg-burgundy text-white text-xs">
                              {friend.first_name?.[0]?.toUpperCase() || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-[#1C1C1E]">{friend.first_name}</span>
                        </button>
                      )
                    })}
                  </div>
                )}

                {!formData.invite_all && formData.invited_friends.length === 0 && (
                  <p className="text-xs text-[#8E8E93] text-center py-2">
                    Выберите друзей для приглашения
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEventForm(false)}>
              Отмена
            </Button>
            <Button
              onClick={handleCreateEvent}
              disabled={!formData.title || !formData.event_date || (!formData.invite_all && formData.invited_friends.length === 0 && friends.length > 0)}
              style={{ backgroundColor: '#8B1E3F', color: 'white' }}
            >
              Создать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
