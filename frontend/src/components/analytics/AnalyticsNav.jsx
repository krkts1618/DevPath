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
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-[var(--border-subtle)]">
      <button
        onClick={() => onSelectSection('all')}
        className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
          activeSection === 'all'
            ? 'bg-[var(--accent-primary)] text-[var(--accent-text)] shadow-xs'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]'
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
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              isActive
                ? 'bg-[var(--accent-primary)] text-[var(--accent-text)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[var(--accent-text)]' : 'text-[var(--text-muted)]'}`} />
            <span>{sec.label}</span>
          </button>
        );
      })}
    </div>
  );
}
