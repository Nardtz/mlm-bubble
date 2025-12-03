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
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        // Check if it's a PKCE error (code verifier missing)
        // This can happen with password reset links if they're not configured correctly
        if (exchangeError.message?.includes('code verifier') || 
            exchangeError.message?.includes('both auth code and code verifier')) {
          // For password reset, redirect to reset page - Supabase might send tokens in hash instead
          if (type === 'recovery') {
            const resetUrl = new URL('/reset-password', requestUrl.origin);
            resetUrl.searchParams.set('error', 'Please use the link from your email directly. If the problem persists, request a new password reset.');
            return NextResponse.redirect(resetUrl);
          }
        }
        
        // If exchange fails, redirect to login with error
        const loginUrl = new URL('/login', requestUrl.origin);
        loginUrl.searchParams.set('error', exchangeError.message || 'Failed to verify email. Please try again.');
        return NextResponse.redirect(loginUrl);
      }

      // Verify session was created
      if (!data.session) {
        const loginUrl = new URL('/login', requestUrl.origin);
        loginUrl.searchParams.set('error', 'Failed to establish session. Please try again.');
        return NextResponse.redirect(loginUrl);
      }
      
      // If it's a password recovery, redirect to reset password page
      // Create a redirect response that will include the cookies
      if (type === 'recovery') {
        const resetUrl = new URL('/reset-password', requestUrl.origin);
        resetUrl.searchParams.set('session_established', 'true');
        
        // Create redirect response - cookies should be automatically included
        // by the Supabase client's cookie handlers
        const response = NextResponse.redirect(resetUrl);
        
        // The cookies are already set by exchangeCodeForSession through the cookie handlers
        // But we need to ensure they're in the response
        // The Supabase SSR client should handle this automatically
        
        return response;
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

