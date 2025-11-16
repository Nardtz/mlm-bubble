"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email.trim()) {
      setError("Email is required");
      setLoading(false);
      return;
    }

    const { error: resetError } = await resetPassword(email);

    if (resetError) {
      setError(resetError.message || "Failed to send password reset email");
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800/70 rounded-lg p-8 border border-purple-500/50 max-w-md w-full">
        <h1 className="text-3xl font-bold text-white mb-2">Forgot Password</h1>
        <p className="text-white/70 mb-6">Enter your email to receive a password reset link</p>

        {success ? (
          <div className="bg-green-600/20 border border-green-500/50 rounded-lg p-4 mb-4">
            <p className="text-green-400 font-semibold">Password reset email sent!</p>
            <p className="text-green-300 text-sm mt-2">
              Please check your email for the password reset link. It may take a few minutes to arrive.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-purple-500/50 focus:border-purple-500 focus:outline-none"
                placeholder="your.email@example.com"
                required
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
              {loading ? "Sending..." : "Send Reset Link"}
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

