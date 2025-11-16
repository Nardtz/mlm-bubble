import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('id');

    if (!parentId) {
      return NextResponse.json(
        { success: false, error: 'Parent ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', parentId)
      .single();

    if (error || !data) {
      return NextResponse.json({
        success: false,
        exists: false,
        error: error?.message || 'Parent not found'
      });
    }

    return NextResponse.json({
      success: true,
      exists: true,
      parent: data
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

