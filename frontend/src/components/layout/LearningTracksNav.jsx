import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDown, ChevronRight, Folder, Layers } from 'lucide-react';

export default function LearningTracksNav({
  categories = [],
  roadmaps = [],
  isCollapsed = false,
  onItemClick,
}) {
  const [openCategories, setOpenCategories] = useState({});

  const toggleCategory = (catId) => {
    setOpenCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  if (isCollapsed) {
    return (
      <div className="pt-3 mt-2 border-t border-[#E4E7E0] dark:border-[#303945]">
        <NavLink
          to="/roadmaps"
          title="My Learning Tracks"
          className={({ isActive }) =>
            `flex items-center justify-center p-2 rounded-lg text-[#858D82] hover:text-[#202620] dark:text-[#7F8996] dark:hover:text-[#F3F4F6] hover:bg-[#F0F2ED] dark:hover:bg-[#252C35] ${
              isActive ? 'text-[var(--accent-primary)] bg-amber-500/10' : ''
            }`
          }
        >
          <Layers className="w-4 h-4" />
        </NavLink>
      </div>
    );
  }

  // Show active & paused roadmaps (filter out archived)
  const displayRoadmaps = roadmaps.filter((r) => r.status?.toLowerCase() !== 'archived');
  const activeCount = roadmaps.filter((r) => r.status?.toLowerCase() === 'active').length;

  return (
    <div className="pt-3 mt-2 border-t border-[#E4E7E0] dark:border-[#303945]">
      <div className="flex items-center justify-between px-3 mb-2">
        <span className="text-[10px] font-bold text-[#858D82] dark:text-[#7F8996] uppercase tracking-wider font-mono">
          Learning Tracks
        </span>
        <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-[#E4E7E0] dark:bg-[#252C35] text-[#596258] dark:text-[#7F8996]">
          {activeCount}
        </span>
      </div>

      <div className="space-y-1">
        {categories.map((cat) => {
          const catRoadmaps = displayRoadmaps.filter((r) => r.categoryId === cat.id);
          if (catRoadmaps.length === 0) return null;

          const isOpen = openCategories[cat.id] ?? true;

          return (
            <div key={cat.id} className="text-xs">
              <button
                onClick={() => toggleCategory(cat.id)}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-md text-[#596258] hover:text-[#202620] dark:text-[#B0B7C2] dark:hover:text-[#F3F4F6] hover:bg-[#F0F2ED] dark:hover:bg-[#252C35] text-left font-medium transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <Folder className="w-3.5 h-3.5 text-[var(--accent-primary)] flex-shrink-0 opacity-80" />
                  <span className="truncate">{cat.name}</span>
                </div>
                {isOpen ? (
                  <ChevronDown className="w-3 h-3 text-[#858D82] dark:text-[#7F8996] flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-[#858D82] dark:text-[#7F8996] flex-shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="ml-4 pl-2 border-l border-[#E4E7E0] dark:border-[#303945] mt-0.5 space-y-0.5">
                  {catRoadmaps.map((r) => {
                    const isPaused = r.status?.toLowerCase() === 'paused';
                    return (
                      <NavLink
                        key={r.id}
                        to={`/roadmaps/${r.id}`}
                        onClick={onItemClick}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                            isActive
                              ? 'bg-amber-500/10 text-[var(--accent-primary)] font-semibold'
                              : 'text-[#596258] hover:text-[#202620] dark:text-[#B0B7C2] dark:hover:text-[#F3F4F6] hover:bg-[#F0F2ED] dark:hover:bg-[#252C35]'
                          }`
                        }
                      >
                        <span className="truncate flex-1">{r.title}</span>
                        <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                          {isPaused && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono">
                              p
                            </span>
                          )}
                          <span className="text-[10px] text-[#858D82] dark:text-[#7F8996] font-mono">
                            {r.duration}d
                          </span>
                        </div>
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
