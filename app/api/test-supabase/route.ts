import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Test connection by fetching members
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .limit(5);

    if (error) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message,
          details: error
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully connected to Supabase!',
      memberCount: data?.length || 0,
      sampleData: data,
      totalMembers: data?.length || 0
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Unknown error',
        details: error
      },
      { status: 500 }
    );
  }
}

