import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { roadmapService } from '../../services/roadmapService';

export default function AddRoadmapModal({
  isOpen,
  onClose,
  categories = [],
  onSuccess,
}) {
  const todayStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(30);
  const [targetDailyStudyTime, setTargetDailyStudyTime] = useState(60);
  const [startDate, setStartDate] = useState(todayStr);
  const [iconIdentifier, setIconIdentifier] = useState('code');
  const [themeIdentifier, setThemeIdentifier] = useState('green');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Roadmap title is required');
      return;
    }
    if (!categoryId) {
      setError('Please select a category');
      return;
    }
    if (duration < 1) {
      setError('Duration must be at least 1 day');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      await roadmapService.createRoadmap({
        categoryId,
        title: title.trim(),
        slug,
        description: description.trim() || null,
        duration: parseInt(duration, 10),
        targetDailyStudyTime: parseInt(targetDailyStudyTime, 10) || 60,
        startDate: startDate ? new Date(startDate) : null,
        iconIdentifier,
        themeIdentifier,
      });

      setTitle('');
      setDescription('');
      onSuccess?.();
    } catch (err) {
      setError(err.message || 'Failed to create roadmap');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Learning Roadmap"
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
            Create Roadmap
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

        {/* Category Selection */}
        <div>
          <label className="block text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-1">
            Category *
          </label>
          <select
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-[#222831] border border-[#D4D4CA] dark:border-[#4F5561] rounded-lg text-sm text-[#202A23] dark:text-[#DFD0B8] focus:outline-none focus:ring-2 focus:ring-[#244C3B] dark:focus:ring-[#DFD0B8]"
          >
            <option value="">-- Select a Category --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-1">
            Roadmap Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Distributed Systems & Microservices"
            className="w-full px-3 py-2 bg-white dark:bg-[#222831] border border-[#D4D4CA] dark:border-[#4F5561] rounded-lg text-sm text-[#202A23] dark:text-[#DFD0B8] placeholder-[#737C74] dark:placeholder-[#948979] focus:outline-none focus:ring-2 focus:ring-[#244C3B] dark:focus:ring-[#DFD0B8]"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-1">
            Description
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Key outcomes, technologies, and target proficiency..."
            className="w-full px-3 py-2 bg-white dark:bg-[#222831] border border-[#D4D4CA] dark:border-[#4F5561] rounded-lg text-sm text-[#202A23] dark:text-[#DFD0B8] placeholder-[#737C74] dark:placeholder-[#948979] focus:outline-none focus:ring-2 focus:ring-[#244C3B] dark:focus:ring-[#DFD0B8]"
          />
        </div>

        {/* Duration & Daily Target */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-1">
              Duration (Days) *
            </label>
            <input
              type="number"
              min={1}
              max={365}
              required
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-[#222831] border border-[#D4D4CA] dark:border-[#4F5561] rounded-lg text-sm text-[#202A23] dark:text-[#DFD0B8] focus:outline-none focus:ring-2 focus:ring-[#244C3B] dark:focus:ring-[#DFD0B8] font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-1">
              Daily Study Target (Minutes)
            </label>
            <input
              type="number"
              min={15}
              max={600}
              step={15}
              value={targetDailyStudyTime}
              onChange={(e) => setTargetDailyStudyTime(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-[#222831] border border-[#D4D4CA] dark:border-[#4F5561] rounded-lg text-sm text-[#202A23] dark:text-[#DFD0B8] focus:outline-none focus:ring-2 focus:ring-[#244C3B] dark:focus:ring-[#DFD0B8] font-mono"
            />
          </div>
        </div>

        {/* Start Date & Theme */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-1">
              Start Date (Asia/Kolkata)
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-[#222831] border border-[#D4D4CA] dark:border-[#4F5561] rounded-lg text-sm text-[#202A23] dark:text-[#DFD0B8] focus:outline-none focus:ring-2 focus:ring-[#244C3B] dark:focus:ring-[#DFD0B8] font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-1">
              Theme Accent
            </label>
            <select
              value={themeIdentifier}
              onChange={(e) => setThemeIdentifier(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-[#222831] border border-[#D4D4CA] dark:border-[#4F5561] rounded-lg text-sm text-[#202A23] dark:text-[#DFD0B8] focus:outline-none focus:ring-2 focus:ring-[#244C3B] dark:focus:ring-[#DFD0B8]"
            >
              <option value="green">Forest Green (Default)</option>
              <option value="emerald">Emerald</option>
              <option value="amber">Amber</option>
              <option value="rose">Rose</option>
              <option value="sky">Sky Blue</option>
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
}
