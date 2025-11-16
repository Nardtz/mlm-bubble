import { NextResponse } from 'next/server';
import { initializeUserMLM } from '@/lib/initialize-user';
import { createClient } from '@/lib/supabase-server';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    let userId: string;
    if (userError || !user) {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError || !session?.user) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
      userId = session.user.id;
    } else {
      userId = user.id;
    }

    // Pass the server-side Supabase client to the function
    const result = await initializeUserMLM(userId, supabase);
    
    if (result.success) {
      return NextResponse.json({ success: true, data: result.data });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error initializing user:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

