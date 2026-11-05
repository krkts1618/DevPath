import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { taskService } from '../../services/taskService';

export default function RescheduleMissedTaskModal({
  isOpen,
  onClose,
  task,
  onSuccess,
}) {
  const getTodayKolkata = () =>
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());

  const getTomorrowKolkata = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d);
  };

  const [targetOption, setTargetOption] = useState('today'); // 'today' | 'tomorrow' | 'custom'
  const [customDate, setCustomDate] = useState(getTodayKolkata);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!task) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    let finalDate = customDate;
    if (targetOption === 'today') finalDate = getTodayKolkata();
    else if (targetOption === 'tomorrow') finalDate = getTomorrowKolkata();

    setLoading(true);
    setError(null);
    try {
      await taskService.rescheduleToDate(
        task.id,
        finalDate,
        reason.trim() || `Rescheduled to ${finalDate}`
      );
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to reschedule task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reschedule Missed Task"
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
            Confirm Reschedule
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
          <span className="text-[10px] font-mono uppercase text-[#858D82] dark:text-[#7F8996] block mb-1">
            Task To Reschedule
          </span>
          <h4 className="text-sm font-bold text-[#202620] dark:text-[#F3F4F6]">
            {task.title}
          </h4>
          <span className="text-xs text-[#858D82] dark:text-[#7F8996] font-mono">
            {task.roadmapTitle} • Original Day {task.dayNumber}
          </span>
        </div>

        {/* Quick Target Options */}
        <div>
          <label className="block text-xs font-semibold text-[#202620] dark:text-[#F3F4F6] mb-2">
            Reschedule To:
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setTargetOption('today')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-colors cursor-pointer text-center ${
                targetOption === 'today'
                  ? 'bg-[#E8F0EB] border-[var(--accent-primary)] text-[var(--accent-primary)] dark:bg-[#303945] dark:border-[#F3F4F6] dark:text-[#F3F4F6]'
                  : 'bg-white dark:bg-[#222831] border-[#E4E7E0] dark:border-[#303945] text-[#596258] dark:text-[#B0B7C2]'
              }`}
            >
              Today
            </button>

            <button
              type="button"
              onClick={() => setTargetOption('tomorrow')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-colors cursor-pointer text-center ${
                targetOption === 'tomorrow'
                  ? 'bg-[#E8F0EB] border-[var(--accent-primary)] text-[var(--accent-primary)] dark:bg-[#303945] dark:border-[#F3F4F6] dark:text-[#F3F4F6]'
                  : 'bg-white dark:bg-[#222831] border-[#E4E7E0] dark:border-[#303945] text-[#596258] dark:text-[#B0B7C2]'
              }`}
            >
              Tomorrow
            </button>

            <button
              type="button"
              onClick={() => setTargetOption('custom')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-colors cursor-pointer text-center ${
                targetOption === 'custom'
                  ? 'bg-[#E8F0EB] border-[var(--accent-primary)] text-[var(--accent-primary)] dark:bg-[#303945] dark:border-[#F3F4F6] dark:text-[#F3F4F6]'
                  : 'bg-white dark:bg-[#222831] border-[#E4E7E0] dark:border-[#303945] text-[#596258] dark:text-[#B0B7C2]'
              }`}
            >
              Custom Date
            </button>
          </div>
        </div>

        {targetOption === 'custom' && (
          <div>
            <label className="block text-xs font-semibold text-[#202620] dark:text-[#F3F4F6] mb-1">
              Select Calendar Date (Asia/Kolkata) *
            </label>
            <input
              type="date"
              required
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-[#222831] border border-[#D4D4CA] dark:border-[#4F5561] rounded-lg text-xs text-[#202620] dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] dark:focus:ring-[#F3F4F6] font-mono"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-[#202620] dark:text-[#F3F4F6] mb-1">
            Reason for Rescheduling
          </label>
          <textarea
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Needed additional time on PostgreSQL index tuning assignment..."
            className="w-full px-3 py-2 bg-white dark:bg-[#222831] border border-[#D4D4CA] dark:border-[#4F5561] rounded-lg text-xs text-[#202620] dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] dark:focus:ring-[#F3F4F6]"
          />
        </div>
      </form>
    </Modal>
  );
}
