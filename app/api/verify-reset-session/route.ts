import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    // Try to get user first (this also refreshes the session)
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      // If getUser fails, try getSession
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        return NextResponse.json(
          { 
            success: false, 
            hasSession: false,
            error: sessionError?.message || 'No session found',
            debug: 'Both getUser and getSession failed'
          },
          { status: 401 }
        );
      }
      
      return NextResponse.json({ 
        success: true, 
        hasSession: true,
        userId: session.user.id 
      });
    }
    
    if (!user) {
      // Try getSession as fallback
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        return NextResponse.json(
          { 
            success: false, 
            hasSession: false,
            error: 'No session found',
            debug: 'No user and no session'
          },
          { status: 401 }
        );
      }
      
      return NextResponse.json({ 
        success: true, 
        hasSession: true,
        userId: session.user.id 
      });
    }
    
    // User exists, session is valid
    return NextResponse.json({ 
      success: true, 
      hasSession: true,
      userId: user.id 
    });
  } catch (error: any) {
    console.error('Error verifying reset session:', error);
    return NextResponse.json(
      { 
        success: false, 
        hasSession: false,
        error: error.message || 'Failed to verify session',
        debug: error.toString()
      },
      { status: 500 }
    );
  }
}

