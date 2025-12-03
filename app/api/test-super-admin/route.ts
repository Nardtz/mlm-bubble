import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Not logged in',
        userId: null
      });
    }

    // Direct query to check super admin (bypassing potential RLS issues for testing)
    // Use maybeSingle() instead of single() to handle case where profile doesn't exist
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, email, is_super_admin')
      .eq('id', user.id)
      .maybeSingle();
    
    // If profile doesn't exist, create it
    if (!profile && !profileError) {
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          username: user.email?.split('@')[0] || 'user',
          email: user.email || '',
          is_super_admin: false
        })
        .select()
        .single();
      
      if (createError) {
        return NextResponse.json({
          success: false,
          error: 'Failed to create profile: ' + createError.message,
          userId: user.id
        });
      }
      
      return NextResponse.json({
        success: true,
        userId: user.id,
        userEmail: user.email,
        profile: newProfile,
        isSuperAdmin: false,
        message: 'Profile created. Please run SQL to set as super admin.',
        note: 'Profile was just created. Run the SQL update to set is_super_admin = TRUE'
      });
    }

    return NextResponse.json({
      success: true,
      userId: user.id,
      userEmail: user.email,
      profile: profile,
      isSuperAdmin: profile?.is_super_admin === true,
      profileError: profileError?.message,
      rawIsSuperAdmin: profile?.is_super_admin
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

