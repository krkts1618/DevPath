import { ModuleRepository } from '../repositories/module.repository.js';
import { RoadmapRepository } from '../repositories/roadmap.repository.js';
import { AppError } from '../middlewares/error.middleware.js';

export const ModuleService = {
  async getModulesByRoadmapId(roadmapId) {
    const roadmap = await RoadmapRepository.findById(roadmapId);
    if (!roadmap) {
      throw new AppError(`Roadmap with ID "${roadmapId}" not found`, 404);
    }
    return ModuleRepository.findByRoadmapId(roadmapId);
  },

  async getModuleById(id) {
    const moduleItem = await ModuleRepository.findById(id);
    if (!moduleItem) {
      throw new AppError('Module not found', 404);
    }
    return moduleItem;
  },

  async createModule(roadmapId, data) {
    const roadmap = await RoadmapRepository.findById(roadmapId);
    if (!roadmap) {
      throw new AppError(`Roadmap with ID "${roadmapId}" not found`, 404);
    }

    // Validate module day ranges against roadmap duration
    if (data.startingDay < 1) {
      throw new AppError(`startingDay must be at least 1 (got ${data.startingDay})`, 400);
    }
    if (data.endingDay > roadmap.duration) {
      throw new AppError(
        `endingDay (${data.endingDay}) exceeds roadmap duration (${roadmap.duration} days)`,
        400
      );
    }
    if (data.startingDay > data.endingDay) {
      throw new AppError(
        `startingDay (${data.startingDay}) cannot exceed endingDay (${data.endingDay})`,
        400
      );
    }

    return ModuleRepository.create({
      ...data,
      roadmapId,
    });
  },

  async updateModule(id, data) {
    const moduleItem = await this.getModuleById(id);
    const roadmap = moduleItem.roadmap;

    const startingDay = data.startingDay !== undefined ? data.startingDay : moduleItem.startingDay;
    const endingDay = data.endingDay !== undefined ? data.endingDay : moduleItem.endingDay;

    if (startingDay < 1) {
      throw new AppError(`startingDay must be at least 1`, 400);
    }
    if (endingDay > roadmap.duration) {
      throw new AppError(
        `endingDay (${endingDay}) exceeds roadmap duration (${roadmap.duration} days)`,
        400
      );
    }
    if (startingDay > endingDay) {
      throw new AppError(
        `startingDay (${startingDay}) cannot exceed endingDay (${endingDay})`,
        400
      );
    }

    return ModuleRepository.update(id, data);
  },

  async deleteModule(id) {
    await this.getModuleById(id);
    return ModuleRepository.delete(id);
  },

  async reorderModules(items) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new AppError('Items array is required for reordering', 400);
    }
    return ModuleRepository.reorder(items);
  },
};
