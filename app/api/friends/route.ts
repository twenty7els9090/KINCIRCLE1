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
 * GET /api/friends?userId=xxx - Get user's friends list
 * GET /api/friends?userId=xxx&pending=true - Get pending friend requests
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const pending = searchParams.get('pending')
    const sent = searchParams.get('sent')
    
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }
    
    const supabase = getSupabaseAdmin()
    
    // Get pending friend requests received
    if (pending === 'true') {
      const { data: requests, error } = await supabase
        .from('friend_requests')
        .select(`
          *,
          sender:users!friend_requests_sender_id_fkey(*),
          receiver:users!friend_requests_receiver_id_fkey(*)
        `)
        .eq('receiver_id', userId)
        .eq('status', 'pending')
      
      if (error) {
        console.error('Error fetching pending requests:', error)
        return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 })
      }
      
      return NextResponse.json({ requests })
    }
    
    // Get sent friend requests
    if (sent === 'true') {
      const { data: requests, error } = await supabase
        .from('friend_requests')
        .select(`
          *,
          sender:users!friend_requests_sender_id_fkey(*),
          receiver:users!friend_requests_receiver_id_fkey(*)
        `)
        .eq('sender_id', userId)
        .eq('status', 'pending')
      
      if (error) {
        console.error('Error fetching sent requests:', error)
        return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 })
      }
      
      return NextResponse.json({ requests })
    }
    
    // Get friends list
    const { data: friendships, error } = await supabase
      .from('friendships')
      .select(`
        created_at,
        friend:users!friendships_friend_id_fkey(*)
      `)
      .eq('user_id', userId)
    
    if (error) {
      console.error('Error fetching friends:', error)
      return NextResponse.json({ error: 'Failed to fetch friends' }, { status: 500 })
    }
    
    const friends = friendships?.map((f) => ({
      ...(f.friend as any),
      friendship_created_at: f.created_at,
    })) || []
    
    return NextResponse.json({ friends })
  } catch (error) {
    console.error('Error in friends GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/friends - Send friend request
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { senderId, receiverId } = body as { senderId: string; receiverId: string }
    
    if (!senderId || !receiverId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }
    
    const supabase = getSupabaseAdmin()
    
    // Check if already friends or request exists
    const { data: existingRequest } = await supabase
      .from('friend_requests')
      .select('*')
      .or(`and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`)
      .single()
    
    if (existingRequest) {
      return NextResponse.json({ error: 'Request already exists' }, { status: 400 })
    }
    
    const { data: existingFriendship } = await supabase
      .from('friendships')
      .select('*')
      .or(`and(user_id.eq.${senderId},friend_id.eq.${receiverId}),and(user_id.eq.${receiverId},friend_id.eq.${senderId})`)
      .single()
    
    if (existingFriendship) {
      return NextResponse.json({ error: 'Already friends' }, { status: 400 })
    }
    
    // Create friend request
    const { data: request, error } = await supabase
      .from('friend_requests')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        status: 'pending',
      })
      .select(`
        *,
        sender:users!friend_requests_sender_id_fkey(*),
        receiver:users!friend_requests_receiver_id_fkey(*)
      `)
      .single()
    
    if (error) {
      console.error('Error creating friend request:', error)
      return NextResponse.json({ error: 'Failed to create request' }, { status: 500 })
    }
    
    return NextResponse.json({ request })
  } catch (error) {
    console.error('Error in friends POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/friends - Accept/Decline friend request
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { requestId, action } = body as { requestId: string; action: 'accept' | 'decline' }
    
    if (!requestId || !action) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }
    
    const supabase = getSupabaseAdmin()
    
    // Get the friend request
    const { data: friendRequest, error: fetchError } = await supabase
      .from('friend_requests')
      .select('*')
      .eq('id', requestId)
      .single()
    
    if (fetchError || !friendRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }
    
    if (action === 'accept') {
      // Update request status
      const { error: updateError } = await supabase
        .from('friend_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId)
      
      if (updateError) {
        return NextResponse.json({ error: 'Failed to update request' }, { status: 500 })
      }
      
      // Create friendships (both directions)
      const { error: friendshipError } = await supabase
        .from('friendships')
        .insert([
          { user_id: friendRequest.sender_id, friend_id: friendRequest.receiver_id },
          { user_id: friendRequest.receiver_id, friend_id: friendRequest.sender_id },
        ])
      
      if (friendshipError) {
        console.error('Error creating friendships:', friendshipError)
        return NextResponse.json({ error: 'Failed to create friendship' }, { status: 500 })
      }
      
      return NextResponse.json({ success: true, action: 'accepted' })
    } else {
      // Decline request
      const { error: updateError } = await supabase
        .from('friend_requests')
        .update({ status: 'declined' })
        .eq('id', requestId)
      
      if (updateError) {
        return NextResponse.json({ error: 'Failed to update request' }, { status: 500 })
      }
      
      return NextResponse.json({ success: true, action: 'declined' })
    }
  } catch (error) {
    console.error('Error in friends PATCH:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/friends - Remove friend
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, friendId } = body as { userId: string; friendId: string }
    
    if (!userId || !friendId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }
    
    const supabase = getSupabaseAdmin()
    
    // Delete both directions of friendship
    const { error } = await supabase
      .from('friendships')
      .delete()
      .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`)
    
    if (error) {
      console.error('Error removing friend:', error)
      return NextResponse.json({ error: 'Failed to remove friend' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in friends DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
