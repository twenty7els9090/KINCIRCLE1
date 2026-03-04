/**
 * Authentication API Route
 * Handles Telegram Mini App authentication
 */
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

// Telegram Web App data validation
interface TelegramInitData {
  query_id?: string;
  user?: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    photo_url?: string;
  };
  auth_date?: number;
  hash?: string;
}

/**
 * Validates Telegram Web App init data
 * In production, this should validate the hash using bot token
 */
function validateTelegramInitData(initData: string): TelegramInitData | null {
  try {
    // Parse the init data string
    const params = new URLSearchParams(initData);
    const userStr = params.get('user');
    
    if (!userStr) {
      return null;
    }
    
    const user = JSON.parse(userStr);
    
    return {
      query_id: params.get('query_id') || undefined,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        language_code: user.language_code,
        photo_url: user.photo_url,
      },
      auth_date: params.get('auth_date') ? parseInt(params.get('auth_date')!) : undefined,
      hash: params.get('hash') || undefined,
    };
  } catch {
    return null;
  }
}

/**
 * POST /api/auth
 * Authenticates user via Telegram Web App data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { initData } = body as { initData: string };
    
    if (!initData) {
      return NextResponse.json(
        { success: false, error: 'Init data is required' },
        { status: 400 }
      );
    }
    
    // Validate Telegram init data
    const telegramData = validateTelegramInitData(initData);
    
    if (!telegramData || !telegramData.user) {
      return NextResponse.json(
        { success: false, error: 'Invalid Telegram init data' },
        { status: 400 }
      );
    }
    
    const supabase = await createSupabaseServerClient();
    const { user: telegramUser } = telegramData;
    
    // Check if user exists
    let { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramUser.id)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      console.error('Error fetching user:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      );
    }
    
    // Generate avatar URL from Telegram photo or use placeholder
    const avatarUrl = telegramUser.photo_url || null;
    
    if (existingUser) {
      // Update existing user
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          first_name: telegramUser.first_name,
          last_name: telegramUser.last_name || null,
          username: telegramUser.username || null,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingUser.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('Error updating user:', updateError);
        return NextResponse.json(
          { success: false, error: 'Failed to update user' },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        success: true,
        data: updatedUser,
        isNewUser: false,
      });
    } else {
      // Create new user
      const newUserId = uuidv4();
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          id: newUserId,
          telegram_id: telegramUser.id,
          first_name: telegramUser.first_name,
          last_name: telegramUser.last_name || null,
          username: telegramUser.username || null,
          avatar_url: avatarUrl,
        })
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating user:', createError);
        return NextResponse.json(
          { success: false, error: 'Failed to create user' },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        success: true,
        data: newUser,
        isNewUser: true,
      });
    }
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth
 * Get current authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const supabase = await createSupabaseServerClient();
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
