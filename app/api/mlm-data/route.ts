import { NextResponse } from 'next/server';
import { getMLMData, isSuperAdmin, getAllMembersForSuperAdmin, transformAllUsersMLMData, getAllUsers } from '@/lib/supabase-queries';
import { createClient } from '@/lib/supabase-server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const allUsers = searchParams.get('all') === 'true';
    
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
      
      // Check if super admin and requesting all users
      if (allUsers) {
        const isAdmin = await isSuperAdmin(session.user.id, supabase);
        if (!isAdmin) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'Unauthorized. Super admin access required.'
            },
            { status: 403 }
          );
        }
        
        const allMembers = await getAllMembersForSuperAdmin(supabase);
        const allUsersData = await transformAllUsersMLMData(allMembers, supabase);
        return NextResponse.json({ success: true, data: allUsersData, isSuperAdmin: true });
      }
      
      const mlmData = await getMLMData(session.user.id, supabase);
      return NextResponse.json({ success: true, data: mlmData });
    }

    // Check if super admin and requesting all users
    if (allUsers) {
      const isAdmin = await isSuperAdmin(user.id, supabase);
      if (!isAdmin) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Unauthorized. Super admin access required.'
          },
          { status: 403 }
        );
      }
      
      const allMembers = await getAllMembersForSuperAdmin(supabase);
      const allUsersData = await transformAllUsersMLMData(allMembers, supabase);
      return NextResponse.json({ success: true, data: allUsersData, isSuperAdmin: true });
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

