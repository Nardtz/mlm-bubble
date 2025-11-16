import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const type = requestUrl.searchParams.get('type'); // 'recovery' for password reset

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
    
    // If it's a password recovery, redirect to reset password page
    if (type === 'recovery') {
      return NextResponse.redirect(new URL('/reset-password', requestUrl.origin));
    }
  }

  // Redirect to home page after email verification
  return NextResponse.redirect(new URL('/', requestUrl.origin));
}

