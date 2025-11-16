import { NextResponse } from 'next/server';
import { getMLMData } from '@/lib/supabase-queries';
import { createClient } from '@/lib/supabase-server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Try to get user first (this refreshes the session)
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      // Fallback to getSession if getUser fails
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session?.user) {
        console.error('Auth error:', authError);
        return NextResponse.json(
          { 
            success: false, 
            error: 'Unauthorized. Please sign in.'
          },
          { status: 401 }
        );
      }
      
      const mlmData = await getMLMData(session.user.id, supabase);
      return NextResponse.json({ success: true, data: mlmData });
    }

    const mlmData = await getMLMData(user.id, supabase);
    return NextResponse.json({ success: true, data: mlmData });
  } catch (error: any) {
    console.error('Error fetching MLM data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch MLM data'
      },
      { status: 500 }
    );
  }
}

