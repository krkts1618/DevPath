import { RoadmapService } from '../services/roadmap.service.js';
import { LifecycleService } from '../services/lifecycle.service.js';
import { successResponse, paginatedResponse } from '../utils/response.util.js';

export const RoadmapController = {
  async getAll(req, res, next) {
    try {
      const { total, roadmaps } = await RoadmapService.getAllRoadmaps(req.query);
      const page = parseInt(req.query.page || '1', 10);
      const limit = parseInt(req.query.limit || '50', 10);
      return paginatedResponse(res, roadmaps, { total, page, limit }, 'Roadmaps retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const roadmap = await RoadmapService.getRoadmapById(req.params.id);
      return successResponse(res, roadmap, 'Roadmap retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const roadmap = await RoadmapService.createRoadmap(req.body);
      return successResponse(res, roadmap, 'Roadmap created successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const roadmap = await RoadmapService.updateRoadmap(req.params.id, req.body);
      return successResponse(res, roadmap, 'Roadmap updated successfully');
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/roadmaps/:id
   * Default: archives roadmap to preserve learning history.
   * If query param ?permanent=true&confirm=true is passed, performs permanent transactional deletion.
   */
  async delete(req, res, next) {
    try {
      const permanent = req.query.permanent === 'true';
      const confirm = req.query.confirm === 'true';

      if (permanent) {
        await RoadmapService.permanentlyDeleteRoadmap(req.params.id, confirm);
        return successResponse(res, null, 'Roadmap permanently deleted successfully');
      }

      const archived = await RoadmapService.deleteRoadmap(req.params.id);
      return successResponse(res, archived, 'Roadmap archived successfully');
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/roadmaps/:id/restore
   */
  async restore(req, res, next) {
    try {
      const restored = await RoadmapService.restoreRoadmap(req.params.id);
      return successResponse(res, restored, 'Roadmap restored successfully');
    } catch (error) {
      next(error);
    }
  },

  async pause(req, res, next) {
    try {
      const { reason } = req.body;
      const result = await LifecycleService.pauseRoadmap(req.params.id, reason);
      return successResponse(res, result, 'Roadmap paused successfully');
    } catch (error) {
      next(error);
    }
  },

  async resume(req, res, next) {
    try {
      const result = await LifecycleService.resumeRoadmap(req.params.id);
      return successResponse(res, result, 'Roadmap resumed successfully');
    } catch (error) {
      next(error);
    }
  },

  async getPauseHistory(req, res, next) {
    try {
      const history = await LifecycleService.getRoadmapPauseHistory(req.params.id);
      return successResponse(res, history, 'Roadmap pause history retrieved successfully');
    } catch (error) {
      next(error);
    }
  },
};
