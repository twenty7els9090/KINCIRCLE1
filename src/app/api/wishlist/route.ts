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
 * GET /api/wishlist?userId=xxx - Get user's wishlist
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }
    
    const supabase = getSupabaseAdmin()
    
    const { data: items, error } = await supabase
      .from('wishlist_items')
      .select(`
        *,
        owner:users!wishlist_items_user_id_fkey(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching wishlist:', error)
      return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 })
    }
    
    return NextResponse.json({ items })
  } catch (error) {
    console.error('Error in wishlist GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/wishlist - Create wishlist item
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const itemData = body as Database['public']['Tables']['wishlist_items']['Insert']
    
    const supabase = getSupabaseAdmin()
    
    const { data: item, error } = await supabase
      .from('wishlist_items')
      .insert({
        ...itemData,
        is_booked: false,
      })
      .select(`
        *,
        owner:users!wishlist_items_user_id_fkey(*)
      `)
      .single()
    
    if (error) {
      console.error('Error creating wishlist item:', error)
      return NextResponse.json({ error: 'Failed to create item' }, { status: 500 })
    }
    
    return NextResponse.json({ item })
  } catch (error) {
    console.error('Error in wishlist POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/wishlist - Update or book/unbook item
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, itemId, updates, userId } = body as {
      action: 'update' | 'book' | 'unbook'
      itemId: string
      updates?: Database['public']['Tables']['wishlist_items']['Update']
      userId?: string
    }
    
    const supabase = getSupabaseAdmin()
    
    if (action === 'book' && userId) {
      // Book item
      const { data: item, error: updateError } = await supabase
        .from('wishlist_items')
        .update({
          is_booked: true,
          booked_by: userId,
        })
        .eq('id', itemId)
        .select('user_id')
        .single()
      
      if (updateError) {
        return NextResponse.json({ error: 'Failed to book item' }, { status: 500 })
      }
      
      // Create booking record
      await supabase
        .from('wishlist_bookings')
        .insert({
          item_id: itemId,
          user_id: userId,
        })
      
      return NextResponse.json({ success: true, booked: true })
    }
    
    if (action === 'unbook' && userId) {
      // Unbook item
      const { error: updateError } = await supabase
        .from('wishlist_items')
        .update({
          is_booked: false,
          booked_by: null,
        })
        .eq('id', itemId)
        .eq('booked_by', userId)
      
      if (updateError) {
        return NextResponse.json({ error: 'Failed to unbook item' }, { status: 500 })
      }
      
      // Update booking record
      await supabase
        .from('wishlist_bookings')
        .update({
          cancelled_at: new Date().toISOString(),
        })
        .eq('item_id', itemId)
        .eq('user_id', userId)
        .is('cancelled_at', null)
      
      return NextResponse.json({ success: true, booked: false })
    }
    
    if (action === 'update' && updates) {
      const { data: item, error } = await supabase
        .from('wishlist_items')
        .update(updates)
        .eq('id', itemId)
        .select(`
          *,
          owner:users!wishlist_items_user_id_fkey(*)
        `)
        .single()
      
      if (error) {
        return NextResponse.json({ error: 'Failed to update item' }, { status: 500 })
      }
      
      return NextResponse.json({ item })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error in wishlist PATCH:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/wishlist - Delete wishlist item
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { itemId, userId } = body as { itemId: string; userId: string }
    
    const supabase = getSupabaseAdmin()
    
    // Check ownership
    const { data: item } = await supabase
      .from('wishlist_items')
      .select('user_id')
      .eq('id', itemId)
      .single()
    
    if (!item || item.user_id !== userId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }
    
    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('id', itemId)
    
    if (error) {
      return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in wishlist DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
