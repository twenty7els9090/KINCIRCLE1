'use client'

import { useState, useEffect, useRef } from 'react'
import { Calendar, Plus, CalendarDays, Users, Check, X, ChevronLeft } from 'lucide-react'
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
  
  const realtimeRef = useRef(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    event_date: '',
    event_time: '',
    invite_all: true,
    invited_friends: [] as string[],
  })

  useEffect(() => {
    if (user) {
      fetchEvents()
    }
  }, [user])

  useEffect(() => {
    if (!user || realtimeRef.current) return

    const supabase = getSupabaseClient()
    realtimeRef.current = true

    const eventsChannel = supabase
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
            const friendIds = useFriendsStore.getState().friends.map(f => f.id)
            const isCreator = newData.created_by === user.id
            const isInvited = newData.invited_users?.includes(user.id)
            const isFriendEvent = friendIds.includes(newData.created_by) && newData.is_public === true
            
            if (isCreator || isInvited || isFriendEvent) {
              const exists = useEventsStore.getState().events.some(e => e.id === newData.id)
              if (!exists) {
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
                  addEvent(data as EventWithParticipants)
                }
              }
            }
          } else if (eventType === 'UPDATE') {
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
      .subscribe()

    const participantsChannel = supabase
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
      supabase.removeChannel(eventsChannel)
      supabase.removeChannel(participantsChannel)
      realtimeRef.current = false
    }
  }, [user])

  const fetchEvents = async () => {
    if (!user) return
    setIsLoading(true)

    try {
      const supabase = getSupabaseClient()
      const friendIds = useFriendsStore.getState().friends.map(f => f.id)
      
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

    const event = events.find(e => e.id === eventId)
    if (event) {
      const existingParticipant = event.participants?.find(p => p.user_id === user.id)
      const updatedParticipants = existingParticipant
        ? event.participants?.map(p => p.user_id === user.id ? { ...p, response } : p)
        : [...(event.participants || []), { 
            event_id: eventId, 
            user_id: user.id, 
            response, 
            user: {
              id: user.id,
              first_name: user.first_name,
              last_name: user.last_name,
              avatar_url: user.avatar_url,
              username: user.username,
            } as any
          }]
      
      updateEvent(eventId, { ...event, participants: updatedParticipants as any })
    }

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('event_participants')
        .upsert({
          event_id: eventId,
          user_id: user.id,
          response,
          updated_at: new Date().toISOString(),
        }, { 
          onConflict: 'event_id,user_id' 
        })
      
      if (error) {
        console.error('Error responding to event:', error)
      }
    } catch (error) {
      console.error('Error responding to event:', error)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    removeEvent(eventId)

    try {
      const supabase = getSupabaseClient()
      
      await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', eventId)

      await supabase
        .from('events')
        .delete()
        .eq('id', eventId)
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

  const now = new Date()
  const upcomingEvents = events.filter((e) => new Date(e.event_date) >= now)
  const pastEvents = events.filter((e) => new Date(e.event_date) < now)

  const displayEvents = activeFilter === 'upcoming' ? upcomingEvents : pastEvents

  const canSubmit = formData.title && formData.event_date && 
    (formData.invite_all || formData.invited_friends.length > 0 || friends.length === 0)

  return (
    <>
      <div className="flex-1 flex flex-col bg-[#f5fffa]">
        {/* Filter tabs */}
        <div className="px-4 py-3">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveFilter('upcoming')}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
              )}
              style={{
                backgroundColor: activeFilter === 'upcoming' ? '#3E000C' : '#FFFFFF',
                color: activeFilter === 'upcoming' ? '#f5fffa' : '#3E000C',
                border: activeFilter === 'upcoming' ? 'none' : '1px solid #3E000C20',
              }}
            >
              Предстоящие
              {upcomingEvents.length > 0 && (
                <span 
                  className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full"
                  style={{ 
                    backgroundColor: activeFilter === 'upcoming' ? '#f5fffa' : '#3E000C',
                    color: activeFilter === 'upcoming' ? '#3E000C' : '#f5fffa'
                  }}
                >
                  {upcomingEvents.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveFilter('past')}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
              )}
              style={{
                backgroundColor: activeFilter === 'past' ? '#3E000C' : '#FFFFFF',
                color: activeFilter === 'past' ? '#f5fffa' : '#3E000C',
                border: activeFilter === 'past' ? 'none' : '1px solid #3E000C20',
              }}
            >
              Прошедшие
            </button>
          </div>
        </div>

        {/* Events list */}
        <div className="flex-1 overflow-y-auto px-4 pb-32 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div 
                className="w-8 h-8 rounded-full animate-spin"
                style={{ border: '2px solid #3E000C20', borderTopColor: '#3E000C' }}
              />
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
          className="fixed bottom-28 right-4 z-40 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            backgroundColor: '#3E000C',
            boxShadow: '0 4px 20px rgba(62, 0, 12, 0.3)',
          }}
        >
          <Plus className="w-6 h-6 text-[#f5fffa]" strokeWidth={2.5} />
        </button>
      </div>

      {/* Event form */}
      {showEventForm && (
        <div className="fixed inset-0 z-[60] bg-[#f5fffa] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-[#3E000C]" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
            <button
              onClick={() => { resetForm(); setShowEventForm(false); }}
              className="p-2 -ml-2 rounded-full bg-[#f5fffa]/10"
            >
              <ChevronLeft className="w-6 h-6 text-[#f5fffa]" />
            </button>
            
            <h1 className="text-lg font-semibold text-[#f5fffa]">Новое мероприятие</h1>
            
            <button
              onClick={() => { resetForm(); setShowEventForm(false); }}
              className="p-2 -mr-2 rounded-full bg-[#f5fffa]/10"
            >
              <X className="w-6 h-6 text-[#f5fffa]" />
            </button>
          </div>

          {/* Form content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#3E000C]">Название</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="День рождения, Встреча..."
                className="border-[#3E000C]/20 focus:border-[#3E000C] bg-white rounded-xl py-3"
              />
            </div>

            {/* Date and time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#3E000C]">Дата</label>
                <Input
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  className="border-[#3E000C]/20 focus:border-[#3E000C] bg-white rounded-xl py-3"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#3E000C]">Время</label>
                <Input
                  type="time"
                  value={formData.event_time}
                  onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                  className="border-[#3E000C]/20 focus:border-[#3E000C] bg-white rounded-xl py-3"
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#3E000C]">Место</label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Адрес или название места"
                className="border-[#3E000C]/20 focus:border-[#3E000C] bg-white rounded-xl py-3"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#3E000C]">Описание</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Детали мероприятия"
                rows={2}
                className="border-[#3E000C]/20 focus:border-[#3E000C] resize-none bg-white rounded-xl"
              />
            </div>

            {/* Guest selection */}
            {friends.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-medium text-[#3E000C]">Кого пригласить?</label>
                
                {/* All friends option */}
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, invite_all: true, invited_friends: [] }))}
                  className="w-full flex items-center gap-3 p-3 rounded-xl transition-all"
                  style={{
                    backgroundColor: formData.invite_all ? '#3E000C' : '#FFFFFF',
                    border: `2px solid ${formData.invite_all ? '#3E000C' : '#3E000C20'}`,
                  }}
                >
                  <div 
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                    style={{
                      borderColor: formData.invite_all ? '#f5fffa' : '#3E000C40',
                      backgroundColor: formData.invite_all ? '#f5fffa' : 'transparent',
                    }}
                  >
                    {formData.invite_all && <Check className="w-3 h-3 text-[#3E000C]" />}
                  </div>
                  <Users className="w-5 h-5" style={{ color: formData.invite_all ? '#f5fffa' : '#3E000C60' }} />
                  <span className="font-medium" style={{ color: formData.invite_all ? '#f5fffa' : '#3E000C' }}>Всех друзей</span>
                </button>

                {/* Select specific friends */}
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, invite_all: false }))}
                  className="w-full flex items-center gap-3 p-3 rounded-xl transition-all"
                  style={{
                    backgroundColor: !formData.invite_all ? '#3E000C' : '#FFFFFF',
                    border: `2px solid ${!formData.invite_all ? '#3E000C' : '#3E000C20'}`,
                  }}
                >
                  <div 
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                    style={{
                      borderColor: !formData.invite_all ? '#f5fffa' : '#3E000C40',
                      backgroundColor: !formData.invite_all ? '#f5fffa' : 'transparent',
                    }}
                  >
                    {!formData.invite_all && <Check className="w-3 h-3 text-[#3E000C]" />}
                  </div>
                  <Users className="w-5 h-5" style={{ color: !formData.invite_all ? '#f5fffa' : '#3E000C60' }} />
                  <span className="font-medium" style={{ color: !formData.invite_all ? '#f5fffa' : '#3E000C' }}>Выбрать конкретных</span>
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
                          className="w-full flex items-center gap-3 p-2 rounded-xl transition-all"
                          style={{
                            backgroundColor: isSelected ? '#3E000C10' : 'transparent',
                          }}
                        >
                          <div 
                            className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                            style={{
                              borderColor: isSelected ? '#3E000C' : '#3E000C30',
                              backgroundColor: isSelected ? '#3E000C' : 'transparent',
                            }}
                          >
                            {isSelected && <Check className="w-3 h-3 text-[#f5fffa]" />}
                          </div>
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={friend.avatar_url || undefined} />
                            <AvatarFallback className="bg-[#3E000C] text-[#f5fffa] text-xs">
                              {friend.first_name?.[0]?.toUpperCase() || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-[#3E000C]">{friend.first_name}</span>
                        </button>
                      )
                    })}
                  </div>
                )}

                {!formData.invite_all && formData.invited_friends.length === 0 && (
                  <p className="text-xs text-[#3E000C]/60 text-center py-2">
                    Выберите друзей для приглашения
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Submit button */}
          <div className="p-4">
            <button
              onClick={handleCreateEvent}
              disabled={!canSubmit}
              className="w-full py-4 rounded-2xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: '#3E000C',
                color: '#f5fffa',
              }}
            >
              Создать
            </button>
          </div>
        </div>
      )}
    </>
  )
}
