import { RevisionService } from '../services/revision.service.js';
import { successResponse } from '../utils/response.util.js';

export const RevisionController = {
  async getRevisions(req, res, next) {
    try {
      const { status, roadmapId, search, sort, order } = req.query;
      const revisions = await RevisionService.getRevisions({ status, roadmapId, search, sort, order });
      return successResponse(res, revisions, 'Revisions retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const revision = await RevisionService.getRevisionById(req.params.id);
      return successResponse(res, revision, 'Revision retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const revision = await RevisionService.createRevision(req.body);
      return successResponse(res, revision, 'Revision item created successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const revision = await RevisionService.updateRevision(req.params.id, req.body);
      return successResponse(res, revision, 'Revision item updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const result = await RevisionService.deleteRevision(req.params.id);
      return successResponse(res, result, 'Revision item deleted successfully');
    } catch (error) {
      next(error);
    }
  },

  async completeSession(req, res, next) {
    try {
      const { rating, notes, durationMinutes } = req.body;
      const result = await RevisionService.completeRevisionSession(req.params.id, {
        rating,
        notes,
        durationMinutes,
      });
      return successResponse(res, result, 'Revision session completed and rescheduled successfully');
    } catch (error) {
      next(error);
    }
  },

  async reschedule(req, res, next) {
    try {
      const { targetDate } = req.body;
      const revision = await RevisionService.rescheduleRevision(req.params.id, targetDate);
      return successResponse(res, revision, 'Revision rescheduled successfully');
    } catch (error) {
      next(error);
    }
  },

  async pause(req, res, next) {
    try {
      const revision = await RevisionService.pauseRevision(req.params.id);
      return successResponse(res, revision, 'Revision paused successfully');
    } catch (error) {
      next(error);
    }
  },

  async resume(req, res, next) {
    try {
      const revision = await RevisionService.resumeRevision(req.params.id);
      return successResponse(res, revision, 'Revision resumed successfully');
    } catch (error) {
      next(error);
    }
  },

  async getAnalytics(req, res, next) {
    try {
      const analytics = await RevisionService.getAnalytics();
      return successResponse(res, analytics, 'Revision analytics retrieved successfully');
    } catch (error) {
      next(error);
    }
  },
};
