import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowRight } from 'lucide-react';
import ProgressBar from '../ui/ProgressBar';

export default function ActiveRoadmapsGrid({ roadmaps = [] }) {
  const activeRoadmaps = roadmaps.filter((r) => r.status?.toLowerCase() === 'active');

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E8E8DF] dark:border-[#393E46]">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-[#244C3B] dark:text-[#DFD0B8]" />
          <h2 className="text-xs font-bold text-[#202A23] dark:text-[#DFD0B8] uppercase tracking-wider">
            Active Learning Tracks
          </h2>
          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#E8E8DF] dark:bg-[#393E46] text-[#737C74] dark:text-[#948979]">
            {activeRoadmaps.length}
          </span>
        </div>

        <Link
          to="/roadmaps"
          className="text-xs font-medium text-[#244C3B] dark:text-[#DFD0B8] hover:text-[#1A3B2C] dark:hover:text-[#ECE3D4] flex items-center gap-1 group"
        >
          <span>View All Roadmaps</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {activeRoadmaps.slice(0, 6).map((roadmap) => {
          const progress   = roadmap.progressPercent || 0;
          const currentDay = roadmap.currentDayNumber || 1;

          return (
            <Link
              key={roadmap.id}
              to={`/roadmaps/${roadmap.id}`}
              className="group block p-4 rounded-lg border border-[#E8E8DF] dark:border-[#393E46] bg-[#F7F7F2] dark:bg-[#222831] hover:border-[#244C3B]/40 dark:hover:border-[#DFD0B8]/40 hover:bg-white dark:hover:bg-[#2A303A] transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="min-w-0">
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#E8E8DF] dark:bg-[#393E46] text-[#737C74] dark:text-[#948979]">
                    {roadmap.category?.name || 'General'}
                  </span>
                  <h3 className="text-sm font-bold text-[#202A23] dark:text-[#DFD0B8] group-hover:text-[#244C3B] dark:group-hover:text-[#DFD0B8] transition-colors mt-1 truncate">
                    {roadmap.title}
                  </h3>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-mono font-semibold text-[#202A23] dark:text-[#DFD0B8]">
                    {progress}%
                  </span>
                </div>
              </div>

              {/* Current Learning Day */}
              <div className="flex items-center justify-between text-xs text-[#737C74] dark:text-[#948979] mb-2">
                <span className="inline-flex items-center gap-1 font-medium text-[#244C3B] dark:text-[#DFD0B8]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#244C3B] dark:bg-[#DFD0B8]" />
                  Day {currentDay} of {roadmap.duration}
                </span>
                <span className="font-mono text-[11px]">
                  {roadmap.completedTasks || 0}/{roadmap.totalTasks || 0} tasks
                </span>
              </div>

              <ProgressBar value={progress} size="sm" showLabel={false} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
