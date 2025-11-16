"use client";

import { useEffect, useState } from "react";
import BubbleVisualization from "@/components/bubble-visualization";
import { MLMData } from "@/types/mlm";
import { dummyMLMData } from "@/data/dummy-data";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export default function Home() {
  const [mlmData, setMlmData] = useState<MLMData>(dummyMLMData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('Page auth state:', { authLoading, user: user?.id || 'none' });
    
    if (!authLoading) {
      if (!user) {
        console.log('No user, redirecting to login');
        router.push('/login');
        return;
      }
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) {
      console.log('No user, skipping data fetch');
      return;
    }

    console.log('Fetching MLM data for user:', user.id);
    setLoading(true);

    async function fetchData() {
      try {
        console.log('Initializing user...');
        // First, ensure user has "ME" member initialized
        const initResponse = await fetch('/api/initialize-user', { method: 'POST' });
        const initResult = await initResponse.json();
        console.log('Initialize user result:', initResult);
        
        console.log('Fetching MLM data...');
        // Then fetch MLM data
        const response = await fetch('/api/mlm-data');
        const result = await response.json();
        console.log('MLM data result:', result);
        
        if (result.success && result.data) {
          setMlmData(result.data);
          setError(null);
        } else {
          console.error('Failed to fetch data:', result.error);
          if (result.error?.includes('Unauthorized')) {
            router.push('/login');
            return;
          }
          setError(result.error || 'Failed to load data');
          // Fall back to dummy data
          setMlmData(dummyMLMData);
        }
      } catch (err: any) {
        console.error('Error fetching MLM data:', err);
        setError(err.message);
        // Fall back to dummy data
        setMlmData(dummyMLMData);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Redirecting to login...</div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Link
          href="/admin"
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-semibold shadow-lg"
        >
          Admin Panel
        </Link>
      </div>
      {error && !error.includes('Unauthorized') && (
        <div className="absolute top-16 right-4 z-10 px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm">
          Using fallback data: {error}
        </div>
      )}
      <BubbleVisualization data={mlmData} />
    </div>
  );
}

