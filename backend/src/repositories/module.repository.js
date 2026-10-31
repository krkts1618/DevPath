import { prisma } from '../config/db.js';

export const ModuleRepository = {
  async findByRoadmapId(roadmapId) {
    return prisma.module.findMany({
      where: { roadmapId },
      orderBy: { displayOrder: 'asc' },
      include: {
        roadmapDays: {
          orderBy: { dayNumber: 'asc' },
          select: {
            id: true,
            dayNumber: true,
            title: true,
            dayType: true,
            estimatedStudyTime: true,
          },
        },
        _count: {
          select: { roadmapDays: true },
        },
      },
    });
  },

  async findById(id) {
    return prisma.module.findUnique({
      where: { id },
      include: {
        roadmap: true,
        roadmapDays: {
          orderBy: { dayNumber: 'asc' },
        },
      },
    });
  },

  async create(data) {
    return prisma.module.create({
      data,
      include: {
        roadmap: {
          select: { id: true, title: true, duration: true },
        },
      },
    });
  },

  async update(id, data) {
    return prisma.module.update({
      where: { id },
      data,
    });
  },

  async delete(id) {
    return prisma.module.delete({
      where: { id },
    });
  },

  async reorder(items) {
    return prisma.$transaction(
      items.map((item) =>
        prisma.module.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        })
      )
    );
  },
};
