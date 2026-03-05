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
 * GET /api/tasks?familyId=xxx - Get family's tasks
 * GET /api/tasks?categories=true - Get task categories
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const familyId = searchParams.get('familyId')
    const categories = searchParams.get('categories')
    const status = searchParams.get('status')
    
    const supabase = getSupabaseAdmin()
    
    // Get task categories
    if (categories === 'true') {
      const { data, error } = await supabase
        .from('task_categories')
        .select('*')
        .order('order')
      
      if (error) {
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
      }
      
      return NextResponse.json({ categories: data })
    }
    
    // Get family tasks
    if (!familyId) {
      return NextResponse.json({ error: 'Missing familyId' }, { status: 400 })
    }
    
    let query = supabase
      .from('tasks')
      .select(`
        *,
        category:task_categories(*),
        creator:users!tasks_created_by_fkey(*)
      `)
      .eq('family_id', familyId)
      .order('created_at', { ascending: false })
    
    if (status) {
      query = query.eq('status', status as any)
    }
    
    const { data: tasks, error } = await query
    
    if (error) {
      console.error('Error fetching tasks:', error)
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
    }
    
    return NextResponse.json({ tasks })
  } catch (error) {
    console.error('Error in tasks GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/tasks - Create new task
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const taskData = body as Database['public']['Tables']['tasks']['Insert']
    
    const supabase = getSupabaseAdmin()
    
    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        ...taskData,
        status: taskData.status || 'active',
      })
      .select(`
        *,
        category:task_categories(*),
        creator:users!tasks_created_by_fkey(*)
      `)
      .single()
    
    if (error) {
      console.error('Error creating task:', error)
      return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
    }
    
    return NextResponse.json({ task })
  } catch (error) {
    console.error('Error in tasks POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/tasks - Update task
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { taskId, updates } = body as {
      taskId: string
      updates: Database['public']['Tables']['tasks']['Update']
    }
    
    if (!taskId || !updates) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }
    
    const supabase = getSupabaseAdmin()
    
    // Handle status changes
    if (updates.status === 'completed') {
      updates.completed_at = new Date().toISOString()
    } else if (updates.status === 'archived') {
      updates.archived_at = new Date().toISOString()
    }
    
    const { data: task, error } = await supabase
      .from('tasks')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)
      .select(`
        *,
        category:task_categories(*),
        creator:users!tasks_created_by_fkey(*)
      `)
      .single()
    
    if (error) {
      console.error('Error updating task:', error)
      return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
    }
    
    return NextResponse.json({ task })
  } catch (error) {
    console.error('Error in tasks PATCH:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/tasks - Soft delete task (set status to 'deleted')
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { taskId } = body as { taskId: string }
    
    if (!taskId) {
      return NextResponse.json({ error: 'Missing taskId' }, { status: 400 })
    }
    
    const supabase = getSupabaseAdmin()
    
    const { error } = await supabase
      .from('tasks')
      .update({
        status: 'deleted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)
    
    if (error) {
      console.error('Error deleting task:', error)
      return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in tasks DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
