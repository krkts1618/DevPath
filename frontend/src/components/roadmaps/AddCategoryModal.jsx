import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { categoryService } from '../../services/categoryService';

export default function AddCategoryModal({ isOpen, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      await categoryService.createCategory({
        name: name.trim(),
        slug,
        description: description.trim() || null,
      });

      setName('');
      setDescription('');
      onSuccess?.();
    } catch (err) {
      setError(err.message || 'Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Roadmap Category"
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
            Create Category
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
            Category Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Distributed Systems & Cloud"
            className="w-full px-3 py-2 bg-white dark:bg-[#222831] border border-[#D4D4CA] dark:border-[#4F5561] rounded-lg text-sm text-[#202620] dark:text-[#F3F4F6] placeholder-[#858D82] dark:placeholder-[#7F8996] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] dark:focus:ring-[#F3F4F6]"
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
            placeholder="Brief scope or purpose for roadmaps grouped under this category..."
            className="w-full px-3 py-2 bg-white dark:bg-[#222831] border border-[#D4D4CA] dark:border-[#4F5561] rounded-lg text-sm text-[#202620] dark:text-[#F3F4F6] placeholder-[#858D82] dark:placeholder-[#7F8996] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] dark:focus:ring-[#F3F4F6]"
          />
        </div>
      </form>
    </Modal>
  );
}
