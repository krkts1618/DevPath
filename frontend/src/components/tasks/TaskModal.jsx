import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { dayService } from '../../services/dayService';
import { taskService } from '../../services/taskService';

export default function TaskModal({
  isOpen,
  onClose,
  dayId,
  task = null,
  onSuccess,
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskType, setTaskType] = useState('learn');
  const [estimatedDuration, setEstimatedDuration] = useState(30);
  const [isRequired, setIsRequired] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setTaskType(task.taskType || 'learn');
      setEstimatedDuration(task.estimatedDuration || 30);
      setIsRequired(task.isRequired !== undefined ? task.isRequired : true);
      setDisplayOrder(task.displayOrder || 1);
    } else {
      setTitle('');
      setDescription('');
      setTaskType('learn');
      setEstimatedDuration(30);
      setIsRequired(true);
      setDisplayOrder(1);
    }
    setError(null);
  }, [task, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        taskType,
        estimatedDuration: parseInt(estimatedDuration, 10) || 30,
        isRequired: !!isRequired,
        displayOrder: parseInt(displayOrder, 10) || 0,
      };

      if (task) {
        await taskService.updateTask(task.id, payload);
      } else {
        await dayService.createTask(dayId, payload);
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? 'Edit Task' : 'Add Learning Task'}
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
            {task ? 'Save Changes' : 'Create Task'}
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
            Task Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Implement thread-safe Singleton with double-checked locking"
            className="w-full px-3 py-2 bg-white dark:bg-[#222831] border border-[#D4D4CA] dark:border-[#4F5561] rounded-lg text-sm text-[#202620] dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] dark:focus:ring-[#F3F4F6]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#202620] dark:text-[#F3F4F6] mb-1">
            Instructions / Scope
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Implementation details, edge cases to verify, testing criteria..."
            className="w-full px-3 py-2 bg-white dark:bg-[#222831] border border-[#D4D4CA] dark:border-[#4F5561] rounded-lg text-sm text-[#202620] dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] dark:focus:ring-[#F3F4F6]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#202620] dark:text-[#F3F4F6] mb-1">
              Task Type
            </label>
            <select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-[#222831] border border-[#D4D4CA] dark:border-[#4F5561] rounded-lg text-sm text-[#202620] dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] dark:focus:ring-[#F3F4F6] capitalize"
            >
              <option value="learn">Learn</option>
              <option value="code">Code</option>
              <option value="practice">Practice</option>
              <option value="revise">Revise</option>
              <option value="project">Project</option>
              <option value="assessment">Assessment</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202620] dark:text-[#F3F4F6] mb-1">
              Duration (Minutes)
            </label>
            <input
              type="number"
              min={5}
              step={5}
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-[#222831] border border-[#D4D4CA] dark:border-[#4F5561] rounded-lg text-sm text-[#202620] dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] dark:focus:ring-[#F3F4F6] font-mono"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-[#202620] dark:text-[#F3F4F6] font-medium">
            <input
              type="checkbox"
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
              className="w-4 h-4 rounded accent-[var(--accent-primary)]"
            />
            <span>Required Task (Mandatory for day completion)</span>
          </label>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#858D82] dark:text-[#7F8996]">Order:</span>
            <input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              className="w-16 px-2 py-1 bg-white dark:bg-[#222831] border border-[#D4D4CA] dark:border-[#4F5561] rounded text-xs text-[#202620] dark:text-[#F3F4F6] font-mono"
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
