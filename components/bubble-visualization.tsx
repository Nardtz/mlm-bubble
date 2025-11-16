"use client";

import { useState } from "react";
import { MLMData } from "@/types/mlm";

interface BubbleProps {
  id: string;
  name: string;
  startingCapital: number;
  x: number;
  y: number;
  radius: number;
  level: number;
  isSelected: boolean;
  showText: boolean;
  scaleFactor?: number; // Additional scale factor for better visibility
  downlineCount?: number; // Number of circles under this one
  opacity?: number; // Opacity for the bubble (0-1)
  onClick: () => void;
}

function Bubble({ id, name, startingCapital, x, y, radius, level, isSelected, showText, scaleFactor = 1, downlineCount = 0, opacity = 1, onClick }: BubbleProps) {
  const getLevelColor = (level: number) => {
    switch (level) {
      case 0:
        return "fill-blue-600";
      case 1:
        return "fill-green-500";
      case 2:
        return "fill-yellow-500";
      case 3:
        return "fill-orange-500";
      default:
        return "fill-gray-400";
    }
  };

  const getTextSize = (radius: number) => {
    if (radius >= 80) return "text-sm";
    if (radius >= 50) return "text-xs";
    if (radius >= 30) return "text-[10px]";
    return "text-[8px]";
  };

  const baseRadius = isSelected ? radius * 1.3 : radius;
  const displayRadius = baseRadius * scaleFactor;
  const fontSize = displayRadius >= 80 ? 14 : displayRadius >= 50 ? 12 : displayRadius >= 30 ? 10 : 8;

  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={displayRadius}
        className={`${getLevelColor(level)} stroke-white stroke-2 cursor-pointer`}
        style={{ 
          transition: 'cx 0.8s cubic-bezier(0.4, 0, 0.2, 1), cy 0.8s cubic-bezier(0.4, 0, 0.2, 1), r 0.6s ease-out, opacity 0.3s ease',
          filter: isSelected ? 'url(#shadow)' : 'none',
          transformOrigin: `${x}px ${y}px`,
          opacity: opacity
        }}
        onClick={onClick}
      />
      {showText && (
        <>
          <text
            x={x}
            y={y - fontSize * 0.5}
            textAnchor="middle"
            className={`fill-white font-bold ${getTextSize(displayRadius)} pointer-events-none`}
            dominantBaseline="middle"
            style={{ 
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
              letterSpacing: '0.5px',
              transition: 'x 0.8s cubic-bezier(0.4, 0, 0.2, 1), y 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease'
            }}
          >
            {name}
          </text>
          <text
            x={x}
            y={y + fontSize * 0.4}
            textAnchor="middle"
            className={`fill-white font-semibold ${getTextSize(displayRadius)} pointer-events-none`}
            dominantBaseline="middle"
            style={{ 
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
              letterSpacing: '0.3px',
              transition: 'x 0.8s cubic-bezier(0.4, 0, 0.2, 1), y 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease'
            }}
          >
            ${startingCapital.toLocaleString()}
          </text>
          {downlineCount > 0 && (
            <text
              x={x}
              y={y + fontSize * 1.2}
              textAnchor="middle"
              className={`fill-white/90 font-medium ${getTextSize(displayRadius)} pointer-events-none`}
              dominantBaseline="middle"
              style={{ 
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
                letterSpacing: '0.2px',
                fontSize: fontSize * 0.85,
                transition: 'x 0.8s cubic-bezier(0.4, 0, 0.2, 1), y 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease'
              }}
            >
              {downlineCount} downline{downlineCount !== 1 ? 's' : ''}
            </text>
          )}
        </>
      )}
    </g>
  );
}

interface BubbleVisualizationProps {
  data: MLMData;
}

export default function BubbleVisualization({ data }: BubbleVisualizationProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const centerX = 600;
  const centerY = 500;
  
  // Radius sizes for each level (smaller for 2nd and 3rd)
  const meRadius = 100;
  const firstLevelRadius = 70;
  const secondLevelRadius = 20; // Much smaller
  const thirdLevelRadius = 12; // Much smaller
  
  // Distance from parent to child circles (flower pattern)
  const firstLevelDistance = 220;
  const secondLevelDistance = 100; // Closer for flower pattern
  const thirdLevelDistance = 60; // Closer for flower pattern
  
  // Increased distances when selected (for better spacing)
  const selectedSecondLevelDistance = 180; // Much more space when selected
  const selectedThirdLevelDistance = 120; // Much more space when selected

  // Calculate base positions for first level circles
  const firstLevelBasePositions = data.firstLevel.map((member, index) => {
    const angle = (index * 2 * Math.PI) / data.firstLevel.length;
    const x = centerX + firstLevelDistance * Math.cos(angle);
    const y = centerY + firstLevelDistance * Math.sin(angle);
    return { ...member, x, y };
  });

  // Calculate positions for first level circles (centered if selected)
  const firstLevelPositions = firstLevelBasePositions.map((basePos) => {
    if (selectedId === basePos.id) {
      // Center this circle and move ME out of the way if needed
      return { ...basePos, x: centerX, y: centerY };
    }
    // If ME is selected, keep first level in their original positions
    if (selectedId === "me") {
      return basePos;
    }
    return basePos;
  });

  // Calculate positions for second level circles - flower pattern (full circle)
  const secondLevelPositions: Array<{
    member: typeof data.secondLevel[string][0];
    x: number;
    y: number;
    parentId: string;
  }> = [];
  
  // Calculate second level positions based on adjusted first level positions
  // We'll recalculate after firstLevelPositionsAdjusted is created
  const calculateSecondLevelPositions = (firstLevelPos: typeof firstLevelPositions) => {
    const positions: Array<{
      member: typeof data.secondLevel[string][0];
      x: number;
      y: number;
      parentId: string;
    }> = [];
    
    firstLevelPos.forEach((firstLevelMember) => {
      const secondLevelMembers = data.secondLevel[firstLevelMember.id] || [];
      if (secondLevelMembers.length === 0) return;
      
      // Use larger distance if parent is selected
      const distance = selectedId === firstLevelMember.id 
        ? selectedSecondLevelDistance 
        : secondLevelDistance;
      
      // Position children in a perfect circle (flower pattern) around parent
      secondLevelMembers.forEach((member, index) => {
        const angle = (index * 2 * Math.PI) / secondLevelMembers.length;
        const x = firstLevelMember.x + distance * Math.cos(angle);
        const y = firstLevelMember.y + distance * Math.sin(angle);
        positions.push({ member, x, y, parentId: firstLevelMember.id });
      });
    });
    
    return positions;
  };
  
  // Also center the parent (first level) if a second level child is selected
  const firstLevelPositionsAdjusted = firstLevelPositions.map((pos) => {
    // Check if any of this first level's second level children is selected
    const secondLevelChildren = data.secondLevel[pos.id] || [];
    const hasSelectedChild = secondLevelChildren.some(child => child.id === selectedId);
    if (hasSelectedChild) {
      // Center the parent when a child is selected
      return { ...pos, x: centerX, y: centerY };
    }
    return pos;
  });
  
  // Recalculate second level positions based on adjusted first level positions
  const secondLevelPositionsRecalculated = calculateSecondLevelPositions(firstLevelPositionsAdjusted);
  
  // If a second level circle is selected, center it
  const secondLevelPositionsAdjusted = secondLevelPositionsRecalculated.map((pos) => {
    if (selectedId === pos.member.id) {
      // Center this circle
      return { ...pos, x: centerX, y: centerY };
    }
    return pos;
  });
  
  // Check if a third level circle is selected (before calculating third level positions)
  const isThirdLevelSelected = selectedId && Object.values(data.thirdLevel).flat().some(m => m.id === selectedId);
  
  // Also center the parent (second level) if a third level child is selected
  const secondLevelPositionsFinal = secondLevelPositionsAdjusted.map((pos) => {
    // Check if any of this second level's third level children is selected
    const thirdLevelChildren = data.thirdLevel[pos.member.id] || [];
    const hasSelectedChild = thirdLevelChildren.some(child => child.id === selectedId);
    if (hasSelectedChild) {
      // Center the parent when a child is selected
      return { ...pos, x: centerX, y: centerY };
    }
    return pos;
  });
  
  // Calculate positions for third level circles - flower pattern (full circle)
  // Use the final adjusted second level positions
  const thirdLevelPositions: Array<{
    member: typeof data.thirdLevel[string][0];
    x: number;
    y: number;
    parentId: string;
  }> = [];
  
  secondLevelPositionsFinal.forEach((secondLevelPos) => {
    const thirdLevelMembers = data.thirdLevel[secondLevelPos.member.id] || [];
    if (thirdLevelMembers.length === 0) return;
    
    // Use larger distance if parent is selected
    const distance = selectedId === secondLevelPos.member.id 
      ? selectedThirdLevelDistance 
      : thirdLevelDistance;
    
    // Position children in a perfect circle (flower pattern) around parent
    thirdLevelMembers.forEach((member, index) => {
      const angle = (index * 2 * Math.PI) / thirdLevelMembers.length;
      const x = secondLevelPos.x + distance * Math.cos(angle);
      const y = secondLevelPos.y + distance * Math.sin(angle);
      thirdLevelPositions.push({ member, x, y, parentId: secondLevelPos.member.id });
    });
  });
  
  // Update third level positions if their parent (second level) is centered OR if third level itself is selected
  const thirdLevelPositionsAdjusted = thirdLevelPositions.map((pos) => {
    const parent = secondLevelPositionsFinal.find(p => p.member.id === pos.parentId);
    
    // If this third level circle itself is selected, center it
    if (selectedId === pos.member.id) {
      return { ...pos, x: centerX, y: centerY };
    }
    
    // If parent (second level) is centered, position children around center with increased spacing
    if (parent && selectedId === parent.member.id) {
      const thirdLevelMembers = data.thirdLevel[parent.member.id] || [];
      const memberIndex = thirdLevelMembers.findIndex(m => m.id === pos.member.id);
      if (memberIndex >= 0) {
        const angle = (memberIndex * 2 * Math.PI) / thirdLevelMembers.length;
        return { ...pos, x: centerX + selectedThirdLevelDistance * Math.cos(angle), y: centerY + selectedThirdLevelDistance * Math.sin(angle) };
      }
    }
    
    // If a third level child is selected, also center its parent (second level)
    if (selectedId && parent) {
      const thirdLevelChildren = data.thirdLevel[parent.member.id] || [];
      const hasSelectedChild = thirdLevelChildren.some(child => child.id === selectedId);
      if (hasSelectedChild && pos.parentId === parent.member.id) {
        // Reposition around centered parent
        const thirdLevelMembers = data.thirdLevel[parent.member.id] || [];
        const memberIndex = thirdLevelMembers.findIndex(m => m.id === pos.member.id);
        if (memberIndex >= 0) {
          const angle = (memberIndex * 2 * Math.PI) / thirdLevelMembers.length;
          return { ...pos, x: centerX + selectedThirdLevelDistance * Math.cos(angle), y: centerY + selectedThirdLevelDistance * Math.sin(angle) };
        }
      }
    }
    
    return pos;
  });

  // Get all IDs in the selected hierarchy (selected + all descendants recursively)
  const getSelectedHierarchyIds = (id: string | null): Set<string> => {
    const ids = new Set<string>();
    if (!id) return ids;
    
    ids.add(id);
    
    // If it's ME, add all first level and their descendants
    if (id === "me") {
      data.firstLevel.forEach(m => {
        ids.add(m.id);
        // Add all second level children
        const secondLevel = data.secondLevel[m.id] || [];
        secondLevel.forEach(sl => {
          ids.add(sl.id);
          // Add all third level children
          const thirdLevel = data.thirdLevel[sl.id] || [];
          thirdLevel.forEach(tl => ids.add(tl.id));
        });
      });
    }
    
    // If it's a first level member, add all its descendants (second and third level)
    const firstLevelMember = data.firstLevel.find(m => m.id === id);
    if (firstLevelMember) {
      const secondLevel = data.secondLevel[firstLevelMember.id] || [];
      secondLevel.forEach(sl => {
        ids.add(sl.id);
        // Add all third level children of this second level member
        const thirdLevel = data.thirdLevel[sl.id] || [];
        thirdLevel.forEach(tl => ids.add(tl.id));
      });
    }
    
    // If it's a second level member, add all its third level children
    Object.values(data.secondLevel).flat().forEach(secondLevelMember => {
      if (secondLevelMember.id === id) {
        const thirdLevel = data.thirdLevel[secondLevelMember.id] || [];
        thirdLevel.forEach(m => ids.add(m.id));
      }
    });
    
    return ids;
  };

  // Get IDs that should be enlarged (selected + its direct children only)
  const getEnlargedIds = (id: string | null): Set<string> => {
    const ids = new Set<string>();
    if (!id) return ids;
    
    ids.add(id);
    
    // If it's ME, add all first level
    if (id === "me") {
      data.firstLevel.forEach(m => ids.add(m.id));
    }
    
    // If it's a first level member, add only its direct second level children
    const firstLevelMember = data.firstLevel.find(m => m.id === id);
    if (firstLevelMember) {
      const secondLevel = data.secondLevel[firstLevelMember.id] || [];
      secondLevel.forEach(m => ids.add(m.id));
    }
    
    // If it's a second level member, add only its direct third level children
    Object.values(data.secondLevel).flat().forEach(secondLevelMember => {
      if (secondLevelMember.id === id) {
        const thirdLevel = data.thirdLevel[secondLevelMember.id] || [];
        thirdLevel.forEach(m => ids.add(m.id));
      }
    });
    
    return ids;
  };

  // Get scale factors for circles (bigger for second level when parent is clicked)
  const getScaleFactor = (circleId: string, level: number, parentId?: string): number => {
    if (!selectedId) return 1;
    
    // If this circle is selected, make it bigger based on its level
    if (circleId === selectedId) {
      if (level === 2) return 2.5; // Second level selected - make it much bigger
      if (level === 3) return 3.0; // Third level selected - triple the size
      return 1; // First level or ME - use base 1.3x from isSelected
    }
    
    // If it's a second level circle and its parent (first level) is selected, make it much bigger
    if (level === 2 && parentId && selectedId === parentId) {
      return 2.5; // Make second level much bigger when parent is clicked
    }
    
    // If it's a third level circle and its parent (second level) is selected, make it bigger
    if (level === 3 && parentId && selectedId === parentId) {
      return 2.5; // Make third level bigger when parent (second level) is clicked
    }
    
    return 1;
  };

  // Get IDs that should show text (selected circle's direct children)
  const getTextVisibleIds = (id: string | null): Set<string> => {
    const ids = new Set<string>();
    if (!id) return ids;
    
    // Always show text for the selected circle itself
    ids.add(id);
    
    // If it's ME, show first level text
    if (id === "me") {
      data.firstLevel.forEach(m => ids.add(m.id));
    }
    
    // If it's a first level member, show second level text
    const firstLevelMember = data.firstLevel.find(m => m.id === id);
    if (firstLevelMember) {
      const secondLevel = data.secondLevel[firstLevelMember.id] || [];
      secondLevel.forEach(m => ids.add(m.id));
    }
    
    // If it's a second level member, show third level text
    Object.values(data.secondLevel).flat().forEach(secondLevelMember => {
      if (secondLevelMember.id === id) {
        const thirdLevel = data.thirdLevel[secondLevelMember.id] || [];
        thirdLevel.forEach(m => ids.add(m.id));
      }
    });
    
    return ids;
  };

  const enlargedIds = getEnlargedIds(selectedId);
  const textVisibleIds = getTextVisibleIds(selectedId);
  const selectedHierarchyIds = getSelectedHierarchyIds(selectedId);

  return (
    <div className="w-full h-full overflow-auto bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="flex flex-col items-center min-h-screen">
        <h1 className="text-4xl font-bold text-white mb-8">MLM Downline Visualization</h1>
        <p className="text-white/70 mb-4">Click on any circle to enlarge it and its sub-levels</p>
        
        <svg
          width="1200"
          height="1000"
          viewBox="0 0 1200 1000"
          className="bg-slate-800/50 rounded-lg shadow-2xl border-2 border-purple-500/50"
        >
          {/* SVG filter for shadow effect */}
          <defs>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
              <feOffset dx="0" dy="4" result="offsetblur"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          {/* Connection lines from ME to first level */}
          {firstLevelPositionsAdjusted.map((pos) => (
            <line
              key={`line-me-${pos.id}`}
              x1={centerX}
              y1={centerY}
              x2={pos.x}
              y2={pos.y}
              className="stroke-purple-400/30 stroke-1"
              style={{
                transition: 'x1 0.8s cubic-bezier(0.4, 0, 0.2, 1), y1 0.8s cubic-bezier(0.4, 0, 0.2, 1), x2 0.8s cubic-bezier(0.4, 0, 0.2, 1), y2 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            />
          ))}

          {/* Connection lines from first level to second level */}
          {secondLevelPositionsFinal.map((pos) => {
            const parent = firstLevelPositionsAdjusted.find((p) => p.id === pos.parentId);
            if (!parent) return null;
            return (
              <line
                key={`line-${pos.parentId}-${pos.member.id}`}
                x1={parent.x}
                y1={parent.y}
                x2={pos.x}
                y2={pos.y}
                className="stroke-yellow-400/20 stroke-1"
                style={{
                  transition: 'x1 0.8s cubic-bezier(0.4, 0, 0.2, 1), y1 0.8s cubic-bezier(0.4, 0, 0.2, 1), x2 0.8s cubic-bezier(0.4, 0, 0.2, 1), y2 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            );
          })}

          {/* Connection lines from second level to third level */}
          {thirdLevelPositionsAdjusted.map((pos) => {
            const parent = secondLevelPositionsFinal.find((p) => p.member.id === pos.parentId);
            if (!parent) return null;
            return (
              <line
                key={`line-${parent.member.id}-${pos.member.id}`}
                x1={parent.x}
                y1={parent.y}
                x2={pos.x}
                y2={pos.y}
                className="stroke-orange-400/20 stroke-1"
                style={{
                  transition: 'x1 0.8s cubic-bezier(0.4, 0, 0.2, 1), y1 0.8s cubic-bezier(0.4, 0, 0.2, 1), x2 0.8s cubic-bezier(0.4, 0, 0.2, 1), y2 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            );
          })}

          {/* Render unselected bubbles first (background) with reduced opacity */}
          {/* Third level bubbles - unselected */}
          {thirdLevelPositionsAdjusted
            .filter((pos) => !selectedHierarchyIds.has(pos.member.id))
            .map((pos) => (
              <Bubble
                key={pos.member.id}
                id={pos.member.id}
                name={pos.member.name}
                startingCapital={pos.member.startingCapital}
                x={pos.x}
                y={pos.y}
                radius={thirdLevelRadius}
                level={3}
                isSelected={false}
                showText={false}
                scaleFactor={1}
                downlineCount={0}
                opacity={0.7}
                onClick={() => setSelectedId(selectedId === pos.member.id ? null : pos.member.id)}
              />
            ))}

          {/* Second level bubbles - unselected */}
          {secondLevelPositionsFinal
            .filter((pos) => !selectedHierarchyIds.has(pos.member.id))
            .map((pos) => (
              <Bubble
                key={pos.member.id}
                id={pos.member.id}
                name={pos.member.name}
                startingCapital={pos.member.startingCapital}
                x={pos.x}
                y={pos.y}
                radius={secondLevelRadius}
                level={2}
                isSelected={false}
                showText={false}
                scaleFactor={1}
                downlineCount={(data.thirdLevel[pos.member.id] || []).length}
                opacity={0.7}
                onClick={() => setSelectedId(selectedId === pos.member.id ? null : pos.member.id)}
              />
            ))}

          {/* First level bubbles - unselected */}
          {firstLevelPositionsAdjusted
            .filter((pos) => !selectedHierarchyIds.has(pos.id))
            .map((pos) => (
              <Bubble
                key={pos.id}
                id={pos.id}
                name={pos.name}
                startingCapital={pos.startingCapital}
                x={pos.x}
                y={pos.y}
                radius={firstLevelRadius}
                level={1}
                isSelected={false}
                showText={true}
                scaleFactor={1}
                downlineCount={(data.secondLevel[pos.id] || []).length}
                opacity={0.7}
                onClick={() => setSelectedId(selectedId === pos.id ? null : pos.id)}
              />
            ))}

          {/* ME bubble - show in background when first level is selected, otherwise normal */}
          {(!selectedId || selectedId === "me" || !data.firstLevel.find(m => m.id === selectedId)) && (
            <Bubble
              id="me"
              name={data.me.name}
              startingCapital={data.me.startingCapital}
              x={centerX}
              y={centerY}
              radius={selectedId === "me" ? meRadius : meRadius}
              level={0}
              isSelected={selectedId === "me"}
              showText={true}
              scaleFactor={1}
              downlineCount={data.firstLevel.length}
              opacity={selectedId && selectedId !== "me" ? 0.3 : 1}
              onClick={() => setSelectedId(selectedId === "me" ? null : "me")}
            />
          )}
          
          {/* ME bubble in background when first level is selected */}
          {selectedId && data.firstLevel.find(m => m.id === selectedId) && (
            <Bubble
              id="me-background"
              name={data.me.name}
              startingCapital={data.me.startingCapital}
              x={centerX}
              y={centerY}
              radius={meRadius * 0.5}
              level={0}
              isSelected={false}
              showText={false}
              scaleFactor={1}
              downlineCount={0}
              opacity={0.3}
              onClick={() => setSelectedId(null)}
            />
          )}

          {/* First level bubbles - selected (on top) */}
          {firstLevelPositionsAdjusted
            .filter((pos) => selectedHierarchyIds.has(pos.id))
            .map((pos) => (
              <Bubble
                key={pos.id}
                id={pos.id}
                name={pos.name}
                startingCapital={pos.startingCapital}
                x={pos.x}
                y={pos.y}
                radius={firstLevelRadius}
                level={1}
                isSelected={enlargedIds.has(pos.id)}
                showText={textVisibleIds.has(pos.id)}
                scaleFactor={1}
                downlineCount={(data.secondLevel[pos.id] || []).length}
                opacity={1}
                onClick={() => setSelectedId(selectedId === pos.id ? null : pos.id)}
              />
            ))}

          {/* Second level bubbles - selected (on top) */}
          {secondLevelPositionsFinal
            .filter((pos) => selectedHierarchyIds.has(pos.member.id))
            .map((pos) => (
              <Bubble
                key={pos.member.id}
                id={pos.member.id}
                name={pos.member.name}
                startingCapital={pos.member.startingCapital}
                x={pos.x}
                y={pos.y}
                radius={secondLevelRadius}
                level={2}
                isSelected={enlargedIds.has(pos.member.id)}
                showText={textVisibleIds.has(pos.member.id)}
                scaleFactor={getScaleFactor(pos.member.id, 2, pos.parentId)}
                downlineCount={(data.thirdLevel[pos.member.id] || []).length}
                opacity={1}
                onClick={() => setSelectedId(selectedId === pos.member.id ? null : pos.member.id)}
              />
            ))}

          {/* Third level bubbles - selected (on top) */}
          {thirdLevelPositionsAdjusted
            .filter((pos) => selectedHierarchyIds.has(pos.member.id))
            .map((pos) => {
              const parent = secondLevelPositionsFinal.find((p) => p.member.id === pos.parentId);
              return (
                <Bubble
                  key={pos.member.id}
                  id={pos.member.id}
                  name={pos.member.name}
                  startingCapital={pos.member.startingCapital}
                  x={pos.x}
                  y={pos.y}
                  radius={thirdLevelRadius}
                  level={3}
                  isSelected={enlargedIds.has(pos.member.id)}
                  showText={textVisibleIds.has(pos.member.id)}
                  scaleFactor={getScaleFactor(pos.member.id, 3, pos.parentId)}
                  downlineCount={0}
                  opacity={1}
                  onClick={() => setSelectedId(selectedId === pos.member.id ? null : pos.member.id)}
                />
              );
            })}
        </svg>

        {/* Legend */}
        <div className="mt-8 bg-slate-800/70 rounded-lg p-6 border border-purple-500/50">
          <h2 className="text-xl font-bold text-white mb-4">Legend</h2>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-600"></div>
              <span className="text-white">ME (Level 0)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-green-500"></div>
              <span className="text-white">First Level (7 max)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-yellow-500"></div>
              <span className="text-white">Second Level (7 max per parent)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-orange-500"></div>
              <span className="text-white">Third Level (7 max per parent)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

