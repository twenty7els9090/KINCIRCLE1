'use client'

import { useState, useEffect } from 'react'
import { Calendar, Plus, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { format } from 'date-fns'

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
  const [activeFilter, setActiveFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming')

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    event_date: '',
    event_time: '',
  })

  // Fetch events
  useEffect(() => {
    if (user) {
      fetchEvents()
    }
  }, [user])

  const fetchEvents = async () => {
    if (!user) return
    setIsLoading(true)

    try {
      const supabase = getSupabaseClient()
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
        .or(`created_by.eq.${user.id},invited_users.cs.{${user.id}}`)
        .order('event_date', { ascending: true })

      if (!error && data) {
        setEvents(data as EventWithParticipants[])
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

      const { data, error } = await supabase
        .from('events')
        .insert({
          created_by: user.id,
          title: formData.title,
          description: formData.description || null,
          location: formData.location || null,
          event_date: eventDateTime,
          invited_users: [], // All friends by default
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
      
      // Delete participants first
      await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', eventId)

      // Delete event
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

  // Filter events
  const now = new Date()
  const upcomingEvents = events.filter((e) => new Date(e.event_date) >= now)
  const pastEvents = events.filter((e) => new Date(e.event_date) < now)

  const displayEvents =
    activeFilter === 'upcoming'
      ? upcomingEvents
      : activeFilter === 'past'
      ? pastEvents
      : events

  return (
    <div className="flex-1 flex flex-col">
      {/* Filter tabs */}
      <div className="px-4 py-3 border-b border-[#F0E8E8]">
        <div className="flex gap-2">
          {(['upcoming', 'past', 'all'] as const).map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter(filter)}
              className={activeFilter === filter ? 'bg-burgundy hover:bg-burgundy-light' : ''}
            >
              {filter === 'upcoming' && 'Предстоящие'}
              {filter === 'past' && 'Прошедшие'}
              {filter === 'all' && 'Все'}
            </Button>
          ))}
        </div>
      </div>

      {/* Events list */}
      <div className="flex-1 overflow-y-auto p-4 pb-28 space-y-3">
        {displayEvents.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Нет мероприятий"
            description={
              activeFilter === 'upcoming'
                ? 'Создайте мероприятие, чтобы пригласить друзей'
                : 'Мероприятия не найдены'
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
        className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 bg-burgundy"
        style={{
          boxShadow: '0 4px 20px rgba(139, 30, 63, 0.3)'
        }}
      >
        <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
      </button>

      {/* Event form modal */}
      <Dialog open={showEventForm} onOpenChange={setShowEventForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-burgundy">Новое мероприятие</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="День рождения, Встреча..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="date">Дата</Label>
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEventForm(false)}>
              Отмена
            </Button>
            <Button
              onClick={handleCreateEvent}
              disabled={!formData.title || !formData.event_date}
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
