import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Calendar,
  ArrowRight,
  Archive,
  RotateCcw,
  Edit2,
  Trash2,
  Layers,
  ListTodo,
} from 'lucide-react';
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';

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

  const formattedStartDate = roadmap.startDate
    ? new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(new Date(roadmap.startDate))
    : 'Not scheduled';

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
      className={`group relative bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] hover:border-[#244C3B] dark:hover:border-[#DFD0B8] rounded-xl p-5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between ${
        isArchived ? 'opacity-70 border-dashed' : ''
      }`}
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-semibold tracking-wider uppercase font-mono text-[#244C3B] dark:text-[#DFD0B8] truncate">
            {roadmap.category?.name || 'General Category'}
          </span>
          <div className="flex items-center gap-1.5">
            {currentDay && (
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#E8F0EB] dark:bg-[#393E46] text-[#244C3B] dark:text-[#DFD0B8] border border-[#C5D9CB] dark:border-[#4F5561]">
                Day {currentDay}
              </span>
            )}
            <Badge type={roadmap.status}>{roadmap.status}</Badge>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-[#202A23] dark:text-[#DFD0B8] group-hover:text-[#244C3B] dark:group-hover:text-[#DFD0B8] transition-colors line-clamp-1 mb-2">
          {roadmap.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-[#737C74] dark:text-[#948979] line-clamp-2 mb-4 leading-relaxed">
          {roadmap.description || 'No description provided.'}
        </p>

        {/* Module & Day Sub-Counts */}
        <div className="flex items-center gap-3 text-[11px] font-mono text-[#737C74] dark:text-[#948979] mb-3 pb-2 border-b border-[#E8E8DF] dark:border-[#393E46]">
          <span className="flex items-center gap-1">
            <Layers className="w-3 h-3 text-[#91A88E]" />
            {modulesCount} {modulesCount === 1 ? 'module' : 'modules'}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#91A88E]" />
            {daysCount} days
          </span>
          {totalTasks > 0 && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ListTodo className="w-3 h-3 text-[#91A88E]" />
                {totalTasks} tasks
              </span>
            </>
          )}
        </div>
      </div>

      <div>
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center text-xs mb-1.5 font-mono">
            <span className="text-[#737C74] dark:text-[#948979]">
              {totalTasks > 0
                ? `${completedTasks}/${totalTasks} completed`
                : `${roadmap.duration} days planned`}
            </span>
            <span className="text-[#202A23] dark:text-[#DFD0B8] font-semibold">
              {progressPercent}%
            </span>
          </div>
          <ProgressBar
            value={progressPercent}
            size="sm"
            color={progressPercent === 100 ? 'emerald' : 'green'}
          />
        </div>

        {/* Footer info & Actions */}
        <div className="pt-3 border-t border-[#E8E8DF] dark:border-[#393E46] flex items-center justify-between text-xs text-[#737C74] dark:text-[#948979]">
          <div className="flex items-center gap-1.5" title="Start Date (Asia/Kolkata)">
            <Calendar className="w-3.5 h-3.5 text-[#91A88E]" />
            <span>{formattedStartDate}</span>
          </div>

          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(roadmap);
                }}
                title="Edit Roadmap"
                className="p-1.5 rounded-md text-[#737C74] hover:text-[#202A23] dark:hover:text-[#DFD0B8] hover:bg-[#F0F0EB] dark:hover:bg-[#393E46] transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}

            {isArchived ? (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRestore?.(roadmap.id);
                  }}
                  title="Restore Roadmap"
                  className="p-1.5 rounded-md text-[#737C74] hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-[#F0F0EB] dark:hover:bg-[#393E46] transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                {onDeletePermanent && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePermanent(roadmap);
                    }}
                    title="Permanently Delete Roadmap"
                    className="p-1.5 rounded-md text-[#737C74] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-[#F0F0EB] dark:hover:bg-[#393E46] transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive?.(roadmap.id);
                  }}
                  title="Archive Roadmap"
                  className="p-1.5 rounded-md text-[#737C74] hover:text-amber-600 dark:hover:text-amber-400 hover:bg-[#F0F0EB] dark:hover:bg-[#393E46] transition-colors"
                >
                  <Archive className="w-3.5 h-3.5" />
                </button>
                {onDeletePermanent && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePermanent(roadmap);
                    }}
                    title="Permanently Delete Roadmap"
                    className="p-1.5 rounded-md text-[#737C74] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-[#F0F0EB] dark:hover:bg-[#393E46] transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </>
            )}

            <span className="text-[#D4D4CA] dark:text-[#4F5561]">|</span>

            <div className="flex items-center gap-0.5 text-[#244C3B] dark:text-[#DFD0B8] font-medium group-hover:translate-x-0.5 transition-transform">
              <span>View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
