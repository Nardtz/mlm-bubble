import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const type = requestUrl.searchParams.get('type'); // 'recovery' for password reset
  const error = requestUrl.searchParams.get('error');
  const errorCode = requestUrl.searchParams.get('error_code');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // Handle errors (expired links, invalid tokens, etc.)
  if (error) {
    const errorMessage = errorDescription 
      ? decodeURIComponent(errorDescription.replace(/\+/g, ' '))
      : error === 'access_denied' && errorCode === 'otp_expired'
      ? 'Email verification link has expired. Please request a new verification email.'
      : 'Email verification failed. Please try again.';
    
    // Redirect to login with error message
    const loginUrl = new URL('/login', requestUrl.origin);
    loginUrl.searchParams.set('error', errorMessage);
    loginUrl.searchParams.set('error_type', errorCode || error);
    return NextResponse.redirect(loginUrl);
  }

  if (code) {
    try {
      const supabase = await createClient();
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        // If exchange fails, redirect to login with error
        const loginUrl = new URL('/login', requestUrl.origin);
        loginUrl.searchParams.set('error', exchangeError.message || 'Failed to verify email. Please try again.');
        return NextResponse.redirect(loginUrl);
      }
      
      // If it's a password recovery, redirect to reset password page
      if (type === 'recovery') {
        return NextResponse.redirect(new URL('/reset-password', requestUrl.origin));
      }
      
      // Success - redirect to home
      return NextResponse.redirect(new URL('/', requestUrl.origin));
    } catch (err: any) {
      // Catch any unexpected errors
      const loginUrl = new URL('/login', requestUrl.origin);
      loginUrl.searchParams.set('error', err.message || 'An error occurred during email verification.');
      return NextResponse.redirect(loginUrl);
    }
  }

  // No code and no error - redirect to home
  return NextResponse.redirect(new URL('/', requestUrl.origin));
}

