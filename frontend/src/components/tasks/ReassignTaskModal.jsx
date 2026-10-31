import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { taskService } from '../../services/taskService';

export default function ReassignTaskModal({
  isOpen,
  onClose,
  task,
  availableDays = [],
  onSuccess,
}) {
  const [newRoadmapDayId, setNewRoadmapDayId] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!task) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newRoadmapDayId) {
      setError('Please select a target roadmap day');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await taskService.reassignTask(task.id, newRoadmapDayId, reason.trim() || null);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to reassign task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reschedule / Reassign Task"
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
            Reassign Task
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

        <div>
          <span className="block text-xs font-semibold text-[#737C74] dark:text-[#948979] uppercase tracking-wider mb-1">
            Current Task
          </span>
          <p className="text-sm font-medium text-[#202A23] dark:text-[#DFD0B8]">
            {task.title}
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-1">
            Target Roadmap Day *
          </label>
          <select
            required
            value={newRoadmapDayId}
            onChange={(e) => setNewRoadmapDayId(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-[#222831] border border-[#D4D4CA] dark:border-[#4F5561] rounded-lg text-sm text-[#202A23] dark:text-[#DFD0B8] focus:outline-none focus:ring-2 focus:ring-[#244C3B] dark:focus:ring-[#DFD0B8]"
          >
            <option value="">-- Select Target Day --</option>
            {availableDays.map((d) => (
              <option key={d.id} value={d.id}>
                Day {d.dayNumber}: {d.title} ({d.dayType})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-1">
            Reason for Rescheduling
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Needed extra time to complete Spring Security JWT assignment..."
            className="w-full px-3 py-2 bg-white dark:bg-[#222831] border border-[#D4D4CA] dark:border-[#4F5561] rounded-lg text-sm text-[#202A23] dark:text-[#DFD0B8] placeholder-[#737C74] dark:placeholder-[#948979] focus:outline-none focus:ring-2 focus:ring-[#244C3B] dark:focus:ring-[#DFD0B8]"
          />
        </div>
      </form>
    </Modal>
  );
}
