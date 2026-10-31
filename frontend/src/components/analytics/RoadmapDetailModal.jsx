import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  X,
  CheckCircle2,
  Clock,
  Flame,
  Calendar,
  Layers,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { roadmapService } from '../../services/roadmapService';
import Button from '../ui/Button';

export default function RoadmapDetailModal({ roadmap, onClose }) {
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roadmap?.id) return;
    let isMounted = true;
    roadmapService
      .getRoadmapById(roadmap.id)
      .then((data) => {
        if (isMounted) {
          setDetails(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load roadmap details:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [roadmap?.id]);

  if (!roadmap) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-xl bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E8E8DF] dark:border-[#393E46]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#E8F0EB] dark:bg-[#393E46] flex items-center justify-center text-[#244C3B] dark:text-[#DFD0B8]">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#202A23] dark:text-[#DFD0B8]">
                {roadmap.title}
              </h3>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-[#737C74] dark:text-[#948979]">
                <span className="font-semibold text-[#244C3B] dark:text-[#DFD0B8]">
                  {roadmap.categoryName}
                </span>
                <span>&bull;</span>
                <span className="capitalize">{roadmap.status} track</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                navigate(`/roadmaps/${roadmap.id}`);
              }}
              className="p-1.5 rounded-lg text-[#737C74] hover:text-[#202A23] dark:text-[#948979] dark:hover:text-[#DFD0B8] hover:bg-[#F0F0EB] dark:hover:bg-[#393E46] transition cursor-pointer"
              title="Open full roadmap page"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#737C74] hover:text-[#202A23] dark:text-[#948979] dark:hover:text-[#DFD0B8] hover:bg-[#F0F0EB] dark:hover:bg-[#393E46] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Progress overview banner */}
          <div className="p-4 rounded-xl bg-[#F7F7F2] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#737C74] dark:text-[#948979]">
                Adaptive Mastery Progress
              </span>
              <span className="text-xs font-bold font-mono text-[#244C3B] dark:text-[#DFD0B8]">
                {roadmap.progressPercent}% ({roadmap.completedTasks} / {roadmap.totalTasks} tasks)
              </span>
            </div>
            <div className="w-full bg-[#E8E8DF] dark:bg-[#393E46] rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#244C3B] dark:bg-[#91A88E] h-2 rounded-full transition-all duration-300"
                style={{ width: `${roadmap.progressPercent}%` }}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-[#E8E8DF] dark:border-[#393E46]/60">
              <div>
                <div className="text-[10px] uppercase font-bold text-[#737C74] dark:text-[#948979]">Current Day</div>
                <div className="text-sm font-bold font-mono text-[#202A23] dark:text-[#DFD0B8] mt-0.5">
                  Day {roadmap.currentDayNumber}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-[#737C74] dark:text-[#948979]">Pending Tasks</div>
                <div className="text-sm font-bold font-mono text-[#202A23] dark:text-[#DFD0B8] mt-0.5">
                  {roadmap.pendingTasks}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-[#737C74] dark:text-[#948979]">Recorded Focus</div>
                <div className="text-sm font-bold font-mono text-[#202A23] dark:text-[#DFD0B8] mt-0.5">
                  {roadmap.totalStudyHours}h
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-[#737C74] dark:text-[#948979]">Remaining Est.</div>
                <div className="text-sm font-bold font-mono text-[#202A23] dark:text-[#DFD0B8] mt-0.5">
                  {roadmap.estimatedRemainingHours}h
                </div>
              </div>
            </div>
          </div>

          {/* Curriculum Days Breakdown */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#202A23] dark:text-[#DFD0B8] mb-3">
              Curriculum Days & Task Status
            </h4>

            {loading ? (
              <div className="space-y-2">
                <div className="h-10 bg-[#E8E8DF] dark:bg-[#393E46] rounded-lg animate-pulse" />
                <div className="h-10 bg-[#E8E8DF] dark:bg-[#393E46] rounded-lg animate-pulse" />
                <div className="h-10 bg-[#E8E8DF] dark:bg-[#393E46] rounded-lg animate-pulse" />
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {(details?.roadmapDays || []).map((day) => {
                  const dayTasks = day.tasks || [];
                  const doneCount = dayTasks.filter((t) => t.completions && t.completions.some((c) => c.completed)).length;
                  const isDayDone = dayTasks.length > 0 && doneCount === dayTasks.length;
                  const isCurrent = day.dayNumber === roadmap.currentDayNumber;

                  return (
                    <div
                      key={day.id}
                      className={`p-3 rounded-lg border flex items-center justify-between text-xs transition ${
                        isCurrent
                          ? 'bg-[#E8F0EB]/60 dark:bg-[#393E46]/60 border-[#244C3B]/40 dark:border-[#DFD0B8]/40'
                          : isDayDone
                          ? 'bg-[#F7F7F2] dark:bg-[#222831] border-[#E8E8DF] dark:border-[#393E46] opacity-80'
                          : 'bg-[#FFFFFF] dark:bg-[#2A303A] border-[#E8E8DF] dark:border-[#393E46]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-6 h-6 rounded flex items-center justify-center font-mono font-bold text-[11px] ${
                            isDayDone
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                              : isCurrent
                              ? 'bg-[#244C3B] text-white'
                              : 'bg-[#E8E8DF] dark:bg-[#393E46] text-[#737C74] dark:text-[#948979]'
                          }`}
                        >
                          {isDayDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : day.dayNumber}
                        </div>
                        <div className="truncate">
                          <span className="font-semibold text-[#202A23] dark:text-[#DFD0B8]">
                            {day.title}
                          </span>
                          {isCurrent && (
                            <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#244C3B] text-white">
                              Current Frontier
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 font-mono text-[11px] text-[#737C74] dark:text-[#948979]">
                        <span>
                          {doneCount} / {dayTasks.length} tasks
                        </span>
                        <span>{day.estimatedStudyTime || 120}m</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E8E8DF] dark:border-[#393E46] flex items-center justify-between bg-[#F7F7F2] dark:bg-[#222831]">
          <div className="text-[11px] text-[#737C74] dark:text-[#948979]">
            Last Activity: {roadmap.lastActivityDate ? new Date(roadmap.lastActivityDate).toLocaleDateString() : 'None logged yet'}
          </div>
          <button
            onClick={() => {
              onClose();
              navigate(`/roadmaps/${roadmap.id}`);
            }}
            className="px-3 py-1.5 rounded-lg bg-[#244C3B] text-white text-xs font-semibold hover:bg-[#1B382B] transition cursor-pointer flex items-center gap-1.5"
          >
            <span>Open Roadmap View</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
