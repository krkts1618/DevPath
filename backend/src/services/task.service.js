import { TaskRepository } from '../repositories/task.repository.js';
import { DayRepository } from '../repositories/day.repository.js';
import { RoadmapRepository } from '../repositories/roadmap.repository.js';
import { AppError } from '../middlewares/error.middleware.js';
import { calculateDayNumberForDate, calculateScheduledDate } from '../utils/date.util.js';

export const TaskService = {
  async getTasksByDayId(dayId) {
    const day = await DayRepository.findById(dayId);
    if (!day) {
      throw new AppError(`Roadmap day with ID "${dayId}" not found`, 404);
    }
    return TaskRepository.findByDayId(dayId);
  },

  async getTaskById(id) {
    const task = await TaskRepository.findById(id);
    if (!task) {
      throw new AppError('Task not found', 404);
    }
    return task;
  },

  async createTask(dayId, data) {
    const day = await DayRepository.findById(dayId);
    if (!day) {
      throw new AppError(`Roadmap day with ID "${dayId}" not found`, 404);
    }

    if (!data.title || !data.title.trim()) {
      throw new AppError('Task title is required', 400);
    }

    return TaskRepository.create({
      ...data,
      title: data.title.trim(),
      roadmapDayId: dayId,
      estimatedDuration: data.estimatedDuration ? parseInt(data.estimatedDuration, 10) : 30,
      displayOrder: data.displayOrder !== undefined ? parseInt(data.displayOrder, 10) : 0,
      isRequired: data.isRequired !== undefined ? !!data.isRequired : true,
      taskType: data.taskType || 'learn',
    });
  },

  async updateTask(id, data) {
    await this.getTaskById(id);
    if (data.title) {
      data.title = data.title.trim();
    }
    if (data.estimatedDuration !== undefined) {
      data.estimatedDuration = parseInt(data.estimatedDuration, 10);
    }
    if (data.displayOrder !== undefined) {
      data.displayOrder = parseInt(data.displayOrder, 10);
    }
    return TaskRepository.update(id, data);
  },

  async deleteTask(id) {
    await this.getTaskById(id);
    return TaskRepository.delete(id);
  },

  async reorderTasks(items) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new AppError('Items array is required for reordering tasks', 400);
    }
    return TaskRepository.reorder(items);
  },

  async toggleCompletion(id, { completed, notes = null }) {
    await this.getTaskById(id);
    return TaskRepository.setCompletion(id, { completed, notes });
  },

  async getTaskHistory(id) {
    const task = await this.getTaskById(id);
    return task;
  },

  async reassignTask(id, newRoadmapDayId, reason = null) {
    const task = await this.getTaskById(id);
    const targetDay = await DayRepository.findById(newRoadmapDayId);
    if (!targetDay) {
      throw new AppError(`Target roadmap day with ID "${newRoadmapDayId}" not found`, 404);
    }

    if (task.roadmapDayId === newRoadmapDayId) {
      throw new AppError('Task is already assigned to this day', 400);
    }

    return TaskRepository.reassign(id, newRoadmapDayId, reason);
  },

  /**
   * Reschedules a task to a calendar date (Asia/Kolkata)
   * Resolves target day in roadmap (or creates if day number exceeds existing)
   */
  async rescheduleToDate(id, targetDateStr, reason = null) {
    const task = await this.getTaskById(id);
    const roadmapId = task.roadmapDay?.roadmap?.id;
    const roadmap = await RoadmapRepository.findById(roadmapId);

    if (!roadmap) {
      throw new AppError('Parent roadmap not found', 404);
    }

    // Determine target day number for the target date
    const targetDayNumber = roadmap.startDate
      ? calculateDayNumberForDate(roadmap.startDate, targetDateStr)
      : task.roadmapDay.dayNumber;

    if (!targetDayNumber || targetDayNumber < 1) {
      throw new AppError(
        `Selected date ${targetDateStr} precedes roadmap start date`,
        400
      );
    }

    // Look for existing RoadmapDay for this dayNumber
    let targetDay = await DayRepository.findByRoadmapAndDayNumber(roadmapId, targetDayNumber);

    if (!targetDay) {
      // Create new RoadmapDay for this rescheduled day
      targetDay = await DayRepository.create({
        roadmapId,
        dayNumber: targetDayNumber,
        title: `Day ${targetDayNumber} (Rescheduled)`,
        objective: `Tasks rescheduled to ${targetDateStr}`,
        dayType: 'practice',
        estimatedStudyTime: task.estimatedDuration || 60,
      });
    }

    return TaskRepository.reassign(id, targetDay.id, reason || `Rescheduled to ${targetDateStr}`);
  },

  async cancelReassignment(id) {
    await this.getTaskById(id);
    return TaskRepository.cancelReassignment(id);
  },
};
