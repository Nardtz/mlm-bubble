"use client";

import { useState, useEffect } from "react";
import { MLMData } from "@/types/mlm";
import BubbleVisualization from "@/components/bubble-visualization";
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

type AllUsersData = Record<string, { userInfo: { username: string; email: string }; mlmData: MLMData }>;

export default function AdminPage() {
  const [mlmData, setMlmData] = useState<MLMData>(emptyMLMData);
  const [allUsersData, setAllUsersData] = useState<AllUsersData>({});
  const [dataVersion, setDataVersion] = useState(0); // Force re-render when data changes
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true); // Track if this is the first load
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [viewAllUsers, setViewAllUsers] = useState(false);
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
    }
  }, [user, authLoading, router]);

  // Check if user is super admin
  useEffect(() => {
    if (user) {
      // Try both endpoints to debug
      Promise.all([
        fetch('/api/check-super-admin').then(res => res.json()),
        fetch('/api/test-super-admin').then(res => res.json())
      ])
        .then(([checkResult, testResult]) => {
          console.log('Super admin check result:', checkResult);
          console.log('Super admin test result:', testResult);
          
          // Use test result if check result fails
          const isAdmin = checkResult.success 
            ? (checkResult.isSuperAdmin || false)
            : (testResult.isSuperAdmin || false);
            
          setIsSuperAdmin(isAdmin);
          console.log('Final super admin status:', isAdmin);
          
          if (!isAdmin) {
            console.warn('User is not set as super admin. Check database:', {
              userId: user.id,
              userEmail: user.email,
              testResult: testResult
            });
          }
        })
        .catch(err => {
          console.error('Error checking super admin status:', err);
        });
    }
  }, [user]);

  // Fetch data from Supabase on mount and after changes
  const fetchData = async (isInitial = false, fetchAll = false) => {
    if (!user) return;
    
    // Only show full-page loading on initial load
    if (isInitial) {
      setLoading(true);
    }
    
    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (isInitial && loading) {
        console.warn('Data fetch timeout - stopping loading state');
        setLoading(false);
        setInitialLoad(false);
        // Set empty data to show the page
        if (fetchAll) {
          setAllUsersData({});
        } else {
          setMlmData({
            ...emptyMLMData,
            me: { name: 'User', startingCapital: 0 }
          });
        }
      }
    }, 30000); // 30 second timeout
    
    try {
      if (fetchAll && isSuperAdmin) {
        // Fetch all users' data for super admin
        const controller = new AbortController();
        const fetchTimeout = setTimeout(() => controller.abort(), 25000); // 25 second timeout
        
        const response = await fetch('/api/mlm-data?all=true', {
          signal: controller.signal
        });
        clearTimeout(fetchTimeout);
        
        const result = await response.json();
        
        if (result.success && result.data) {
          setAllUsersData(result.data);
        } else {
          console.error('Failed to fetch all users data:', result.error);
          if (result.error?.includes('Unauthorized')) {
            router.push('/login');
            return;
          }
          setAllUsersData({});
        }
      } else {
        // First, ensure user has "ME" member initialized
        const initController = new AbortController();
        const initTimeout = setTimeout(() => initController.abort(), 10000); // 10 second timeout
        
        try {
          await fetch('/api/initialize-user', { 
            method: 'POST',
            signal: initController.signal
          });
          clearTimeout(initTimeout);
        } catch (initErr: any) {
          clearTimeout(initTimeout);
          if (initErr.name !== 'AbortError') {
            console.error('Error initializing user:', initErr);
          }
        }
        
        // Then fetch MLM data
        const controller = new AbortController();
        const fetchTimeout = setTimeout(() => controller.abort(), 20000); // 20 second timeout
        
        const response = await fetch('/api/mlm-data', {
          signal: controller.signal
        });
        clearTimeout(fetchTimeout);
        
        const result = await response.json();
        
        if (result.success && result.data) {
          setMlmData(result.data);
        } else {
          console.error('Failed to fetch data:', result.error);
          if (result.error?.includes('Unauthorized')) {
            router.push('/login');
            return;
          }
          // Keep empty structure on error, but mark as loaded
          setMlmData({
            ...emptyMLMData,
            me: { name: 'User', startingCapital: 0 }
          });
        }
      }
    } catch (err: any) {
      console.error('Error fetching MLM data:', err);
      // Keep empty structure on error, but mark as loaded
      if (fetchAll) {
        setAllUsersData({});
      } else {
        setMlmData({
          ...emptyMLMData,
          me: { name: 'User', startingCapital: 0 }
        });
      }
    } finally {
      clearTimeout(timeoutId);
      if (isInitial) {
        setLoading(false);
        setInitialLoad(false);
      }
    }
  };

  useEffect(() => {
    if (user) {
      // Only show loading screen on initial load
      if (initialLoad) {
        fetchData(true, viewAllUsers);
        
        // Safety timeout - force stop loading after 30 seconds
        const safetyTimeout = setTimeout(() => {
          if (loading) {
            console.warn('Force stopping loading state after timeout');
            setLoading(false);
            setInitialLoad(false);
            // Set default data to show the page
            if (viewAllUsers && isSuperAdmin) {
              setAllUsersData({});
            } else {
              setMlmData({
                ...emptyMLMData,
                me: { name: 'User', startingCapital: 0 }
              });
            }
          }
        }, 30000);
        
        return () => clearTimeout(safetyTimeout);
      } else {
        // Subsequent refreshes happen in background without loading screen
        fetchData(false, viewAllUsers);
      }
    }
  }, [dataVersion, user, router, initialLoad, viewAllUsers, isSuperAdmin]);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<1 | 2 | 3>(1);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberCapital, setNewMemberCapital] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [fullscreenUserId, setFullscreenUserId] = useState<string | null>(null);
  const [fullscreenUserInfo, setFullscreenUserInfo] = useState<{ username: string; email: string } | null>(null);
  
  // Helper to update data and increment version
  const updateMlmData = (updater: (prev: MLMData) => MLMData) => {
    setMlmData((prev) => {
      const updated = updater(prev);
      setDataVersion((v) => v + 1);
      return updated;
    });
  };

  // Generate unique ID
  const generateId = (prefix: string, level: number): string => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${prefix}${level}-${timestamp}-${random}`;
  };

  // Add new downline
  const handleAddDownline = async () => {
    if (!newMemberName.trim() || !newMemberCapital.trim()) {
      alert("Please fill in both name and starting capital");
      return;
    }

    const capital = parseFloat(newMemberCapital);
    if (isNaN(capital) || capital < 0) {
      alert("Please enter a valid starting capital amount");
      return;
    }

    const newMemberId = generateId("new", selectedLevel);
    let parentId: string | null = null;

    if (selectedLevel === 1) {
      if (mlmData.firstLevel.length >= 7) {
        alert("Maximum 7 first level downlines allowed");
        return;
      }
      // Get the actual ME member ID (e.g., "me-{userId}")
      // If not found, try to initialize it first
      if (!mlmData.me.id) {
        try {
          const initResponse = await fetch('/api/initialize-user', { method: 'POST' });
          const initResult = await initResponse.json();
          if (initResult.success && initResult.data) {
            parentId = initResult.data.id;
            // Refresh the data to get the updated ME member
            setDataVersion((v) => v + 1);
          } else {
            alert(`Error: Could not initialize ME member. ${initResult.error || 'Please refresh the page.'}`);
            return;
          }
        } catch (err: any) {
          console.error('Error initializing ME member:', err);
          alert(`Error: ME member not found. ${err.message || 'Please refresh the page.'}`);
          return;
        }
      } else {
        parentId = mlmData.me.id;
      }
      
      if (!parentId) {
        alert("Error: ME member ID is missing. Please refresh the page.");
        return;
      }
    } else if (selectedLevel === 2) {
      if (!selectedMemberId) {
        alert("Please select a first level member to add a downline to");
        return;
      }
      const parentSecondLevel = mlmData.secondLevel[selectedMemberId] || [];
      if (parentSecondLevel.length >= 7) {
        alert("Maximum 7 second level downlines per parent allowed");
        return;
      }
      parentId = selectedMemberId; // Second level members have first level member as parent
    } else if (selectedLevel === 3) {
      if (!selectedMemberId) {
        alert("Please select a second level member to add a downline to");
        return;
      }
      const parentThirdLevel = mlmData.thirdLevel[selectedMemberId] || [];
      if (parentThirdLevel.length >= 7) {
        alert("Maximum 7 third level downlines per parent allowed");
        return;
      }
      parentId = selectedMemberId; // Third level members have second level member as parent
    }

    if (!parentId) {
      alert("Invalid parent selection");
      return;
    }

    try {
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newMemberId,
          name: newMemberName.trim(),
          startingCapital: capital,
          level: selectedLevel,
          parentId: parentId,
        }),
      });

      const result = await response.json();
      if (result.success) {
        // Reset form
        setNewMemberName("");
        setNewMemberCapital("");
        setShowAddForm(false);
        setSelectedMemberId(null);
        // Refresh data from Supabase
        setDataVersion((v) => v + 1);
      } else {
        alert(`Failed to add member: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Error adding member:', error);
      alert(`Error adding member: ${error.message}`);
    }
  };

  // Delete downline
  const handleDeleteDownline = async (id: string, level: number) => {
    if (!confirm("Are you sure you want to delete this downline and all its sub-downlines?")) {
      return;
    }

    try {
      const response = await fetch(`/api/members?id=${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (result.success) {
        // Refresh data from Supabase (cascade delete will handle children)
        setDataVersion((v) => v + 1);
      } else {
        alert(`Failed to delete member: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Error deleting member:', error);
      alert(`Error deleting member: ${error.message}`);
    }
  };

  // Reassign downline to different parent
  const handleReassign = async (memberId: string, currentLevel: number, newParentId: string) => {
    // Check if new parent has space
    let newParentChildren: any[] = [];
    if (currentLevel === 2) {
      const parent = mlmData.firstLevel.find(p => p.id === newParentId);
      if (!parent) {
        alert("Parent not found");
        return;
      }
      newParentChildren = mlmData.secondLevel[newParentId] || [];
    } else if (currentLevel === 3) {
      newParentChildren = mlmData.thirdLevel[newParentId] || [];
    }

    if (newParentChildren.length >= 7) {
      alert("The selected parent already has 7 downlines");
      return;
    }

    try {
      const response = await fetch('/api/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: memberId,
          parentId: newParentId,
        }),
      });

      const result = await response.json();
      if (result.success) {
        // Refresh data from Supabase
        setDataVersion((v) => v + 1);
      } else {
        alert(`Failed to reassign member: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Error reassigning member:', error);
      alert(`Error reassigning member: ${error.message}`);
    }
  };

  // Get all members for reassignment dropdown
  const getAvailableParents = (level: number) => {
    if (level === 2) {
      return mlmData.firstLevel;
    } else if (level === 3) {
      return Object.values(mlmData.secondLevel).flat();
    }
    return [];
  };

  // Scroll to element by ID
  const scrollToElement = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Add a highlight effect
      element.classList.add('ring-2', 'ring-purple-500', 'ring-opacity-75');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-purple-500', 'ring-opacity-75');
      }, 2000);
    }
  };

  // Check if data is still loading - only show full-page loading on initial load
  // Don't check mlmData.me.name if there's no user, as fetchData won't run
  // Limit loading check to prevent infinite loading (max 30 seconds)
  const isDataLoading = user && loading && initialLoad;

  if (authLoading || isDataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-2">Loading your data...</div>
          <div className="text-white/70 text-sm">Please wait while we fetch your downlines</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">BG World Admin</h1>
            {isSuperAdmin && (
              <div className="mt-2 flex items-center gap-2">
                <span className="px-3 py-1 bg-yellow-600 text-white text-sm font-semibold rounded-full">
                  SUPER ADMIN
                </span>
                <label className="flex items-center gap-2 text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={viewAllUsers}
                    onChange={(e) => {
                      setViewAllUsers(e.target.checked);
                      setDataVersion((v) => v + 1);
                    }}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">View All Users' Bubbles</span>
                </label>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <a
              href="/"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              View Visualization
            </a>
            <button
              onClick={async () => {
                await signOut();
                router.push('/login');
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {viewAllUsers && isSuperAdmin ? (
          // Super Admin: All Users View
          <div className="space-y-6">
            <div className="bg-slate-800/70 rounded-lg p-6 border border-yellow-500/50">
              <h2 className="text-3xl font-bold text-white mb-4">All Users' Bubbles</h2>
              <p className="text-white/70 mb-6">Viewing all bubbles from all accounts</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(allUsersData).map(([userId, { userInfo, mlmData: userMlmData }]) => (
                  <div
                    key={userId}
                    className="bg-slate-700/50 rounded-lg p-4 border border-purple-500/30"
                  >
                    <div className="mb-3">
                      <h3 className="text-xl font-bold text-white">
                        {userInfo.email || userInfo.username || `User ${userId.substring(0, 8)}...`}
                      </h3>
                      {userInfo.email && userInfo.username !== userInfo.email && (
                        <p className="text-white/60 text-sm">{userInfo.username}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-white text-sm mb-4">
                      <div className="flex justify-between">
                        <span>First Level:</span>
                        <span className="font-semibold">{userMlmData.firstLevel.length}/7</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Second Level:</span>
                        <span className="font-semibold">
                          {Object.values(userMlmData.secondLevel).flat().length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Third Level:</span>
                        <span className="font-semibold">
                          {Object.values(userMlmData.thirdLevel).flat().length}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-slate-900 rounded-lg p-3 min-h-[300px] flex items-center justify-center relative">
                      <BubbleVisualization 
                        key={`${userId}-${dataVersion}`}
                        data={userMlmData} 
                      />
                      <button
                        onClick={() => {
                          setFullscreenUserId(userId);
                          setFullscreenUserInfo(userInfo);
                        }}
                        className="absolute top-2 right-2 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-semibold shadow-lg z-10"
                        title="View fullscreen"
                      >
                        Fullscreen
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {Object.keys(allUsersData).length === 0 && (
                <div className="text-white/50 text-center py-8">
                  No users found or no data available
                </div>
              )}
            </div>
          </div>
        ) : (
          // Normal User View
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Controls */}
            <div className="lg:col-span-1 space-y-6">
            {/* Add New Downline */}
            <div className="bg-slate-800/70 rounded-lg p-6 border border-purple-500/50">
              <h2 className="text-2xl font-bold text-white mb-4">Add New Downline</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white mb-2">Level</label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => {
                      setSelectedLevel(parseInt(e.target.value) as 1 | 2 | 3);
                      setSelectedMemberId(null);
                    }}
                    className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-purple-500/50"
                  >
                    <option value={1}>First Level (under ME)</option>
                    <option value={2}>Second Level</option>
                    <option value={3}>Third Level</option>
                  </select>
                </div>

                {selectedLevel > 1 && (
                  <div>
                    <label className="block text-white mb-2">
                      Parent {selectedLevel === 2 ? "(First Level)" : "(Second Level)"}
                    </label>
                    <select
                      value={selectedMemberId || ""}
                      onChange={(e) => setSelectedMemberId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-purple-500/50"
                    >
                      <option value="">Select a parent...</option>
                      {selectedLevel === 2 &&
                        mlmData.firstLevel.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.name} ({(mlmData.secondLevel[member.id] || []).length}/7)
                          </option>
                        ))}
                      {selectedLevel === 3 &&
                        Object.values(mlmData.secondLevel)
                          .flat()
                          .map((member) => (
                            <option key={member.id} value={member.id}>
                              {member.name} ({(mlmData.thirdLevel[member.id] || []).length}/7)
                            </option>
                          ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-white mb-2">Name</label>
                  <input
                    type="text"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-purple-500/50"
                    placeholder="Enter name"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Starting Capital</label>
                  <input
                    type="number"
                    value={newMemberCapital}
                    onChange={(e) => setNewMemberCapital(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-purple-500/50"
                    placeholder="Enter amount"
                    min="0"
                    step="0.01"
                  />
                </div>

                <button
                  onClick={handleAddDownline}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-semibold"
                >
                  Add Downline
                </button>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-slate-800/70 rounded-lg p-6 border border-purple-500/50">
              <h2 className="text-2xl font-bold text-white mb-4">Statistics</h2>
              <div className="space-y-2 text-white">
                <div className="flex justify-between">
                  <span>First Level:</span>
                  <span className="font-semibold">{mlmData.firstLevel.length}/7</span>
                </div>
                <div className="flex justify-between">
                  <span>Second Level Total:</span>
                  <span className="font-semibold">
                    {Object.values(mlmData.secondLevel).flat().length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Third Level Total:</span>
                  <span className="font-semibold">
                    {Object.values(mlmData.thirdLevel).flat().length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Member List */}
          <div className="lg:col-span-2 space-y-6">
            {/* First Level Members */}
            <div className="bg-slate-800/70 rounded-lg p-6 border border-purple-500/50">
              <h2 className="text-2xl font-bold text-white mb-4" id="first-level-section">First Level Members</h2>
              <div className="space-y-2">
                {mlmData.firstLevel.map((member) => (
                  <div
                    key={member.id}
                    id={`first-level-${member.id}`}
                    className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="text-white font-semibold">{member.name}</div>
                      <div className="text-white/70 text-sm">
                        ${member.startingCapital.toLocaleString()} •{" "}
                        {(mlmData.secondLevel[member.id] || []).length} downlines
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => scrollToElement(`second-level-section-${member.id}`)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors text-sm"
                        title="View downlines"
                      >
                        ↓ Downlines
                      </button>
                      <button
                        onClick={() => handleDeleteDownline(member.id, 1)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {mlmData.firstLevel.length === 0 && (
                  <div className="text-white/50 text-center py-4">No first level members</div>
                )}
              </div>
            </div>

            {/* Second Level Members */}
            <div className="bg-slate-800/70 rounded-lg p-6 border border-purple-500/50">
              <h2 className="text-2xl font-bold text-white mb-4" id="second-level-section">Second Level Members</h2>
              <div className="space-y-4">
                {mlmData.firstLevel.map((firstLevelMember) => {
                  const secondLevelMembers = mlmData.secondLevel[firstLevelMember.id] || [];
                  if (secondLevelMembers.length === 0) return null;
                  
                  return (
                    <div key={firstLevelMember.id} className="mb-4">
                      <div 
                        id={`second-level-section-${firstLevelMember.id}`}
                        className="text-white/80 font-semibold mb-2"
                      >
                        Under {firstLevelMember.name}:
                      </div>
                      <div className="space-y-2 ml-4">
                        {secondLevelMembers.map((member) => (
                          <div
                            key={member.id}
                            id={`second-level-${member.id}`}
                            className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="text-white font-semibold">{member.name}</div>
                              <div className="text-white/70 text-sm">
                                ${member.startingCapital.toLocaleString()} •{" "}
                                {(mlmData.thirdLevel[member.id] || []).length} downlines
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => scrollToElement(`first-level-${firstLevelMember.id}`)}
                                className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors text-xs"
                                title="Go to parent"
                              >
                                ↑ Parent
                              </button>
                              <button
                                onClick={() => scrollToElement(`third-level-section-${member.id}`)}
                                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors text-xs"
                                title="View downlines"
                              >
                                ↓ Downlines
                              </button>
                              <select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleReassign(member.id, 2, e.target.value);
                                    e.target.value = "";
                                  }
                                }}
                                className="px-2 py-1 bg-slate-600 text-white rounded text-sm border border-purple-500/50"
                              >
                                <option value="">Reassign...</option>
                                {mlmData.firstLevel
                                  .filter((p) => p.id !== firstLevelMember.id)
                                  .map((parent) => (
                                    <option key={parent.id} value={parent.id}>
                                      {parent.name}
                                    </option>
                                  ))}
                              </select>
                              <button
                                onClick={() => handleDeleteDownline(member.id, 2)}
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {Object.values(mlmData.secondLevel).flat().length === 0 && (
                  <div className="text-white/50 text-center py-4">No second level members</div>
                )}
              </div>
            </div>

            {/* Third Level Members */}
            <div className="bg-slate-800/70 rounded-lg p-6 border border-purple-500/50">
              <h2 className="text-2xl font-bold text-white mb-4" id="third-level-section">Third Level Members</h2>
              <div className="space-y-4">
                {Object.values(mlmData.secondLevel).flat().map((secondLevelMember) => {
                  const thirdLevelMembers = mlmData.thirdLevel[secondLevelMember.id] || [];
                  if (thirdLevelMembers.length === 0) return null;
                  
                  // Find parent
                  const parentId = Object.keys(mlmData.secondLevel).find((key) =>
                    mlmData.secondLevel[key].some((m) => m.id === secondLevelMember.id)
                  );
                  const firstLevelParent = mlmData.firstLevel.find((m) => m.id === parentId);
                  
                  return (
                    <div key={secondLevelMember.id} className="mb-4">
                      <div 
                        id={`third-level-section-${secondLevelMember.id}`}
                        className="text-white/80 font-semibold mb-2"
                      >
                        Under {firstLevelParent?.name} → {secondLevelMember.name}:
                      </div>
                      <div className="space-y-2 ml-4">
                        {thirdLevelMembers.map((member) => (
                          <div
                            key={member.id}
                            id={`third-level-${member.id}`}
                            className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="text-white font-semibold">{member.name}</div>
                              <div className="text-white/70 text-sm">
                                ${member.startingCapital.toLocaleString()}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => scrollToElement(`second-level-${secondLevelMember.id}`)}
                                className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors text-xs"
                                title="Go to parent"
                              >
                                ↑ Parent
                              </button>
                              <select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleReassign(member.id, 3, e.target.value);
                                    e.target.value = "";
                                  }
                                }}
                                className="px-2 py-1 bg-slate-600 text-white rounded text-sm border border-purple-500/50"
                              >
                                <option value="">Reassign...</option>
                                {Object.values(mlmData.secondLevel)
                                  .flat()
                                  .filter((p) => p.id !== secondLevelMember.id)
                                  .map((parent) => (
                                    <option key={parent.id} value={parent.id}>
                                      {parent.name}
                                    </option>
                                  ))}
                              </select>
                              <button
                                onClick={() => handleDeleteDownline(member.id, 3)}
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {Object.values(mlmData.thirdLevel).flat().length === 0 && (
                  <div className="text-white/50 text-center py-4">No third level members</div>
                )}
              </div>
            </div>
          </div>
        </div>

            {/* Visualization Preview - Only show in normal view */}
            <div className="mt-8">
              <div className="bg-slate-800/70 rounded-lg p-6 border border-purple-500/50">
                <h2 className="text-2xl font-bold text-white mb-4">Live Preview</h2>
                <div className="bg-slate-900 rounded-lg p-4 min-h-[600px] flex items-center justify-center">
                  {loading || mlmData.me.name === "Loading..." ? (
                    <div className="text-center">
                      <div className="text-white text-xl mb-2">Loading data...</div>
                      <div className="text-white/70 text-sm">Please wait while we fetch your downlines</div>
                    </div>
                  ) : (
                    <BubbleVisualization 
                      key={dataVersion}
                      data={mlmData} 
                    />
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Fullscreen Modal for User Visualization */}
        {fullscreenUserId && fullscreenUserInfo && allUsersData[fullscreenUserId] && (
          <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
            <div className="flex justify-between items-center p-4 bg-slate-900/95 border-b border-purple-500/50">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {fullscreenUserInfo.email || fullscreenUserInfo.username || `User ${fullscreenUserId.substring(0, 8)}...`}
                </h2>
                {fullscreenUserInfo.email && fullscreenUserInfo.username !== fullscreenUserInfo.email && (
                  <p className="text-white/60 text-sm">{fullscreenUserInfo.username}</p>
                )}
              </div>
              <button
                onClick={() => {
                  setFullscreenUserId(null);
                  setFullscreenUserInfo(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-semibold"
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-auto flex items-center justify-center p-4">
              <div className="w-full h-full max-w-[95vw] max-h-[95vh]">
                <BubbleVisualization 
                  key={`fullscreen-${fullscreenUserId}-${dataVersion}`}
                  data={allUsersData[fullscreenUserId].mlmData} 
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

