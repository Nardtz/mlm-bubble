"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError(signInError.message || "Failed to sign in");
      setLoading(false);
    } else {
      // Wait for session to be synced to cookies (browser client handles this automatically)
      await new Promise(resolve => setTimeout(resolve, 300));
      // Use router.push instead of window.location to maintain React state
      router.push("/");
      router.refresh(); // Force refresh to sync server state
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800/70 rounded-lg p-8 border border-purple-500/50 max-w-md w-full">
        <h1 className="text-3xl font-bold text-white mb-2">Sign In</h1>
        <p className="text-white/70 mb-6">Sign in to manage your MLM downlines</p>
        <div className="bg-blue-600/20 border border-blue-500/50 rounded-lg p-3 mb-4">
          <p className="text-blue-300 text-xs">
            💡 Make sure you've verified your email after signing up. Check your inbox for the verification link.
          </p>
        </div>

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

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-white">Password</label>
              <Link
                href="/forgot-password"
                className="text-sm text-purple-400 hover:text-purple-300 font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-purple-500/50 focus:border-purple-500 focus:outline-none"
              placeholder="Enter your password"
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
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-white/70">
            Don't have an account?{" "}
            <Link href="/signup" className="text-purple-400 hover:text-purple-300 font-semibold">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

