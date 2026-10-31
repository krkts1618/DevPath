import { RoadmapRepository } from '../repositories/roadmap.repository.js';
import { CategoryRepository } from '../repositories/category.repository.js';
import { AppError } from '../middlewares/error.middleware.js';
import { calculateScheduledDate } from '../utils/date.util.js';

export const RoadmapService = {
  async getAllRoadmaps(query = {}) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '50', 10);
    const categoryId = query.categoryId || undefined;
    const status = query.status || undefined;
    const search = query.search || query.q || undefined;
    const sortBy = query.sortBy || 'default';
    const summaryOnly = query.summaryOnly === 'true' || query.summaryOnly === true;

    return RoadmapRepository.findAll({ categoryId, status, search, sortBy, page, limit, summaryOnly });
  },

  async getRoadmapById(id) {
    const roadmap = await RoadmapRepository.findById(id);
    if (!roadmap) {
      throw new AppError('Roadmap not found', 404);
    }

    let currentLearningDayNumber = null;

    if (roadmap.roadmapDays) {
      // Find earliest non-completed day
      for (const day of roadmap.roadmapDays) {
        const dayTasks = day.tasks || [];
        let doneCount = 0;
        dayTasks.forEach((t) => {
          if (t.completions && t.completions.some((c) => c.completed)) {
            doneCount++;
          }
        });
        const isCompleted = dayTasks.length > 0 ? doneCount === dayTasks.length : true;
        if (!currentLearningDayNumber && !isCompleted && dayTasks.length > 0) {
          currentLearningDayNumber = day.dayNumber;
        }
      }

      if (!currentLearningDayNumber && roadmap.roadmapDays.length > 0) {
        currentLearningDayNumber = roadmap.roadmapDays[roadmap.roadmapDays.length - 1].dayNumber;
      }

      // Annotate days
      roadmap.roadmapDays = roadmap.roadmapDays.map((day) => {
        const dayTasks = day.tasks || [];
        let doneCount = 0;
        dayTasks.forEach((t) => {
          if (t.completions && t.completions.some((c) => c.completed)) {
            doneCount++;
          }
        });

        const isCompleted = dayTasks.length > 0 ? doneCount === dayTasks.length : true;
        let progressionStatus = 'upcoming';
        if (isCompleted) {
          progressionStatus = 'completed';
        } else if (day.dayNumber === currentLearningDayNumber) {
          progressionStatus = 'active';
        }

        return {
          ...day,
          totalTasksCount: dayTasks.length,
          completedTasksCount: doneCount,
          pendingTasksCount: dayTasks.length - doneCount,
          isDayCompleted: isCompleted,
          progressionStatus,
          scheduledDate: calculateScheduledDate(roadmap.startDate, day.dayNumber),
        };
      });
    }

    roadmap.currentLearningDayNumber = currentLearningDayNumber || 1;
    return roadmap;
  },

  async createRoadmap(data) {
    // 1. Verify category exists
    const category = await CategoryRepository.findById(data.categoryId);
    if (!category) {
      throw new AppError(`Category with ID "${data.categoryId}" does not exist`, 404);
    }

    // 2. Generate slug if missing
    const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const existingSlug = await RoadmapRepository.findBySlug(slug);
    if (existingSlug) {
      throw new AppError(`Roadmap with slug "${slug}" already exists`, 409);
    }

    return RoadmapRepository.create({
      ...data,
      slug,
      startDate: data.startDate ? new Date(data.startDate) : null,
    });
  },

  async updateRoadmap(id, data) {
    const existing = await this.getRoadmapById(id);

    if (data.categoryId && data.categoryId !== existing.categoryId) {
      const category = await CategoryRepository.findById(data.categoryId);
      if (!category) {
        throw new AppError(`Category with ID "${data.categoryId}" does not exist`, 404);
      }
    }

    if (data.slug && data.slug !== existing.slug) {
      const existingSlug = await RoadmapRepository.findBySlug(data.slug);
      if (existingSlug && existingSlug.id !== id) {
        throw new AppError(`Roadmap with slug "${data.slug}" already exists`, 409);
      }
    }

    const updatePayload = { ...data };
    if (data.startDate !== undefined) {
      updatePayload.startDate = data.startDate ? new Date(data.startDate) : null;
    }

    return RoadmapRepository.update(id, updatePayload);
  },

  /**
   * Default delete archives the roadmap to prevent data loss.
   */
  async deleteRoadmap(id) {
    const roadmap = await RoadmapRepository.findBasicById(id);
    if (!roadmap) {
      throw new AppError('Roadmap not found', 404);
    }
    return RoadmapRepository.archive(id);
  },

  /**
   * Restores an archived roadmap back to active status.
   */
  async restoreRoadmap(id) {
    const roadmap = await RoadmapRepository.findBasicById(id);
    if (!roadmap) {
      throw new AppError('Roadmap not found', 404);
    }
    if (roadmap.status !== 'archived') {
      throw new AppError(`Roadmap is currently ${roadmap.status}, not archived`, 400);
    }
    return RoadmapRepository.restore(id);
  },

  /**
   * Explicit permanent deletion service requiring confirmed flag.
   */
  async permanentlyDeleteRoadmap(id, confirm = false) {
    if (!confirm) {
      throw new AppError('Permanent deletion requires explicit confirmation: confirm=true', 400);
    }
    const roadmap = await RoadmapRepository.findBasicById(id);
    if (!roadmap) {
      throw new AppError('Roadmap not found', 404);
    }
    return RoadmapRepository.permanentDelete(id);
  },
};
