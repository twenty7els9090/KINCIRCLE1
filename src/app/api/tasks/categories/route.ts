/**
 * Task Categories API Route
 * Handles task category management
 */
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

/**
 * GET /api/tasks/categories
 * Get all task categories
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // shopping, home, other
    
    const supabase = await createSupabaseServerClient();
    
    let query = supabase
      .from('task_categories')
      .select('*')
      .order('order', { ascending: true });
    
    if (type) {
      query = query.eq('type', type);
    }
    
    const { data: categories, error } = await query;
    
    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch categories' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error('Categories API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tasks/categories
 * Create a new category (admin only in real app)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, icon, image_url, type, order } = body;
    
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }
    
    const supabase = await createSupabaseServerClient();
    
    const { data: category, error } = await supabase
      .from('task_categories')
      .insert({
        id: uuidv4(),
        name,
        icon: icon || null,
        image_url: image_url || null,
        type: type || 'other',
        order: order || 0,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating category:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create category' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
