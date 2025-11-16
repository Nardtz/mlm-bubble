"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
    // Wait a moment for session to be established from the reset link
    const timer = setTimeout(() => {
      setCheckingSession(false);
      // If no user after timeout, they might need to click the link again
      if (!user) {
        setError("Invalid or expired reset link. Please request a new password reset.");
      }
    }, 2000);

    return () => clearTimeout(timer);
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

    const { error: updateError } = await updatePassword(password);

    if (updateError) {
      setError(updateError.message || "Failed to update password");
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

