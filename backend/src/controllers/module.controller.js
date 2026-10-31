import { ModuleService } from '../services/module.service.js';
import { successResponse } from '../utils/response.util.js';

export const ModuleController = {
  async getByRoadmapId(req, res, next) {
    try {
      const modules = await ModuleService.getModulesByRoadmapId(req.params.id);
      return successResponse(res, modules, 'Modules retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const moduleItem = await ModuleService.createModule(req.params.id, req.body);
      return successResponse(res, moduleItem, 'Module created successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const moduleItem = await ModuleService.updateModule(req.params.id, req.body);
      return successResponse(res, moduleItem, 'Module updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await ModuleService.deleteModule(req.params.id);
      return successResponse(res, null, 'Module deleted successfully');
    } catch (error) {
      next(error);
    }
  },

  async reorder(req, res, next) {
    try {
      const { items } = req.body;
      const result = await ModuleService.reorderModules(items);
      return successResponse(res, result, 'Modules reordered successfully');
    } catch (error) {
      next(error);
    }
  },
};
