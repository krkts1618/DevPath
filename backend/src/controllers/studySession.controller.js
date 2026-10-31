import { StudySessionService } from '../services/studySession.service.js';
import { successResponse, errorResponse } from '../utils/response.util.js';

export const StudySessionController = {
  async start(req, res, next) {
    try {
      const session = await StudySessionService.startSession(req.body);
      return successResponse(res, session, 'Focus session started successfully', 201);
    } catch (error) {
      if (error.statusCode === 409) {
        return errorResponse(res, error.message, 409, { activeSession: error.activeSession });
      }
      next(error);
    }
  },

  async pause(req, res, next) {
    try {
      const session = await StudySessionService.pauseSession(req.params.id);
      return successResponse(res, session, 'Focus session paused');
    } catch (error) {
      next(error);
    }
  },

  async resume(req, res, next) {
    try {
      const session = await StudySessionService.resumeSession(req.params.id);
      return successResponse(res, session, 'Focus session resumed');
    } catch (error) {
      next(error);
    }
  },

  async complete(req, res, next) {
    try {
      const session = await StudySessionService.completeSession(req.params.id, req.body);
      return successResponse(res, session, 'Focus session completed successfully');
    } catch (error) {
      next(error);
    }
  },

  async interrupt(req, res, next) {
    try {
      const session = await StudySessionService.interruptSession(req.params.id, req.body);
      return successResponse(res, session, 'Focus session marked as interrupted');
    } catch (error) {
      next(error);
    }
  },

  async discard(req, res, next) {
    try {
      const session = await StudySessionService.discardSession(req.params.id);
      return successResponse(res, session, 'Focus session discarded');
    } catch (error) {
      next(error);
    }
  },

  async getActive(req, res, next) {
    try {
      const session = await StudySessionService.getActiveSession();
      return successResponse(res, session, 'Active focus session retrieved');
    } catch (error) {
      next(error);
    }
  },

  async resumeInterrupted(req, res, next) {
    try {
      const session = await StudySessionService.resumeInterruptedSession(req.params.id);
      return successResponse(res, session, 'Interrupted session resumed');
    } catch (error) {
      next(error);
    }
  },

  async getHistory(req, res, next) {
    try {
      const { page, limit, status, sessionType, roadmapId, taskId, projectId, startDate, endDate } = req.query;
      const history = await StudySessionService.getHistory(
        { status, sessionType, roadmapId, taskId, projectId, startDate, endDate },
        { page, limit }
      );
      return successResponse(res, history, 'Study session history retrieved');
    } catch (error) {
      next(error);
    }
  },

  async updateNotes(req, res, next) {
    try {
      const session = await StudySessionService.updateNotes(req.params.id, req.body.notes);
      return successResponse(res, session, 'Session notes updated');
    } catch (error) {
      next(error);
    }
  },

  async deleteSession(req, res, next) {
    try {
      const result = await StudySessionService.deleteSession(req.params.id);
      return successResponse(res, result, 'Session record deleted');
    } catch (error) {
      next(error);
    }
  },

  async getAnalytics(req, res, next) {
    try {
      const analytics = await StudySessionService.getAnalytics(req.query);
      return successResponse(res, analytics, 'Study analytics retrieved');
    } catch (error) {
      next(error);
    }
  },

  async getTasksFocus(req, res, next) {
    try {
      const taskIds = req.body?.taskIds || (req.query?.taskIds ? req.query.taskIds.split(',') : []);
      const result = await StudySessionService.getTasksFocusDuration(taskIds);
      return successResponse(res, result, 'Tasks focus duration retrieved');
    } catch (error) {
      next(error);
    }
  },
};
