import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { roadmapService } from '../../services/roadmapService';
import { moduleService } from '../../services/moduleService';

export default function ModuleModal({
  isOpen,
  onClose,
  roadmapId,
  roadmapDuration = 30,
  module = null,
  onSuccess,
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startingDay, setStartingDay] = useState(1);
  const [endingDay, setEndingDay] = useState(1);
  const [displayOrder, setDisplayOrder] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (module) {
      setTitle(module.title || '');
      setDescription(module.description || '');
      setStartingDay(module.startingDay || 1);
      setEndingDay(module.endingDay || 1);
      setDisplayOrder(module.displayOrder || 1);
    } else {
      setTitle('');
      setDescription('');
      setStartingDay(1);
      setEndingDay(Math.min(5, roadmapDuration));
      setDisplayOrder(1);
    }
    setError(null);
  }, [module, isOpen, roadmapDuration]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Module title is required');
      return;
    }

    const start = parseInt(startingDay, 10);
    const end = parseInt(endingDay, 10);

    if (start < 1) {
      setError('Starting day must be at least 1');
      return;
    }
    if (end > roadmapDuration) {
      setError(`Ending day cannot exceed roadmap duration (${roadmapDuration} days)`);
      return;
    }
    if (start > end) {
      setError('Starting day cannot exceed ending day');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        startingDay: start,
        endingDay: end,
        displayOrder: parseInt(displayOrder, 10) || 0,
      };

      if (module) {
        await moduleService.updateModule(module.id, payload);
      } else {
        await roadmapService.createModule(roadmapId, payload);
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save module');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={module ? 'Edit Module' : 'Create Curriculum Module'}
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
            {module ? 'Save Changes' : 'Create Module'}
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
          <label className="block text-xs font-semibold text-[#202620] dark:text-[#F3F4F6] mb-1">
            Module Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Core Java & OOP Principles"
            className="w-full px-3 py-2 bg-white dark:bg-[#222831] border border-[#D4D4CA] dark:border-[#4F5561] rounded-lg text-sm text-[#202620] dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] dark:focus:ring-[#F3F4F6]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#202620] dark:text-[#F3F4F6] mb-1">
            Description
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Key concepts, architecture patterns, and learning goals..."
            className="w-full px-3 py-2 bg-white dark:bg-[#222831] border border-[#D4D4CA] dark:border-[#4F5561] rounded-lg text-sm text-[#202620] dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] dark:focus:ring-[#F3F4F6]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#202620] dark:text-[#F3F4F6] mb-1">
              Starting Day *
            </label>
            <input
              type="number"
              min={1}
              max={roadmapDuration}
              required
              value={startingDay}
              onChange={(e) => setStartingDay(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-[#222831] border border-[#D4D4CA] dark:border-[#4F5561] rounded-lg text-sm text-[#202620] dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] dark:focus:ring-[#F3F4F6] font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202620] dark:text-[#F3F4F6] mb-1">
              Ending Day *
            </label>
            <input
              type="number"
              min={1}
              max={roadmapDuration}
              required
              value={endingDay}
              onChange={(e) => setEndingDay(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-[#222831] border border-[#D4D4CA] dark:border-[#4F5561] rounded-lg text-sm text-[#202620] dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] dark:focus:ring-[#F3F4F6] font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#202620] dark:text-[#F3F4F6] mb-1">
            Display Order
          </label>
          <input
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-[#222831] border border-[#D4D4CA] dark:border-[#4F5561] rounded-lg text-sm text-[#202620] dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] dark:focus:ring-[#F3F4F6] font-mono"
          />
        </div>
      </form>
    </Modal>
  );
}
