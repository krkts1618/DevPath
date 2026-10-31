import React from 'react';
import {
  LayoutDashboard,
  Compass,
  Clock,
  Flame,
  CheckCircle2,
  RotateCcw,
  FolderGit2,
  Sparkles,
} from 'lucide-react';

export const SECTIONS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'technology', label: 'Technology Tracks', icon: Compass },
  { id: 'study-time', label: 'Study Time', icon: Clock },
  { id: 'consistency', label: 'Consistency & Streaks', icon: Flame },
  { id: 'tasks', label: 'Task Performance', icon: CheckCircle2 },
  { id: 'revisions', label: 'Revision Recall', icon: RotateCcw },
  { id: 'projects', label: 'Projects', icon: FolderGit2 },
  { id: 'insights', label: 'Engineering Insights', icon: Sparkles },
];

export default function AnalyticsNav({ activeSection, onSelectSection }) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-[#E8E8DF] dark:border-[#393E46]">
      <button
        onClick={() => onSelectSection('all')}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
          activeSection === 'all'
            ? 'bg-[#244C3B] text-white shadow-xs'
            : 'text-[#737C74] dark:text-[#948979] hover:text-[#202A23] dark:hover:text-[#DFD0B8] hover:bg-[#F0F0EB] dark:hover:bg-[#393E46]'
        }`}
      >
        All Sections
      </button>

      {SECTIONS.map((sec) => {
        const Icon = sec.icon;
        const isActive = activeSection === sec.id;
        return (
          <button
            key={sec.id}
            onClick={() => onSelectSection(sec.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              isActive
                ? 'bg-[#244C3B] text-white shadow-xs'
                : 'text-[#737C74] dark:text-[#948979] hover:text-[#202A23] dark:hover:text-[#DFD0B8] hover:bg-[#F0F0EB] dark:hover:bg-[#393E46]'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#737C74] dark:text-[#948979]'}`} />
            <span>{sec.label}</span>
          </button>
        );
      })}
    </div>
  );
}
