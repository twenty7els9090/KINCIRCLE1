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
 * GET /api/families?userId=xxx - Get user's families
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const familyId = searchParams.get('familyId')
    
    if (!userId && !familyId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }
    
    const supabase = getSupabaseAdmin()
    
    // Get specific family
    if (familyId) {
      const { data: family, error } = await supabase
        .from('family_groups')
        .select(`
          *,
          members:family_members(
            *,
            user:users(*)
          )
        `)
        .eq('id', familyId)
        .single()
      
      if (error) {
        return NextResponse.json({ error: 'Family not found' }, { status: 404 })
      }
      
      return NextResponse.json({ family })
    }
    
    // Get all user's families
    const { data: memberships, error } = await supabase
      .from('family_members')
      .select(`
        family_id,
        role,
        joined_at,
        family:family_groups(
          *,
          members:family_members(
            *,
            user:users(*)
          )
        )
      `)
      .eq('user_id', userId!)
    
    if (error) {
      console.error('Error fetching families:', error)
      return NextResponse.json({ error: 'Failed to fetch families' }, { status: 500 })
    }
    
    const families = memberships?.map((m) => ({
      ...m.family,
      role: m.role,
      joined_at: m.joined_at,
    })) || []
    
    return NextResponse.json({ families })
  } catch (error) {
    console.error('Error in families GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/families - Create family group
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, creatorId } = body as { name: string; creatorId: string }
    
    if (!name || !creatorId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }
    
    const supabase = getSupabaseAdmin()
    
    // Create family group
    const { data: family, error: familyError } = await supabase
      .from('family_groups')
      .insert({
        name,
        created_by: creatorId,
      })
      .select()
      .single()
    
    if (familyError) {
      console.error('Error creating family:', familyError)
      return NextResponse.json({ error: 'Failed to create family' }, { status: 500 })
    }
    
    // Add creator as admin
    const { error: memberError } = await supabase
      .from('family_members')
      .insert({
        family_id: family.id,
        user_id: creatorId,
        role: 'admin',
      })
    
    if (memberError) {
      console.error('Error adding family member:', memberError)
      return NextResponse.json({ error: 'Failed to add member' }, { status: 500 })
    }
    
    // Fetch the family with members
    const { data: fullFamily } = await supabase
      .from('family_groups')
      .select(`
        *,
        members:family_members(
          *,
          user:users(*)
        )
      `)
      .eq('id', family.id)
      .single()
    
    return NextResponse.json({ family: fullFamily })
  } catch (error) {
    console.error('Error in families POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/families - Invite member / Update family
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, familyId, userId, role, name } = body as {
      action: 'invite' | 'update' | 'remove'
      familyId: string
      userId?: string
      role?: 'admin' | 'member'
      name?: string
    }
    
    const supabase = getSupabaseAdmin()
    
    if (action === 'invite' && userId) {
      // Check if already a member
      const { data: existing } = await supabase
        .from('family_members')
        .select('*')
        .eq('family_id', familyId)
        .eq('user_id', userId)
        .single()
      
      if (existing) {
        return NextResponse.json({ error: 'Already a member' }, { status: 400 })
      }
      
      // Add member
      const { error } = await supabase
        .from('family_members')
        .insert({
          family_id: familyId,
          user_id: userId,
          role: role || 'member',
        })
      
      if (error) {
        console.error('Error inviting member:', error)
        return NextResponse.json({ error: 'Failed to invite member' }, { status: 500 })
      }
      
      return NextResponse.json({ success: true })
    }
    
    if (action === 'update' && name) {
      const { error } = await supabase
        .from('family_groups')
        .update({ name })
        .eq('id', familyId)
      
      if (error) {
        return NextResponse.json({ error: 'Failed to update family' }, { status: 500 })
      }
      
      return NextResponse.json({ success: true })
    }
    
    if (action === 'remove' && userId) {
      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('family_id', familyId)
        .eq('user_id', userId)
      
      if (error) {
        return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 })
      }
      
      return NextResponse.json({ success: true })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error in families PATCH:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/families - Delete family group
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { familyId, userId } = body as { familyId: string; userId: string }
    
    const supabase = getSupabaseAdmin()
    
    // Check if user is admin
    const { data: membership } = await supabase
      .from('family_members')
      .select('role')
      .eq('family_id', familyId)
      .eq('user_id', userId)
      .single()
    
    if (!membership || membership.role !== 'admin') {
      return NextResponse.json({ error: 'Only admin can delete family' }, { status: 403 })
    }
    
    // Delete all members first
    await supabase
      .from('family_members')
      .delete()
      .eq('family_id', familyId)
    
    // Delete family
    const { error } = await supabase
      .from('family_groups')
      .delete()
      .eq('id', familyId)
    
    if (error) {
      return NextResponse.json({ error: 'Failed to delete family' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in families DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
