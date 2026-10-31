import { CategoryService } from '../services/category.service.js';
import { successResponse } from '../utils/response.util.js';

export const CategoryController = {
  async getAll(req, res, next) {
    try {
      const categories = await CategoryService.getAllCategories(req.query);
      return successResponse(res, categories, 'Categories retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const category = await CategoryService.getCategoryById(req.params.id);
      return successResponse(res, category, 'Category retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const category = await CategoryService.createCategory(req.body);
      return successResponse(res, category, 'Category created successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const category = await CategoryService.updateCategory(req.params.id, req.body);
      return successResponse(res, category, 'Category updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async archive(req, res, next) {
    try {
      const { targetCategoryId } = req.body || {};
      const category = await CategoryService.archiveCategory(req.params.id, targetCategoryId);
      return successResponse(res, category, 'Category archived successfully');
    } catch (error) {
      next(error);
    }
  },

  async restore(req, res, next) {
    try {
      const category = await CategoryService.restoreCategory(req.params.id);
      return successResponse(res, category, 'Category restored successfully');
    } catch (error) {
      next(error);
    }
  },

  async reorder(req, res, next) {
    try {
      const { items } = req.body;
      const result = await CategoryService.reorderCategories(items);
      return successResponse(res, result, 'Categories reordered successfully');
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const cascade = req.query.cascade === 'true';
      const permanent = req.query.permanent === 'true';
      const result = await CategoryService.deleteCategory(req.params.id, cascade, permanent);
      return successResponse(
        res,
        result,
        permanent ? 'Category permanently deleted' : 'Category archived successfully'
      );
    } catch (error) {
      next(error);
    }
  },
};
