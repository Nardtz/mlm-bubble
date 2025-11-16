import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(request: Request) {
  try {
    // Check for environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { success: false, error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = await createClient();
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

