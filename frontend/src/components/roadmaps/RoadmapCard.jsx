import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Archive,
  RotateCcw,
  Edit2,
  Trash2,
  Code2,
  Coffee,
  Database,
  Terminal,
  GitBranch,
  Brain,
  BookOpen,
  Zap,
  Compass,
} from 'lucide-react';

function getRoadmapTechIcon(title = '', slug = '') {
  const t = (title + ' ' + slug).toLowerCase();
  if (t.includes('mern') || t.includes('react')) return Code2;
  if (t.includes('java') || t.includes('spring')) return Coffee;
  if (t.includes('dbms') || t.includes('database')) return Database;
  if (t.includes('operating') || t.includes('network') || t.includes('os')) return Terminal;
  if (t.includes('git') || t.includes('docker')) return GitBranch;
  if (t.includes('aptitude') || t.includes('reasoning')) return Brain;
  if (t.includes('english') || t.includes('communication')) return BookOpen;
  if (t.includes('advanced')) return Zap;
  return Compass;
}

export default function RoadmapCard({
  roadmap,
  onEdit,
  onArchive,
  onRestore,
  onDeletePermanent,
}) {
  const navigate = useNavigate();

  const handleCardClick = (e) => {
    if (e.target.closest('button')) return;
    navigate(`/roadmaps/${roadmap.id}`);
  };

  const TechIcon = getRoadmapTechIcon(roadmap.title, roadmap.slug);

  const modulesCount = roadmap.modulesCount ?? roadmap._count?.modules ?? 0;
  const daysCount = roadmap.daysCount ?? roadmap._count?.roadmapDays ?? roadmap.duration ?? 0;
  const totalTasks = roadmap.totalTasks ?? 0;
  const completedTasks = roadmap.completedTasks ?? 0;
  const progressPercent =
    roadmap.progressPercent !== undefined
      ? roadmap.progressPercent
      : totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

  const isArchived = roadmap.status?.toLowerCase() === 'archived';

  return (
    <div
      onClick={handleCardClick}
      className={`group relative bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] hover:border-[var(--accent-primary)] dark:hover:border-[var(--accent-primary)] rounded-2xl p-4 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between ${
        isArchived ? 'opacity-70 border-dashed' : ''
      }`}
    >
      <div>
        {/* Top: Icon & Duration / Status */}
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-[var(--accent-primary)] border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <TechIcon className="w-4 h-4" />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-[#858D82] dark:text-[#7F8996]">
              {roadmap.duration || daysCount} Days
            </span>
            {isArchived && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-neutral-200 dark:bg-neutral-800 text-[#858D82] dark:text-[#7F8996]">
                Archived
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-[#202620] dark:text-[#F3F4F6] group-hover:text-[var(--accent-primary)] transition-colors truncate mb-1">
          {roadmap.title}
        </h3>

        {/* Short Description */}
        <p className="text-xs text-[#596258] dark:text-[#B0B7C2] line-clamp-1 mb-3 leading-relaxed">
          {roadmap.description || 'Structured engineering progression track.'}
        </p>
      </div>

      <div className="space-y-2">
        {/* Progress Bar (Matching IMAGE 1) */}
        <div>
          <div className="flex justify-between items-center text-xs font-mono mb-1">
            <span className="text-[11px] text-[#858D82] dark:text-[#7F8996]">Progress</span>
            <span className="font-bold text-[var(--accent-primary)]">{progressPercent}%</span>
          </div>
          <div className="w-full bg-[#E4E7E0] dark:bg-[#252C35] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[var(--accent-primary)] h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Card Footer: Modules/Tasks + Quick Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[#E4E7E0] dark:border-[#303945] text-[11px] text-[#858D82] dark:text-[#7F8996]">
          <div className="flex items-center gap-2 font-mono">
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3 text-[var(--accent-primary)] opacity-80" />
              {modulesCount} mod
            </span>
            <span>•</span>
            <span>{completedTasks}/{totalTasks} tasks</span>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
            {onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(roadmap);
                }}
                className="p-1.5 rounded-lg hover:bg-[#F0F2ED] dark:hover:bg-[#252C35] text-[#858D82] hover:text-[#202620] dark:text-[#7F8996] dark:hover:text-[#F3F4F6] transition"
                title="Edit"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            )}

            {isArchived ? (
              onRestore && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRestore(roadmap.id);
                  }}
                  className="p-1.5 rounded-lg hover:bg-[#F0F2ED] dark:hover:bg-[#252C35] text-amber-500 transition"
                  title="Restore"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )
            ) : (
              onArchive && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive(roadmap.id);
                  }}
                  className="p-1.5 rounded-lg hover:bg-[#F0F2ED] dark:hover:bg-[#252C35] text-[#858D82] hover:text-[#202620] dark:text-[#7F8996] dark:hover:text-[#F3F4F6] transition"
                  title="Archive"
                >
                  <Archive className="w-3 h-3" />
                </button>
              )
            )}

            {isArchived && onDeletePermanent && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeletePermanent(roadmap.id);
                }}
                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-red-500 transition"
                title="Delete"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

