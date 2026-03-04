import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'

function getSupabaseAdmin() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

/**
 * GET /api/users?userId=xxx - Get user by ID
 * GET /api/users?search=username - Search users by username
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const search = searchParams.get('search')
    const telegramId = searchParams.get('telegramId')
    
    const supabase = getSupabaseAdmin()
    
    // Get user by ID
    if (userId) {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      
      return NextResponse.json({ user })
    }
    
    // Get user by Telegram ID
    if (telegramId) {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', parseInt(telegramId, 10))
        .single()
      
      if (error) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      
      return NextResponse.json({ user })
    }
    
    // Search users by username
    if (search) {
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .ilike('username', `%${search}%`)
        .limit(20)
      
      if (error) {
        return NextResponse.json({ error: 'Search failed' }, { status: 500 })
      }
      
      return NextResponse.json({ users })
    }
    
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/users - Update user profile
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, updates } = body as {
      userId: string
      updates: {
        first_name?: string
        last_name?: string
        birthday?: string
        avatar_url?: string
      }
    }
    
    if (!userId || !updates) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }
    
    const supabase = getSupabaseAdmin()
    
    const { data: user, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }
    
    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
