import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'

// Create Supabase admin client for server-side operations
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

interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  photo_url?: string
}

interface TelegramInitData {
  user?: TelegramUser
  auth_date?: number
  hash?: string
}

/**
 * Verify Telegram WebApp init data
 * In production, you should properly verify the hash using Bot token
 */
function verifyTelegramInitData(initData: string): TelegramInitData | null {
  try {
    // Parse the init data string
    const params = new URLSearchParams(initData)
    const userStr = params.get('user')
    
    if (!userStr) return null
    
    const user = JSON.parse(userStr) as TelegramUser
    const authDate = params.get('auth_date')
    
    return {
      user,
      auth_date: authDate ? parseInt(authDate, 10) : undefined,
      hash: params.get('hash') || undefined,
    }
  } catch (error) {
    console.error('Failed to parse Telegram init data:', error)
    return null
  }
}

/**
 * POST /api/auth/telegram
 * Authenticate user via Telegram WebApp data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { initData } = body as { initData: string }
    
    if (!initData) {
      return NextResponse.json(
        { error: 'Missing init data' },
        { status: 400 }
      )
    }
    
    const parsedData = verifyTelegramInitData(initData)
    
    if (!parsedData || !parsedData.user) {
      return NextResponse.json(
        { error: 'Invalid Telegram data' },
        { status: 400 }
      )
    }
    
    const telegramUser = parsedData.user
    const supabase = getSupabaseAdmin()
    
    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramUser.id)
      .single()
    
    if (existingUser && !fetchError) {
      // Update chat_id and other info
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          username: telegramUser.username || existingUser.username,
          first_name: telegramUser.first_name || existingUser.first_name,
          last_name: telegramUser.last_name || existingUser.last_name,
          avatar_url: telegramUser.photo_url || existingUser.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingUser.id)
        .select()
        .single()
      
      if (updateError) {
        console.error('Error updating user:', updateError)
        return NextResponse.json(
          { error: 'Failed to update user' },
          { status: 500 }
        )
      }
      
      return NextResponse.json({
        user: updatedUser,
        isNewUser: false,
      })
    }
    
    // Create new user
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        telegram_id: telegramUser.id,
        username: telegramUser.username || null,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name || null,
        avatar_url: telegramUser.photo_url || null,
        chat_id: telegramUser.id, // Use telegram_id as chat_id initially
      })
      .select()
      .single()
    
    if (createError) {
      console.error('Error creating user:', createError)
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      user: newUser,
      isNewUser: true,
    })
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
