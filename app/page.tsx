"use client";

import { useEffect, useState } from "react";
import BubbleVisualization from "@/components/bubble-visualization";
import { MLMData } from "@/types/mlm";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

// Empty MLM data structure to avoid showing dummy data
const emptyMLMData: MLMData = {
  me: {
    name: "Loading...",
    startingCapital: 0,
  },
  firstLevel: [],
  secondLevel: {},
  thirdLevel: {},
};

export default function Home() {
  const [mlmData, setMlmData] = useState<MLMData>(emptyMLMData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
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
          setDataLoaded(true);
        } else {
          console.error('Failed to fetch data:', result.error);
          if (result.error?.includes('Unauthorized')) {
            router.push('/login');
            return;
          }
          setError(result.error || 'Failed to load data');
          // Don't fall back to dummy data - keep empty structure
          setDataLoaded(true);
        }
      } catch (err: any) {
        console.error('Error fetching MLM data:', err);
        setError(err.message);
        // Don't fall back to dummy data - keep empty structure
        setDataLoaded(true);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user, router]);

  if (authLoading) {
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

  // Don't render visualization until data is actually loaded
  // Check if we're still loading OR if the ME name is still "Loading..." (initial state)
  const isDataLoading = loading || !dataLoaded || mlmData.me.name === "Loading...";

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
          Error loading data: {error}
        </div>
      )}
      {isDataLoading ? (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-white text-xl mb-2">Loading your data...</div>
            <div className="text-white/70 text-sm">Please wait while we fetch your downlines</div>
          </div>
        </div>
      ) : (
        <BubbleVisualization data={mlmData} />
      )}
    </div>
  );
}

