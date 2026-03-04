import { create } from 'zustand'
import type { Event, EventParticipant, EventInsert, User } from '@/lib/supabase/database.types'

interface EventWithParticipants extends Event {
  creator: User
  participants: (EventParticipant & { user: User })[]
}

interface EventsState {
  // Events data
  events: EventWithParticipants[]
  isLoading: boolean
  
  // Filter options
  filterUpcoming: boolean
  
  // Actions
  setEvents: (events: EventWithParticipants[]) => void
  addEvent: (event: EventWithParticipants) => void
  updateEvent: (eventId: string, updates: Partial<Event>) => void
  removeEvent: (eventId: string) => void
  
  updateParticipant: (
    eventId: string,
    userId: string,
    response: 'pending' | 'going' | 'not_going'
  ) => void
  
  setLoading: (loading: boolean) => void
  setFilterUpcoming: (filter: boolean) => void
  
  // Computed helpers
  getUpcomingEvents: () => EventWithParticipants[]
  getPastEvents: () => EventWithParticipants[]
  getEventById: (eventId: string) => EventWithParticipants | undefined
  getUserEvents: (userId: string) => EventWithParticipants[]
}

export const useEventsStore = create<EventsState>((set, get) => ({
  events: [],
  isLoading: false,
  filterUpcoming: true,

  setEvents: (events) => set({ events }),
  
  addEvent: (event) =>
    set((state) => ({
      events: [event, ...state.events],
    })),
    
  updateEvent: (eventId, updates) =>
    set((state) => ({
      events: state.events.map((e) =>
        e.id === eventId ? { ...e, ...updates } : e
      ),
    })),
    
  removeEvent: (eventId) =>
    set((state) => ({
      events: state.events.filter((e) => e.id !== eventId),
    })),

  updateParticipant: (eventId, userId, response) =>
    set((state) => ({
      events: state.events.map((e) => {
        if (e.id !== eventId) return e
        const participants = e.participants.map((p) =>
          p.user_id === userId ? { ...p, response } : p
        )
        return { ...e, participants }
      }),
    })),

  setLoading: (loading) => set({ isLoading: loading }),
  setFilterUpcoming: (filter) => set({ filterUpcoming: filter }),

  getUpcomingEvents: () => {
    const { events } = get()
    const now = new Date()
    return events
      .filter((e) => new Date(e.event_date) >= now)
      .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
  },

  getPastEvents: () => {
    const { events } = get()
    const now = new Date()
    return events
      .filter((e) => new Date(e.event_date) < now)
      .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime())
  },

  getEventById: (eventId) => {
    const { events } = get()
    return events.find((e) => e.id === eventId)
  },

  getUserEvents: (userId) => {
    const { events } = get()
    return events.filter(
      (e) =>
        e.created_by === userId ||
        e.participants.some((p) => p.user_id === userId)
    )
  },
}))
