import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { roadmapService } from '../../services/roadmapService';
import { dayService } from '../../services/dayService';

export default function DayModal({
  isOpen,
  onClose,
  roadmapId,
  roadmapStartDate = null,
  roadmapDuration = 30,
  modules = [],
  day = null,
  defaultModuleId = null,
  onSuccess,
}) {
  const [dayNumber, setDayNumber] = useState(1);
  const [title, setTitle] = useState('');
  const [objective, setObjective] = useState('');
  const [estimatedStudyTime, setEstimatedStudyTime] = useState(120);
  const [dayType, setDayType] = useState('learning');
  const [moduleId, setModuleId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (day) {
      setDayNumber(day.dayNumber || 1);
      setTitle(day.title || '');
      setObjective(day.objective || '');
      setEstimatedStudyTime(day.estimatedStudyTime || 120);
      setDayType(day.dayType || 'learning');
      setModuleId(day.moduleId || '');
    } else {
      setDayNumber(1);
      setTitle('');
      setObjective('');
      setEstimatedStudyTime(120);
      setDayType('learning');
      setModuleId(defaultModuleId || (modules.length > 0 ? modules[0].id : ''));
    }
    setError(null);
  }, [day, isOpen, defaultModuleId, modules]);

  // Calculate projected scheduled date in Asia/Kolkata
  let calculatedScheduledDate = null;
  if (roadmapStartDate && dayNumber >= 1) {
    try {
      const base = new Date(roadmapStartDate);
      const scheduled = new Date(base);
      scheduled.setUTCDate(scheduled.getUTCDate() + (parseInt(dayNumber, 10) - 1));
      calculatedScheduledDate = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(scheduled);
    } catch {
      calculatedScheduledDate = null;
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Day title is required');
      return;
    }

    const num = parseInt(dayNumber, 10);
    if (num < 1 || num > roadmapDuration) {
      setError(`Day number must be between 1 and ${roadmapDuration}`);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload = {
        dayNumber: num,
        title: title.trim(),
        objective: objective.trim() || null,
        estimatedStudyTime: parseInt(estimatedStudyTime, 10) || 120,
        dayType,
        moduleId: moduleId || null,
      };

      if (day) {
        await dayService.updateDay(day.id, payload);
      } else {
        await roadmapService.createDay(roadmapId, payload);
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save roadmap day');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={day ? `Edit Day ${day.dayNumber}` : 'Add Roadmap Day'}
      maxWidth="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={loading}
          >
            {day ? 'Save Day' : 'Add Day'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-lg text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-1">
              Day Number *
            </label>
            <input
              type="number"
              min={1}
              max={roadmapDuration}
              required
              value={dayNumber}
              onChange={(e) => setDayNumber(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-[#222831] border border-[#D4D4CA] dark:border-[#4F5561] rounded-lg text-sm text-[#202A23] dark:text-[#DFD0B8] focus:outline-none focus:ring-2 focus:ring-[#244C3B] dark:focus:ring-[#DFD0B8] font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-1">
              Day Type
            </label>
            <select
              value={dayType}
              onChange={(e) => setDayType(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-[#222831] border border-[#D4D4CA] dark:border-[#4F5561] rounded-lg text-sm text-[#202A23] dark:text-[#DFD0B8] focus:outline-none focus:ring-2 focus:ring-[#244C3B] dark:focus:ring-[#DFD0B8] capitalize"
            >
              <option value="learning">Learning</option>
              <option value="practice">Practice</option>
              <option value="revision">Revision</option>
              <option value="project">Project</option>
              <option value="assessment">Assessment</option>
            </select>
          </div>
        </div>

        {/* Live Projected Date */}
        {calculatedScheduledDate && (
          <div className="p-2.5 rounded-lg bg-[#E8F0EB] dark:bg-[#393E46] border border-[#C5D9CB] dark:border-[#4F5561] text-xs text-[#244C3B] dark:text-[#DFD0B8] flex items-center justify-between font-mono">
            <span>Scheduled Date (Asia/Kolkata):</span>
            <span className="font-bold">{calculatedScheduledDate}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-1">
            Day Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. JVM Memory Architecture & Stack vs Heap"
            className="w-full px-3 py-2 bg-white dark:bg-[#222831] border border-[#D4D4CA] dark:border-[#4F5561] rounded-lg text-sm text-[#202A23] dark:text-[#DFD0B8] focus:outline-none focus:ring-2 focus:ring-[#244C3B] dark:focus:ring-[#DFD0B8]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-1">
            Learning Objective
          </label>
          <textarea
            rows={2}
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="What will be mastered, implemented, or tested today..."
            className="w-full px-3 py-2 bg-white dark:bg-[#222831] border border-[#D4D4CA] dark:border-[#4F5561] rounded-lg text-sm text-[#202A23] dark:text-[#DFD0B8] focus:outline-none focus:ring-2 focus:ring-[#244C3B] dark:focus:ring-[#DFD0B8]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-1">
              Estimated Study Time (m)
            </label>
            <input
              type="number"
              min={15}
              step={15}
              value={estimatedStudyTime}
              onChange={(e) => setEstimatedStudyTime(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-[#222831] border border-[#D4D4CA] dark:border-[#4F5561] rounded-lg text-sm text-[#202A23] dark:text-[#DFD0B8] focus:outline-none focus:ring-2 focus:ring-[#244C3B] dark:focus:ring-[#DFD0B8] font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-1">
              Assign to Module
            </label>
            <select
              value={moduleId}
              onChange={(e) => setModuleId(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-[#222831] border border-[#D4D4CA] dark:border-[#4F5561] rounded-lg text-sm text-[#202A23] dark:text-[#DFD0B8] focus:outline-none focus:ring-2 focus:ring-[#244C3B] dark:focus:ring-[#DFD0B8]"
            >
              <option value="">-- No Module (Standalone) --</option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title} (Days {m.startingDay}–{m.endingDay})
                </option>
              ))}
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
}
