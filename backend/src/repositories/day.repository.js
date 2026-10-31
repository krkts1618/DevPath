import { prisma } from '../config/db.js';

export const DayRepository = {
  async findByRoadmapId(roadmapId) {
    return prisma.roadmapDay.findMany({
      where: { roadmapId },
      orderBy: { dayNumber: 'asc' },
      include: {
        module: {
          select: { id: true, title: true },
        },
        tasks: {
          orderBy: { displayOrder: 'asc' },
          include: {
            completions: true,
          },
        },
        _count: {
          select: { tasks: true },
        },
      },
    });
  },

  async findById(id) {
    return prisma.roadmapDay.findUnique({
      where: { id },
      include: {
        roadmap: {
          select: { id: true, title: true, startDate: true, duration: true },
        },
        module: true,
        tasks: {
          orderBy: { displayOrder: 'asc' },
          include: {
            completions: true,
            resources: true,
          },
        },
        dailyNotes: true,
      },
    });
  },

  async findByRoadmapAndDayNumber(roadmapId, dayNumber) {
    return prisma.roadmapDay.findUnique({
      where: {
        roadmapId_dayNumber: {
          roadmapId,
          dayNumber,
        },
      },
    });
  },

  async create(data) {
    return prisma.roadmapDay.create({
      data,
      include: {
        module: true,
      },
    });
  },

  async update(id, data) {
    return prisma.roadmapDay.update({
      where: { id },
      data,
      include: {
        module: true,
      },
    });
  },

  async delete(id) {
    return prisma.roadmapDay.delete({
      where: { id },
    });
  },

  async reorder(items) {
    return prisma.$transaction(
      items.map((item) =>
        prisma.roadmapDay.update({
          where: { id: item.id },
          data: { dayNumber: item.dayNumber },
        })
      )
    );
  },
};
