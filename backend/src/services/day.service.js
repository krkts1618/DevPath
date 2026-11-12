import { DayRepository } from '../repositories/day.repository.js';
import { RoadmapRepository } from '../repositories/roadmap.repository.js';
import { ModuleRepository } from '../repositories/module.repository.js';
import { AppError } from '../middlewares/error.middleware.js';
import { calculateScheduledDate } from '../utils/date.util.js';

export const DayService = {
  async getDaysByRoadmapId(roadmapId) {
    const roadmap = await RoadmapRepository.findBasicById(roadmapId);
    if (!roadmap) {
      throw new AppError(`Roadmap with ID "${roadmapId}" not found`, 404);
    }
    const days = await DayRepository.findByRoadmapId(roadmapId);
    return days.map((day) => ({
      ...day,
      scheduledDate: calculateScheduledDate(roadmap.startDate, day.dayNumber),
    }));
  },

  async getDayById(id) {
    const day = await DayRepository.findById(id);
    if (!day) {
      throw new AppError('Roadmap day not found', 404);
    }
    return {
      ...day,
      scheduledDate: calculateScheduledDate(day.roadmap?.startDate, day.dayNumber),
    };
  },

  async createDay(roadmapId, data) {
    const roadmap = await RoadmapRepository.findBasicById(roadmapId);
    if (!roadmap) {
      throw new AppError(`Roadmap with ID "${roadmapId}" not found`, 404);
    }

    // Validate day number within roadmap duration
    if (data.dayNumber < 1 || data.dayNumber > roadmap.duration) {
      throw new AppError(
        `dayNumber (${data.dayNumber}) must be between 1 and roadmap duration (${roadmap.duration})`,
        400
      );
    }

    // Prevent duplicate day_number
    const existingDay = await DayRepository.findByRoadmapAndDayNumber(roadmapId, data.dayNumber);
    if (existingDay) {
      throw new AppError(
        `Day number ${data.dayNumber} already exists in roadmap "${roadmap.title}"`,
        409
      );
    }

    // Validate moduleId if provided
    if (data.moduleId) {
      const moduleItem = await ModuleRepository.findById(data.moduleId);
      if (!moduleItem || moduleItem.roadmapId !== roadmapId) {
        throw new AppError(`Module with ID "${data.moduleId}" not found in this roadmap`, 400);
      }
    }

    return DayRepository.create({
      ...data,
      roadmapId,
    });
  },

  async updateDay(id, data) {
    const day = await this.getDayById(id);

    if (data.dayNumber && data.dayNumber !== day.dayNumber) {
      if (data.dayNumber < 1 || data.dayNumber > day.roadmap.duration) {
        throw new AppError(
          `dayNumber (${data.dayNumber}) must be between 1 and roadmap duration (${day.roadmap.duration})`,
          400
        );
      }
      const existing = await DayRepository.findByRoadmapAndDayNumber(day.roadmapId, data.dayNumber);
      if (existing && existing.id !== id) {
        throw new AppError(`Day number ${data.dayNumber} already exists in this roadmap`, 409);
      }
    }

    if (data.moduleId) {
      const moduleItem = await ModuleRepository.findById(data.moduleId);
      if (!moduleItem || moduleItem.roadmapId !== day.roadmapId) {
        throw new AppError(`Module with ID "${data.moduleId}" not found in this roadmap`, 400);
      }
    }

    return DayRepository.update(id, data);
  },

  async deleteDay(id) {
    await this.getDayById(id);
    return DayRepository.delete(id);
  },

  async reorderDays(items) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new AppError('Items array is required for reordering days', 400);
    }
    return DayRepository.reorder(items);
  },
};
