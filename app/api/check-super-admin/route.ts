import { NextResponse } from 'next/server';
import { isSuperAdmin } from '@/lib/supabase-queries';
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
        return NextResponse.json(
          { 
            success: false, 
            isSuperAdmin: false,
            error: 'Unauthorized. Please sign in.'
          },
          { status: 401 }
        );
      }
      
      const adminStatus = await isSuperAdmin(session.user.id, supabase);
      return NextResponse.json({ success: true, isSuperAdmin: adminStatus });
    }

    const adminStatus = await isSuperAdmin(user.id, supabase);
    return NextResponse.json({ success: true, isSuperAdmin: adminStatus });
  } catch (error: any) {
    console.error('Error checking super admin status:', error);
    return NextResponse.json(
      { 
        success: false, 
        isSuperAdmin: false,
        error: error.message || 'Failed to check super admin status'
      },
      { status: 500 }
    );
  }
}

