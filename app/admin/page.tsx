"use client";

import { useState } from "react";
import { MLMData } from "@/types/mlm";
import { dummyMLMData } from "@/data/dummy-data";
import BubbleVisualization from "@/components/bubble-visualization";

export default function AdminPage() {
  const [mlmData, setMlmData] = useState<MLMData>(dummyMLMData);
  const [dataVersion, setDataVersion] = useState(0); // Force re-render when data changes
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<1 | 2 | 3>(1);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberCapital, setNewMemberCapital] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  
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
  const handleAddDownline = () => {
    if (!newMemberName.trim() || !newMemberCapital.trim()) {
      alert("Please fill in both name and starting capital");
      return;
    }

    const capital = parseFloat(newMemberCapital);
    if (isNaN(capital) || capital < 0) {
      alert("Please enter a valid starting capital amount");
      return;
    }

    const newMember = {
      id: generateId("new", selectedLevel),
      name: newMemberName.trim(),
      startingCapital: capital,
      level: selectedLevel,
    };

    if (selectedLevel === 1) {
      if (mlmData.firstLevel.length >= 7) {
        alert("Maximum 7 first level downlines allowed");
        return;
      }
      const updatedSecondLevel = {
        ...mlmData.secondLevel,
        [newMember.id]: [],
      };
      updateMlmData((prevData) => ({
        ...prevData,
        firstLevel: [...prevData.firstLevel, newMember],
        secondLevel: updatedSecondLevel,
      }));
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
      // Create new objects to ensure React detects the change
      const updatedSecondLevel = {
        ...mlmData.secondLevel,
        [selectedMemberId]: [...parentSecondLevel, newMember],
      };
      const updatedThirdLevel = {
        ...mlmData.thirdLevel,
        [newMember.id]: [],
      };
      updateMlmData((prevData) => ({
        ...prevData,
        secondLevel: updatedSecondLevel,
        thirdLevel: updatedThirdLevel,
      }));
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
      // Create a new thirdLevel object to ensure React detects the change
      const updatedThirdLevel = {
        ...mlmData.thirdLevel,
        [selectedMemberId]: [...parentThirdLevel, newMember],
      };
      setMlmData((prevData) => ({
        ...prevData,
        thirdLevel: updatedThirdLevel,
      }));
    }

    // Reset form
    setNewMemberName("");
    setNewMemberCapital("");
    setShowAddForm(false);
    setSelectedMemberId(null);
  };

  // Delete downline
  const handleDeleteDownline = (id: string, level: number) => {
    if (!confirm("Are you sure you want to delete this downline and all its sub-downlines?")) {
      return;
    }

    if (level === 1) {
      // Delete from first level and remove all its children
      const updatedFirstLevel = mlmData.firstLevel.filter((m) => m.id !== id);
      const { [id]: removed, ...restSecondLevel } = mlmData.secondLevel;
      
      // Remove all third level entries for deleted second level members
      const updatedThirdLevel = { ...mlmData.thirdLevel };
      if (removed) {
        removed.forEach((secondLevelMember) => {
          delete updatedThirdLevel[secondLevelMember.id];
        });
      }

      updateMlmData((prevData) => ({
        ...prevData,
        firstLevel: prevData.firstLevel.filter((m) => m.id !== id),
        secondLevel: (() => {
          const { [id]: removed, ...rest } = prevData.secondLevel;
          return rest;
        })(),
        thirdLevel: (() => {
          const updated = { ...prevData.thirdLevel };
          const removed = prevData.secondLevel[id];
          if (removed) {
            removed.forEach((secondLevelMember) => {
              delete updated[secondLevelMember.id];
            });
          }
          return updated;
        })(),
      }));
    } else if (level === 2) {
      // Delete from second level and remove all its children
      updateMlmData((prevData) => {
        const parentId = Object.keys(prevData.secondLevel).find((key) =>
          prevData.secondLevel[key].some((m) => m.id === id)
        );
        if (!parentId) return prevData;
        
        const updatedSecondLevel = {
          ...prevData.secondLevel,
          [parentId]: prevData.secondLevel[parentId].filter((m) => m.id !== id),
        };
        
        const { [id]: removed, ...restThirdLevel } = prevData.thirdLevel;
        
        return {
          ...prevData,
          secondLevel: updatedSecondLevel,
          thirdLevel: restThirdLevel,
        };
      });
    } else if (level === 3) {
      // Delete from third level
      updateMlmData((prevData) => {
        const parentId = Object.keys(prevData.thirdLevel).find((key) =>
          prevData.thirdLevel[key].some((m) => m.id === id)
        );
        if (!parentId) return prevData;
        
        const updatedThirdLevel = {
          ...prevData.thirdLevel,
          [parentId]: prevData.thirdLevel[parentId].filter((m) => m.id !== id),
        };
        
        return {
          ...prevData,
          thirdLevel: updatedThirdLevel,
        };
      });
    }
  };

  // Reassign downline to different parent
  const handleReassign = (memberId: string, currentLevel: number, newParentId: string) => {
    updateMlmData((prevData) => {
      if (currentLevel === 2) {
        // Find current parent
        const currentParentId = Object.keys(prevData.secondLevel).find((key) =>
          prevData.secondLevel[key]?.some((m) => m.id === memberId)
        );
        
        if (!currentParentId) {
          console.error("Could not find current parent for member:", memberId);
          return prevData;
        }
        
        const member = prevData.secondLevel[currentParentId]?.find((m) => m.id === memberId);
        if (!member) {
          console.error("Could not find member:", memberId);
          return prevData;
        }
        
        // Check if new parent has space
        const newParentChildren = prevData.secondLevel[newParentId] || [];
        if (newParentChildren.length >= 7) {
          alert("The selected parent already has 7 downlines");
          return prevData;
        }
        
        // Create a completely new secondLevel object to ensure React detects the change
        const updatedSecondLevel: Record<string, typeof prevData.secondLevel[string]> = {};
        
        // Copy all existing entries
        Object.keys(prevData.secondLevel).forEach((key) => {
          if (key === currentParentId) {
            // Remove member from old parent
            updatedSecondLevel[key] = prevData.secondLevel[key].filter((m) => m.id !== memberId);
          } else if (key === newParentId) {
            // Add member to new parent
            updatedSecondLevel[key] = [...prevData.secondLevel[key], member];
          } else {
            // Keep other entries as is
            updatedSecondLevel[key] = [...prevData.secondLevel[key]];
          }
        });
        
        // If new parent doesn't exist yet, create it
        if (!prevData.secondLevel[newParentId]) {
          updatedSecondLevel[newParentId] = [member];
        }
        
        return {
          ...prevData,
          secondLevel: updatedSecondLevel,
        };
      } else if (currentLevel === 3) {
        // Find current parent
        const currentParentId = Object.keys(prevData.thirdLevel).find((key) =>
          prevData.thirdLevel[key]?.some((m) => m.id === memberId)
        );
        
        if (!currentParentId) {
          console.error("Could not find current parent for member:", memberId);
          return prevData;
        }
        
        const member = prevData.thirdLevel[currentParentId]?.find((m) => m.id === memberId);
        if (!member) {
          console.error("Could not find member:", memberId);
          return prevData;
        }
        
        // Check if new parent has space
        const newParentChildren = prevData.thirdLevel[newParentId] || [];
        if (newParentChildren.length >= 7) {
          alert("The selected parent already has 7 downlines");
          return prevData;
        }
        
        // Create a completely new thirdLevel object to ensure React detects the change
        const updatedThirdLevel: Record<string, typeof prevData.thirdLevel[string]> = {};
        
        // Copy all existing entries
        Object.keys(prevData.thirdLevel).forEach((key) => {
          if (key === currentParentId) {
            // Remove member from old parent
            updatedThirdLevel[key] = prevData.thirdLevel[key].filter((m) => m.id !== memberId);
          } else if (key === newParentId) {
            // Add member to new parent
            updatedThirdLevel[key] = [...prevData.thirdLevel[key], member];
          } else {
            // Keep other entries as is
            updatedThirdLevel[key] = [...prevData.thirdLevel[key]];
          }
        });
        
        // If new parent doesn't exist yet, create it
        if (!prevData.thirdLevel[newParentId]) {
          updatedThirdLevel[newParentId] = [member];
        }
        
        return {
          ...prevData,
          thirdLevel: updatedThirdLevel,
        };
      }
      return prevData;
    });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">MLM Admin Panel</h1>
          <a
            href="/"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            View Visualization
          </a>
        </div>

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

        {/* Visualization Preview */}
        <div className="mt-8">
          <div className="bg-slate-800/70 rounded-lg p-6 border border-purple-500/50">
            <h2 className="text-2xl font-bold text-white mb-4">Live Preview</h2>
            <div className="bg-slate-900 rounded-lg p-4">
              <BubbleVisualization 
                key={dataVersion}
                data={mlmData} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

