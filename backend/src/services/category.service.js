import { CategoryRepository } from '../repositories/category.repository.js';
import { AppError } from '../middlewares/error.middleware.js';

export const CategoryService = {
  async getAllCategories(query = {}) {
    const status = query.status || 'all';
    return CategoryRepository.findAll({ status });
  },

  async getCategoryById(id) {
    const category = await CategoryRepository.findById(id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }
    return category;
  },

  async createCategory(data) {
    if (!data.name || !data.name.trim()) {
      throw new AppError('Category name is required', 400);
    }

    const name = data.name.trim();
    const slug =
      data.slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    const existingName = await CategoryRepository.findByName(name);
    if (existingName) {
      throw new AppError(`Category with name "${name}" already exists`, 409);
    }

    const existingSlug = await CategoryRepository.findBySlug(slug);
    if (existingSlug) {
      throw new AppError(`Category with slug "${slug}" already exists`, 409);
    }

    return CategoryRepository.create({
      ...data,
      name,
      slug,
      displayOrder: data.displayOrder !== undefined ? parseInt(data.displayOrder, 10) : 0,
      status: data.status || 'active',
    });
  },

  async updateCategory(id, data) {
    await this.getCategoryById(id);

    if (data.name) {
      const trimmedName = data.name.trim();
      const existingName = await CategoryRepository.findByName(trimmedName);
      if (existingName && existingName.id !== id) {
        throw new AppError(`Category with name "${trimmedName}" already exists`, 409);
      }
      data.name = trimmedName;
    }

    if (data.slug) {
      const existingSlug = await CategoryRepository.findBySlug(data.slug);
      if (existingSlug && existingSlug.id !== id) {
        throw new AppError(`Category with slug "${data.slug}" already exists`, 409);
      }
    }

    if (data.displayOrder !== undefined) {
      data.displayOrder = parseInt(data.displayOrder, 10);
    }

    return CategoryRepository.update(id, data);
  },

  async archiveCategory(id, targetCategoryId = null) {
    const category = await this.getCategoryById(id);

    const roadmapsCount = category.roadmaps ? category.roadmaps.length : 0;
    if (roadmapsCount > 0 && !targetCategoryId) {
      throw new AppError(
        `Cannot archive category "${category.name}" because it contains ${roadmapsCount} active roadmap(s). Please select a target category to reassign them to.`,
        400,
        { roadmapsCount, requireReassignment: true }
      );
    }

    if (targetCategoryId) {
      if (targetCategoryId === id) {
        throw new AppError('Target category cannot be the same category being archived', 400);
      }
      const targetCat = await CategoryRepository.findById(targetCategoryId);
      if (!targetCat) {
        throw new AppError(`Target category with ID "${targetCategoryId}" does not exist`, 404);
      }
      if (targetCat.status === 'archived') {
        throw new AppError('Cannot reassign roadmaps to an archived category', 400);
      }
    }

    return CategoryRepository.archive(id, targetCategoryId);
  },

  async restoreCategory(id) {
    await this.getCategoryById(id);
    return CategoryRepository.restore(id);
  },

  async reorderCategories(items) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new AppError('Reorder items array is required', 400);
    }
    return CategoryRepository.reorder(items);
  },

  async deleteCategory(id, cascade = false, permanent = false) {
    const category = await this.getCategoryById(id);
    const roadmapsCount = category.roadmaps ? category.roadmaps.length : 0;

    // Default delete behavior archives records rather than permanently deleting them
    if (!permanent) {
      return this.archiveCategory(id);
    }

    if (roadmapsCount > 0) {
      if (!cascade) {
        throw new AppError(
          `Cannot permanently delete category "${category.name}" because it contains ${roadmapsCount} roadmap(s). Move them to another category or pass cascade=true explicitly.`,
          400,
          { roadmapsCount }
        );
      }
      return CategoryRepository.deleteWithCascade(id);
    }

    return CategoryRepository.delete(id);
  },
};
