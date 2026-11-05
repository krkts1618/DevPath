import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Layers,
  Archive,
  RotateCcw,
  Edit2,
  Trash2,
  ArrowRight,
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
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';

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
  const currentDay = roadmap.currentDayNumber || roadmap.currentLearningDayNumber;

  return (
    <div
      onClick={handleCardClick}
      className={`group relative bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] hover:border-[var(--accent-primary)] dark:hover:border-[var(--accent-primary)] rounded-xl p-5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between ${
        isArchived ? 'opacity-70 border-dashed' : ''
      }`}
    >
      <div>
        {/* Top: Category, Icon & Status */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-[var(--accent-primary)] border border-amber-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <TechIcon className="w-5 h-5" />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {currentDay && (
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#F8F9F6] dark:bg-[#252C35] text-[var(--accent-primary)] border border-[#E4E7E0] dark:border-[#303945]">
                Day {currentDay}
              </span>
            )}
            <Badge type={roadmap.status}>{roadmap.status}</Badge>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-[#202620] dark:text-[#F3F4F6] group-hover:text-[var(--accent-primary)] transition-colors line-clamp-1 mb-1">
          {roadmap.title}
        </h3>

        {/* Duration / Category Metadata */}
        <div className="flex items-center gap-2 text-xs text-[#858D82] dark:text-[#7F8996] font-mono mb-4">
          <span className="font-semibold text-[#596258] dark:text-[#B0B7C2]">
            {roadmap.duration || daysCount} Days
          </span>
          <span>•</span>
          <span className="truncate max-w-[140px]">
            {roadmap.category?.name || 'Development'}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-[#596258] dark:text-[#B0B7C2] line-clamp-2 mb-4 leading-relaxed">
          {roadmap.description || 'No description provided.'}
        </p>
      </div>

      <div>
        {/* Progress bar matching Reference */}
        <div className="space-y-1.5 mb-3">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-[#858D82] dark:text-[#7F8996]">Progress</span>
            <span className="font-bold text-[var(--accent-primary)]">{progressPercent}%</span>
          </div>
          <ProgressBar value={progressPercent} size="sm" showLabel={false} />
        </div>

        {/* Card Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[#E4E7E0] dark:border-[#303945] text-[11px] text-[#858D82] dark:text-[#7F8996]">
          <div className="flex items-center gap-3 font-mono">
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3 text-[var(--accent-primary)] opacity-80" />
              {modulesCount} {modulesCount === 1 ? 'module' : 'modules'}
            </span>
            {totalTasks > 0 && (
              <span>
                {completedTasks}/{totalTasks} tasks
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(roadmap);
                }}
                className="p-1.5 rounded-md hover:bg-[#F0F2ED] dark:hover:bg-[#252C35] text-[#858D82] hover:text-[#202620] dark:text-[#7F8996] dark:hover:text-[#F3F4F6] transition"
                title="Edit Roadmap Settings"
              >
                <Edit2 className="w-3.5 h-3.5" />
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
                  className="p-1.5 rounded-md hover:bg-[#F0F2ED] dark:hover:bg-[#252C35] text-amber-600 dark:text-amber-400 transition"
                  title="Restore Roadmap"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
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
                  className="p-1.5 rounded-md hover:bg-[#F0F2ED] dark:hover:bg-[#252C35] text-[#858D82] hover:text-[#202620] dark:text-[#7F8996] dark:hover:text-[#F3F4F6] transition"
                  title="Archive Roadmap"
                >
                  <Archive className="w-3.5 h-3.5" />
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
                className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 text-red-500 transition"
                title="Permanently Delete Roadmap"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
