import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'

function getSupabaseAdmin() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  )
}

/**
 * GET /api/events?userId=xxx - Get user's events
 * GET /api/events?eventId=xxx - Get specific event
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const eventId = searchParams.get('eventId')
    
    const supabase = getSupabaseAdmin()
    
    // Get specific event
    if (eventId) {
      const { data: event, error } = await supabase
        .from('events')
        .select(`
          *,
          creator:users!events_created_by_fkey(*),
          participants:event_participants(
            *,
            user:users(*)
          )
        `)
        .eq('id', eventId)
        .single()
      
      if (error) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 })
      }
      
      return NextResponse.json({ event })
    }
    
    // Get user's events
    if (!userId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }
    
    // Get events where user is creator or participant
    const { data: events, error } = await supabase
      .from('events')
      .select(`
        *,
        creator:users!events_created_by_fkey(*),
        participants:event_participants(
          *,
          user:users(*)
        )
      `)
      .or(`created_by.eq.${userId},invited_users.cs.{${userId}}`)
      .order('event_date', { ascending: true })
    
    if (error) {
      console.error('Error fetching events:', error)
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
    }
    
    return NextResponse.json({ events })
  } catch (error) {
    console.error('Error in events GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/events - Create new event
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event, participantIds } = body as {
      event: Database['public']['Tables']['events']['Insert']
      participantIds?: string[]
    }
    
    const supabase = getSupabaseAdmin()
    
    // Create event
    const { data: newEvent, error: eventError } = await supabase
      .from('events')
      .insert(event)
      .select(`
        *,
        creator:users!events_created_by_fkey(*)
      `)
      .single()
    
    if (eventError) {
      console.error('Error creating event:', eventError)
      return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
    }
    
    // Add participants
    if (participantIds && participantIds.length > 0) {
      const participants = participantIds.map((userId) => ({
        event_id: newEvent.id,
        user_id: userId,
        response: 'pending' as const,
      }))
      
      const { error: participantError } = await supabase
        .from('event_participants')
        .insert(participants)
      
      if (participantError) {
        console.error('Error adding participants:', participantError)
      }
    }
    
    // Fetch full event with participants
    const { data: fullEvent } = await supabase
      .from('events')
      .select(`
        *,
        creator:users!events_created_by_fkey(*),
        participants:event_participants(
          *,
          user:users(*)
        )
      `)
      .eq('id', newEvent.id)
      .single()
    
    return NextResponse.json({ event: fullEvent })
  } catch (error) {
    console.error('Error in events POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/events - Update event or participant response
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, eventId, updates, userId, response } = body as {
      action: 'update' | 'respond'
      eventId: string
      updates?: Database['public']['Tables']['events']['Update']
      userId?: string
      response?: 'going' | 'not_going'
    }
    
    const supabase = getSupabaseAdmin()
    
    if (action === 'respond' && userId && response) {
      // Update participant response
      const { error } = await supabase
        .from('event_participants')
        .upsert({
          event_id: eventId,
          user_id: userId,
          response,
          updated_at: new Date().toISOString(),
        })
      
      if (error) {
        console.error('Error updating response:', error)
        return NextResponse.json({ error: 'Failed to update response' }, { status: 500 })
      }
      
      return NextResponse.json({ success: true })
    }
    
    if (action === 'update' && updates) {
      const { error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', eventId)
      
      if (error) {
        console.error('Error updating event:', error)
        return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
      }
      
      return NextResponse.json({ success: true })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error in events PATCH:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/events - Delete event
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, userId } = body as { eventId: string; userId: string }
    
    const supabase = getSupabaseAdmin()
    
    // Check if user is creator
    const { data: event } = await supabase
      .from('events')
      .select('created_by')
      .eq('id', eventId)
      .single()
    
    if (!event || event.created_by !== userId) {
      return NextResponse.json({ error: 'Only creator can delete event' }, { status: 403 })
    }
    
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
    
    if (error) {
      return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in events DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
