import React, { useState, useEffect } from 'react';
import { Trash2, Archive, RotateCcw, AlertTriangle } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { roadmapService } from '../../services/roadmapService';

export default function EditRoadmapModal({
  isOpen,
  onClose,
  roadmap,
  categories = [],
  onSuccess,
  onArchive,
  onRestore,
  onDeletePermanent,
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [duration, setDuration] = useState(30);
  const [targetDailyStudyTime, setTargetDailyStudyTime] = useState(60);
  const [startDate, setStartDate] = useState('');
  const [status, setStatus] = useState('active');
  const [themeIdentifier, setThemeIdentifier] = useState('green');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (roadmap) {
      setTitle(roadmap.title || '');
      setDescription(roadmap.description || '');
      setCategoryId(roadmap.categoryId || roadmap.category?.id || '');
      setDuration(roadmap.duration || 30);
      setTargetDailyStudyTime(roadmap.targetDailyStudyTime || 60);
      setStatus(roadmap.status || 'active');
      setThemeIdentifier(roadmap.themeIdentifier || 'green');

      if (roadmap.startDate) {
        const d = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Asia/Kolkata',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(new Date(roadmap.startDate));
        setStartDate(d);
      } else {
        setStartDate('');
      }
    }
  }, [roadmap]);

  if (!roadmap) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title cannot be empty');
      return;
    }
    if (!categoryId) {
      setError('Please select a category');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await roadmapService.updateRoadmap(roadmap.id, {
        title: title.trim(),
        description: description.trim() || null,
        categoryId,
        duration: parseInt(duration, 10),
        targetDailyStudyTime: parseInt(targetDailyStudyTime, 10),
        startDate: startDate ? new Date(`${startDate}T00:00:00.000Z`) : null,
        status,
        themeIdentifier,
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update roadmap');
    } finally {
      setLoading(false);
    }
  };

  const isArchived = roadmap.status?.toLowerCase() === 'archived';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Roadmap Configuration"
      maxWidth="lg"
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
            Save Changes
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-lg text-xs text-rose-700 dark:text-rose-400">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-[#202620] dark:text-[#F3F4F6] mb-1">
            Category *
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-[#222831] border border-[#D4D4CA] dark:border-[#4F5561] rounded-lg text-sm text-[#202620] dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] dark:focus:ring-[#F3F4F6]"
            required
          >
            <option value="" disabled>
              Select category
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#202620] dark:text-[#F3F4F6] mb-1">
            Roadmap Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-[#222831] border border-[#D4D4CA] dark:border-[#4F5561] rounded-lg text-sm text-[#202620] dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] dark:focus:ring-[#F3F4F6]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#202620] dark:text-[#F3F4F6] mb-1">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-[#222831] border border-[#D4D4CA] dark:border-[#4F5561] rounded-lg text-sm text-[#202620] dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] dark:focus:ring-[#F3F4F6]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#202620] dark:text-[#F3F4F6] mb-1">
              Duration (Days) *
            </label>
            <input
              type="number"
              min={1}
              required
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-[#222831] border border-[#D4D4CA] dark:border-[#4F5561] rounded-lg text-sm text-[#202620] dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] dark:focus:ring-[#F3F4F6] font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202620] dark:text-[#F3F4F6] mb-1">
              Daily Target (Minutes)
            </label>
            <input
              type="number"
              min={15}
              step={15}
              value={targetDailyStudyTime}
              onChange={(e) => setTargetDailyStudyTime(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-[#222831] border border-[#D4D4CA] dark:border-[#4F5561] rounded-lg text-sm text-[#202620] dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] dark:focus:ring-[#F3F4F6] font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#202620] dark:text-[#F3F4F6] mb-1">
              Start Date (Asia/Kolkata)
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-[#222831] border border-[#D4D4CA] dark:border-[#4F5561] rounded-lg text-sm text-[#202620] dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] dark:focus:ring-[#F3F4F6] font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202620] dark:text-[#F3F4F6] mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-[#222831] border border-[#D4D4CA] dark:border-[#4F5561] rounded-lg text-sm text-[#202620] dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] dark:focus:ring-[#F3F4F6]"
            >
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202620] dark:text-[#F3F4F6] mb-1">
              Theme Accent
            </label>
            <select
              value={themeIdentifier}
              onChange={(e) => setThemeIdentifier(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-[#222831] border border-[#D4D4CA] dark:border-[#4F5561] rounded-lg text-sm text-[#202620] dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] dark:focus:ring-[#F3F4F6]"
            >
              <option value="green">Forest Green</option>
              <option value="emerald">Emerald</option>
              <option value="amber">Amber</option>
              <option value="rose">Rose</option>
              <option value="sky">Sky Blue</option>
            </select>
          </div>
        </div>

        {/* Danger Zone */}
        {(onDeletePermanent || onArchive || onRestore) && (
          <div className="pt-4 mt-6 border-t border-rose-200 dark:border-rose-900/60">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Danger Zone
            </h4>
            <div className="p-3 bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-rose-900 dark:text-rose-200">
                  {isArchived ? 'Permanently Delete Track' : 'Archive or Delete Track'}
                </p>
                <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5 leading-relaxed">
                  {isArchived
                    ? 'Irreversibly purge this roadmap and all its days, modules, and tasks from the database.'
                    : 'Archive hides this roadmap from daily views. Permanent delete removes all records completely.'}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {isArchived ? (
                  <>
                    {onRestore && (
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        icon={RotateCcw}
                        onClick={() => {
                          onClose();
                          onRestore(roadmap.id);
                        }}
                      >
                        Restore
                      </Button>
                    )}
                    {onDeletePermanent && (
                      <Button
                        type="button"
                        variant="danger"
                        size="xs"
                        icon={Trash2}
                        onClick={() => {
                          onClose();
                          onDeletePermanent(roadmap);
                        }}
                      >
                        Delete Permanently
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    {onArchive && (
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        icon={Archive}
                        className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-950/30"
                        onClick={() => {
                          onClose();
                          onArchive(roadmap.id);
                        }}
                      >
                        Archive
                      </Button>
                    )}
                    {onDeletePermanent && (
                      <Button
                        type="button"
                        variant="danger"
                        size="xs"
                        icon={Trash2}
                        onClick={() => {
                          onClose();
                          onDeletePermanent(roadmap);
                        }}
                      >
                        Delete Permanently
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}
