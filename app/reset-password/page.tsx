"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const { updatePassword, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Refresh the session when the page loads (important for password reset flow)
    const checkAndRefreshSession = async () => {
      try {
        // First, check for hash fragment (Supabase password reset includes session in hash)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const hashAccessToken = hashParams.get('access_token');
        const hashRefreshToken = hashParams.get('refresh_token');
        const hashType = hashParams.get('type');
        
        // If we have tokens in the hash, set the session immediately
        // This is the primary way Supabase sends password reset links
        if (hashAccessToken && hashRefreshToken) {
          const { data: { session }, error: setSessionError } = await supabase.auth.setSession({
            access_token: hashAccessToken,
            refresh_token: hashRefreshToken,
          });
          
          if (!setSessionError && session) {
            // Clean up the hash from URL
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
            setCheckingSession(false);
            return;
          } else if (setSessionError) {
            console.error('Error setting session from hash:', setSessionError);
            setError("Failed to establish session from reset link. Please request a new password reset.");
            setCheckingSession(false);
            return;
          }
        }
        
        // Check server-side session via API (more reliable for cookie-based sessions)
        // Also check for code parameter (PKCE flow - less common for password reset)
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const sessionEstablished = urlParams.get('session_established') === 'true';
        
        if (code) {
          // If there's a code, we need to exchange it (but this might fail without verifier)
          // Redirect to callback route to handle it properly
          const callbackUrl = `/auth/callback?code=${code}&type=recovery`;
          window.location.href = callbackUrl;
          return;
        }
        
        if (sessionEstablished) {
          // Wait a moment for cookies to sync, then check server-side
          // Try multiple times as cookies might take time to be available
          let sessionVerified = false;
          for (let attempt = 0; attempt < 10; attempt++) {
            await new Promise(resolve => setTimeout(resolve, 300));
            
            try {
              const verifyResponse = await fetch('/api/verify-reset-session', {
                credentials: 'include', // Important: include cookies
              });
              
              if (verifyResponse.ok) {
                const verifyResult = await verifyResponse.json();
                
                if (verifyResult.success && verifyResult.hasSession) {
                  // Server confirms session exists, now sync to client
                  // Force a session refresh on client side
                  const { data: { session: clientSession } } = await supabase.auth.getSession();
                  
                  if (!clientSession) {
                    // Try refreshing
                    await supabase.auth.refreshSession();
                    const { data: { session: refreshedSession } } = await supabase.auth.getSession();
                    if (refreshedSession) {
                      sessionVerified = true;
                      break;
                    }
                  } else {
                    sessionVerified = true;
                    break;
                  }
                }
              }
            } catch (err) {
              console.log('Session verification attempt failed, retrying...', attempt);
            }
          }
          
          if (sessionVerified) {
            setCheckingSession(false);
            return;
          }
        }
        
        // Fallback: Check client-side session
        let { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
        }

        // If no session, wait and retry (cookies might need time to sync)
        if (!session) {
          for (let i = 0; i < 15; i++) {
            await new Promise(resolve => setTimeout(resolve, 300));
            const { data: { session: retrySession } } = await supabase.auth.getSession();
            
            if (retrySession) {
              session = retrySession;
              break;
            }
            
            // Also check server-side every few attempts
            if (i % 3 === 0) {
              const verifyResponse = await fetch('/api/verify-reset-session');
              const verifyResult = await verifyResponse.json();
              if (verifyResult.success && verifyResult.hasSession) {
                // Server has session, force client refresh
                await supabase.auth.refreshSession();
                const { data: { session: refreshedSession } } = await supabase.auth.getSession();
                if (refreshedSession) {
                  session = refreshedSession;
                  break;
                }
              }
            }
          }
        }

        // Final check
        if (!session) {
          setError("Invalid or expired reset link. Please click the reset link from your email again.");
          setCheckingSession(false);
          return;
        }

        // Session is available, allow password reset
        setCheckingSession(false);
      } catch (err: any) {
        console.error('Error checking session:', err);
        setError("Failed to verify reset link. Please try again.");
        setCheckingSession(false);
      }
    };

    checkAndRefreshSession();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!password.trim()) {
      setError("Password is required");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // First, ensure we have a valid session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      setError("Auth session missing! Please click the reset link from your email again.");
      setLoading(false);
      return;
    }

    const { error: updateError } = await updatePassword(password);

    if (updateError) {
      // Check if it's the "Auth session missing" error
      if (updateError.message?.includes('session') || updateError.message?.includes('Auth session missing')) {
        setError("Session expired. Please click the reset link from your email again to continue.");
      } else {
        setError(updateError.message || "Failed to update password");
      }
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800/70 rounded-lg p-8 border border-purple-500/50 max-w-md w-full">
          <div className="text-white text-center">
            <p>Verifying reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800/70 rounded-lg p-8 border border-purple-500/50 max-w-md w-full">
        <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
        <p className="text-white/70 mb-6">Enter your new password</p>

        {success ? (
          <div className="bg-green-600/20 border border-green-500/50 rounded-lg p-4 mb-4">
            <p className="text-green-400 font-semibold">Password updated successfully!</p>
            <p className="text-green-300 text-sm mt-2">
              Redirecting to login page...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white mb-2">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-purple-500/50 focus:border-purple-500 focus:outline-none"
                placeholder="At least 6 characters"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-white mb-2">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-purple-500/50 focus:border-purple-500 focus:outline-none"
                placeholder="Re-enter your password"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="bg-red-600/20 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-semibold"
            >
              {loading ? "Updating Password..." : "Update Password"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-white/70">
            Remember your password?{" "}
            <Link href="/login" className="text-purple-400 hover:text-purple-300 font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

