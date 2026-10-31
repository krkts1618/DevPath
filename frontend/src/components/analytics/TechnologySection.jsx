import React, { useState, useMemo } from 'react';
import {
  Compass,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Flame,
  ArrowRight,
  Layers,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import RoadmapDetailModal from './RoadmapDetailModal';

export default function TechnologySection({ roadmaps = [], consistency }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('active');
  const [inspectingRoadmap, setInspectingRoadmap] = useState(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set();
    roadmaps.forEach((r) => {
      if (r.categoryName) set.add(r.categoryName);
    });
    return Array.from(set).sort();
  }, [roadmaps]);

  // Merge roadmap streaks
  const streaksMap = useMemo(() => {
    const map = new Map();
    (consistency?.roadmapStreaks || []).forEach((s) => {
      map.set(s.roadmapId, s);
    });
    return map;
  }, [consistency]);

  // Filter roadmaps
  const filteredRoadmaps = useMemo(() => {
    return roadmaps.filter((r) => {
      if (selectedStatus !== 'all' && r.status !== selectedStatus) {
        return false;
      }
      if (selectedCategory !== 'all' && r.categoryName !== selectedCategory) {
        return false;
      }
      if (search && !r.title.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [roadmaps, selectedStatus, selectedCategory, search]);

  return (
    <div className="space-y-4">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E8DF] dark:border-[#393E46]">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#202A23] dark:text-[#DFD0B8]">
            Roadmap & Technology Performance
          </h2>
          <p className="text-xs text-[#737C74] dark:text-[#948979] mt-0.5">
            Independent curriculum progression across active engineering tracks
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative min-w-[160px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#737C74] dark:text-[#948979]" />
            <input
              type="text"
              placeholder="Search tracks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] text-[#202A23] dark:text-[#DFD0B8] focus:outline-none focus:ring-1 focus:ring-[#244C3B]"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] text-[#202A23] dark:text-[#DFD0B8] focus:outline-none focus:ring-1 focus:ring-[#244C3B]"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] text-[#202A23] dark:text-[#DFD0B8] focus:outline-none focus:ring-1 focus:ring-[#244C3B]"
          >
            <option value="active">Active Tracks</option>
            <option value="all">All Tracks</option>
            <option value="paused">Paused Tracks</option>
            <option value="archived">Archived Tracks</option>
          </select>
        </div>
      </div>

      {/* Roadmaps Grid */}
      {filteredRoadmaps.length === 0 ? (
        <div className="py-12 text-center bg-[#FFFFFF] dark:bg-[#2A303A] rounded-xl border border-[#E8E8DF] dark:border-[#393E46] p-6">
          <Compass className="w-8 h-8 text-[#737C74] dark:text-[#948979] mx-auto mb-2 opacity-50" />
          <p className="text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8]">
            No roadmaps match the selected filters.
          </p>
          <p className="text-[11px] text-[#737C74] dark:text-[#948979] mt-0.5">
            Try adjusting your search criteria or filter status.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRoadmaps.map((rm) => {
            const streak = streaksMap.get(rm.id);

            return (
              <div
                key={rm.id}
                onClick={() => setInspectingRoadmap(rm)}
                className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-4 shadow-xs hover:border-[#244C3B]/40 dark:hover:border-[#DFD0B8]/40 transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Top: Category pill + status */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#E8F0EB] dark:bg-[#393E46] text-[#244C3B] dark:text-[#DFD0B8]">
                      {rm.categoryName}
                    </span>
                    <span className="text-[11px] font-mono text-[#737C74] dark:text-[#948979] capitalize">
                      {rm.status}
                    </span>
                  </div>

                  {/* Title & Frontier Day */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-[#202A23] dark:text-[#DFD0B8] hover:text-[#244C3B] dark:hover:text-[#DFD0B8] transition">
                        {rm.title}
                      </h3>
                      <div className="text-[11px] text-[#737C74] dark:text-[#948979] mt-0.5">
                        Current: <span className="font-semibold text-[#202A23] dark:text-[#DFD0B8]">Day {rm.currentDayNumber}</span> ({rm.currentDayTitle})
                      </div>
                    </div>

                    {/* Streak badge */}
                    {streak && (streak.currentStreak > 0 || streak.bestStreak > 0) && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs font-mono font-bold shrink-0">
                        <Flame className="w-3.5 h-3.5" />
                        <span>{streak.currentStreak}d</span>
                      </div>
                    )}
                  </div>

                  {/* Horizontal Progress Bar */}
                  <div className="space-y-1.5 mb-3.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#737C74] dark:text-[#948979]">
                        Progress
                      </span>
                      <span className="font-mono font-bold text-[#244C3B] dark:text-[#DFD0B8]">
                        {rm.progressPercent}% ({rm.completedTasks} / {rm.totalTasks})
                      </span>
                    </div>
                    <div className="w-full bg-[#E8E8DF] dark:bg-[#393E46] rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#244C3B] dark:bg-[#91A88E] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${rm.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom stats row */}
                <div className="pt-3 border-t border-[#E8E8DF] dark:border-[#393E46] grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <div className="text-[10px] text-[#737C74] dark:text-[#948979]">Pending</div>
                    <div className="font-mono font-bold text-[#202A23] dark:text-[#DFD0B8] mt-0.5">
                      {rm.pendingTasks}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#737C74] dark:text-[#948979]">Focused Time</div>
                    <div className="font-mono font-bold text-[#202A23] dark:text-[#DFD0B8] mt-0.5">
                      {rm.totalStudyHours}h
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#737C74] dark:text-[#948979]">Est. Remaining</div>
                    <div className="font-mono font-bold text-[#202A23] dark:text-[#DFD0B8] mt-0.5">
                      {rm.estimatedRemainingHours}h
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Roadmap Detail Modal */}
      {inspectingRoadmap && (
        <RoadmapDetailModal
          roadmap={inspectingRoadmap}
          onClose={() => setInspectingRoadmap(null)}
        />
      )}
    </div>
  );
}
