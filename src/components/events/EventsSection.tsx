'use client'

import { useState, useEffect } from 'react'
import { Calendar, Plus, CalendarDays, Users, Check, X, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/components/shared/EmptyState'
import { EventCard } from './EventCard'
import { useEventsStore, useUserStore, useFriendsStore } from '@/store'
import { getSupabaseClient } from '@/lib/supabase'
import type { Event, EventParticipant, User } from '@/lib/supabase/database.types'

interface EventWithParticipants extends Event {
  creator?: User
  participants?: (EventParticipant & { user?: User })[]
  is_public: boolean
}

export function EventsSection() {
  const { events, setEvents, addEvent, updateEvent, removeEvent } = useEventsStore()
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

  // Fetch events when user is ready (friends are loaded globally in page.tsx)
  useEffect(() => {
    if (user) {
      fetchEvents()
    }
  }, [user])

  // Realtime subscription for events
  useEffect(() => {
    if (!user) return

    const supabase = getSupabaseClient()
    const friendIds = friends.map(f => f.id)
    
    const channel = supabase
      .channel('events-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
        },
        async (payload) => {
          const eventType = payload.eventType
          const newData = payload.new as any
          const oldData = payload.old as any

          if (eventType === 'INSERT') {
            // Check if this event is visible to user
            const isCreator = newData.created_by === user.id
            const isInvited = newData.invited_users?.includes(user.id)
            const isFriendEvent = friendIds.includes(newData.created_by) && newData.is_public === true
            
            if (isCreator || isInvited || isFriendEvent) {
              // Fetch complete event with relations
              const { data } = await supabase
                .from('events')
                .select(`
                  *,
                  creator:users!events_created_by_fkey(*),
                  participants:event_participants(
                    *,
                    user:users(*)
                  )
                `)
                .eq('id', newData.id)
                .single()
              
              if (data && !events.some(e => e.id === data.id)) {
                addEvent(data as EventWithParticipants)
              }
            }
          } else if (eventType === 'UPDATE') {
            // Fetch updated event with relations
            const { data } = await supabase
              .from('events')
              .select(`
                *,
                creator:users!events_created_by_fkey(*),
                participants:event_participants(
                  *,
                  user:users(*)
                )
              `)
              .eq('id', newData.id)
              .single()
            
            if (data) {
              updateEvent(newData.id, data)
            }
          } else if (eventType === 'DELETE') {
            removeEvent(oldData.id)
          }
        }
      )
      .subscribe((status) => {
        console.log('Events realtime status:', status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, friends, events, addEvent, updateEvent, removeEvent])

  // Realtime for event_participants
  useEffect(() => {
    if (!user) return

    const supabase = getSupabaseClient()
    
    const channel = supabase
      .channel('event-participants-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_participants',
        },
        async (payload) => {
          const eventType = payload.eventType
          const newData = payload.new as any

          if (eventType === 'INSERT' || eventType === 'UPDATE') {
            // Fetch the event to update participants
            const { data } = await supabase
              .from('events')
              .select(`
                *,
                creator:users!events_created_by_fkey(*),
                participants:event_participants(
                  *,
                  user:users(*)
                )
              `)
              .eq('id', newData.event_id)
              .single()
            
            if (data) {
              updateEvent(newData.event_id, data)
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, updateEvent])

  const fetchEvents = async () => {
    if (!user) return
    setIsLoading(true)

    try {
      const supabase = getSupabaseClient()
      
      // Get friend IDs - use current friends value
      const currentFriends = useFriendsStore.getState().friends
      const friendIds = currentFriends.map(f => f.id)
      
      console.log('Fetching events with friends:', friendIds.length)
      
      // Get all events
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
        const visibleEvents = (data as EventWithParticipants[]).filter(event => {
          if (event.created_by === user.id) return true
          if (event.invited_users?.includes(user.id)) return true
          if (friendIds.includes(event.created_by) && event.is_public === true) return true
          return false
        })
        
        console.log('Visible events:', visibleEvents.length)
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

      const isPublic = formData.invite_all
      const invitedUsers = formData.invite_all ? null : formData.invited_friends

      const { data, error } = await supabase
        .from('events')
        .insert({
          created_by: user.id,
          title: formData.title,
          description: formData.description || null,
          location: formData.location || null,
          event_date: eventDateTime,
          invited_users: invitedUsers,
          is_public: isPublic,
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
        // Realtime will handle this, but add locally for instant feedback
        if (!events.some(e => e.id === data.id)) {
          addEvent(data as EventWithParticipants)
        }
        resetForm()
        setShowEventForm(false)
      }
    } catch (error) {
      console.error('Error creating event:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      event_date: '',
      event_time: '',
      invite_all: true,
      invited_friends: [],
    })
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
        // Optimistic update - realtime will confirm
        const event = events.find(e => e.id === eventId)
        if (event) {
          const existingParticipant = event.participants?.find(p => p.user_id === user.id)
          const updatedParticipants = existingParticipant
            ? event.participants?.map(p => p.user_id === user.id ? { ...p, response } : p)
            : [...(event.participants || []), { event_id: eventId, user_id: user.id, response, user: user } as any]
          
          updateEvent(eventId, { ...event, participants: updatedParticipants })
        }
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
        removeEvent(eventId)
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

  const canSubmit = formData.title && formData.event_date && 
    (formData.invite_all || formData.invited_friends.length > 0 || friends.length === 0)

  return (
    <>
      {/* Main content */}
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
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-burgundy"></div>
            </div>
          ) : displayEvents.length === 0 ? (
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
      </div>

      {/* Full screen event form */}
      {showEventForm && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#F0E8E8]">
            <button
              onClick={() => { resetForm(); setShowEventForm(false); }}
              className="p-2 -ml-2 rounded-full hover:bg-[#F8F5F5] transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-[#1C1C1E]" />
            </button>
            
            <h1 className="text-lg font-semibold text-[#1C1C1E]">Новое мероприятие</h1>
            
            <button
              onClick={() => { resetForm(); setShowEventForm(false); }}
              className="p-2 -mr-2 rounded-full hover:bg-[#F8F5F5] transition-colors"
            >
              <X className="w-6 h-6 text-[#1C1C1E]" />
            </button>
          </div>

          {/* Form content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1C1C1E]">Название</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="День рождения, Встреча..."
                className="border-[#F0E8E8] focus:border-burgundy"
              />
            </div>

            {/* Date and time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1C1C1E]">Дата</label>
                <Input
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  className="border-[#F0E8E8] focus:border-burgundy"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1C1C1E]">Время</label>
                <Input
                  type="time"
                  value={formData.event_time}
                  onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                  className="border-[#F0E8E8] focus:border-burgundy"
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1C1C1E]">Место</label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Адрес или название места"
                className="border-[#F0E8E8] focus:border-burgundy"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1C1C1E]">Описание</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Детали мероприятия"
                rows={2}
                className="border-[#F0E8E8] focus:border-burgundy resize-none"
              />
            </div>

            {/* Guest selection */}
            {friends.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-medium text-[#1C1C1E]">Кого пригласить?</label>
                
                {/* All friends option */}
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, invite_all: true, invited_friends: [] }))}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-xl border transition-all',
                    formData.invite_all 
                      ? 'border-burgundy bg-burgundy/5' 
                      : 'border-[#F0E8E8] hover:border-[#D4C4C4]'
                  )}
                >
                  <div className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                    formData.invite_all ? 'border-burgundy bg-burgundy' : 'border-[#8E8E93]'
                  )}>
                    {formData.invite_all && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <Users className="w-5 h-5 text-[#8E8E93]" />
                  <span className="font-medium text-[#1C1C1E]">Всех друзей</span>
                </button>

                {/* Select specific friends */}
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, invite_all: false }))}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-xl border transition-all',
                    !formData.invite_all 
                      ? 'border-burgundy bg-burgundy/5' 
                      : 'border-[#F0E8E8] hover:border-[#D4C4C4]'
                  )}
                >
                  <div className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                    !formData.invite_all ? 'border-burgundy bg-burgundy' : 'border-[#8E8E93]'
                  )}>
                    {!formData.invite_all && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <Users className="w-5 h-5 text-[#8E8E93]" />
                  <span className="font-medium text-[#1C1C1E]">Выбрать конкретных</span>
                </button>

                {/* Friend selection list */}
                {!formData.invite_all && (
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {friends.map((friend) => {
                      const isSelected = formData.invited_friends.includes(friend.id)
                      return (
                        <button
                          key={friend.id}
                          type="button"
                          onClick={() => toggleFriendInvite(friend.id)}
                          className={cn(
                            'w-full flex items-center gap-3 p-2 rounded-xl transition-all',
                            isSelected ? 'bg-burgundy/10' : 'hover:bg-[#F8F5F5]'
                          )}
                        >
                          <div className={cn(
                            'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                            isSelected ? 'border-burgundy bg-burgundy' : 'border-[#E5E0E0]'
                          )}>
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

          {/* Submit button */}
          <div className="p-4 border-t border-[#F0E8E8]">
            <Button
              onClick={handleCreateEvent}
              disabled={!canSubmit}
              className="w-full bg-burgundy hover:bg-burgundy-light text-white"
            >
              Создать
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
