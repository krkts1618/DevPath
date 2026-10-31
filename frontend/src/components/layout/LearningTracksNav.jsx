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
      <div className="pt-4 border-t border-[#E8E8DF] dark:border-[#393E46]">
        <NavLink
          to="/roadmaps"
          title="My Learning Tracks"
          className={({ isActive }) =>
            `flex items-center justify-center p-2 rounded-lg text-[#737C74] hover:text-[#202A23] dark:text-[#948979] dark:hover:text-[#DFD0B8] hover:bg-[#F0F0EB] dark:hover:bg-[#393E46] ${
              isActive ? 'text-[#244C3B] dark:text-[#DFD0B8] bg-[#E8F0EB] dark:bg-[#393E46]' : ''
            }`
          }
        >
          <Layers className="w-4 h-4" />
        </NavLink>
      </div>
    );
  }

  const activeRoadmaps = roadmaps.filter((r) => r.status?.toLowerCase() === 'active');

  return (
    <div className="pt-4 border-t border-[#E8E8DF] dark:border-[#393E46]">
      <div className="flex items-center justify-between px-3 mb-2">
        <span className="text-[11px] font-semibold text-[#91A88E] dark:text-[#948979] uppercase tracking-wider">
          My Learning Tracks
        </span>
        <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-[#E8E8DF] dark:bg-[#393E46] text-[#737C74] dark:text-[#948979]">
          {activeRoadmaps.length}
        </span>
      </div>

      <div className="space-y-1">
        {categories.map((cat) => {
          const catRoadmaps = activeRoadmaps.filter((r) => r.categoryId === cat.id);
          if (catRoadmaps.length === 0) return null;

          const isOpen = openCategories[cat.id] ?? true;

          return (
            <div key={cat.id} className="text-xs">
              <button
                onClick={() => toggleCategory(cat.id)}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-md text-[#4A5749] hover:text-[#202A23] dark:text-[#C8BFB0] dark:hover:text-[#DFD0B8] hover:bg-[#F0F0EB] dark:hover:bg-[#393E46] text-left font-medium transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <Folder className="w-3.5 h-3.5 text-[#91A88E] flex-shrink-0" />
                  <span className="truncate">{cat.name}</span>
                </div>
                {isOpen ? (
                  <ChevronDown className="w-3 h-3 text-[#91A88E] flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-[#91A88E] flex-shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="ml-4 pl-2 border-l border-[#E8E8DF] dark:border-[#393E46] mt-0.5 space-y-0.5">
                  {catRoadmaps.map((r) => (
                    <NavLink
                      key={r.id}
                      to={`/roadmaps/${r.id}`}
                      onClick={onItemClick}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                          isActive
                            ? 'bg-[#E8F0EB] text-[#244C3B] dark:bg-[#393E46] dark:text-[#DFD0B8] font-semibold'
                            : 'text-[#4A5749] hover:text-[#202A23] dark:text-[#C8BFB0] dark:hover:text-[#DFD0B8] hover:bg-[#F0F0EB] dark:hover:bg-[#393E46]'
                        }`
                      }
                    >
                      <span className="truncate">{r.title}</span>
                      <span className="text-[10px] text-[#91A88E] dark:text-[#948979] font-mono flex-shrink-0 ml-1">
                        {r.duration}d
                      </span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
