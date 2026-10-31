import { prisma } from '../config/db.js';

export const TaskRepository = {
  async findByDayId(roadmapDayId) {
    return prisma.task.findMany({
      where: { roadmapDayId },
      orderBy: { displayOrder: 'asc' },
      include: {
        completions: true,
        resources: true,
        reassignments: {
          orderBy: { reassignedAt: 'desc' },
          include: {
            originalDay: { select: { id: true, dayNumber: true, title: true } },
            newDay: { select: { id: true, dayNumber: true, title: true } },
          },
        },
      },
    });
  },

  async findById(id) {
    return prisma.task.findUnique({
      where: { id },
      include: {
        roadmapDay: {
          include: {
            roadmap: {
              select: { id: true, title: true, startDate: true },
            },
            module: {
              select: { id: true, title: true },
            },
          },
        },
        completions: true,
        resources: true,
        reassignments: {
          orderBy: { reassignedAt: 'desc' },
          include: {
            originalDay: { select: { id: true, dayNumber: true, title: true } },
            newDay: { select: { id: true, dayNumber: true, title: true } },
          },
        },
      },
    });
  },

  async create(data) {
    return prisma.task.create({
      data,
      include: {
        completions: true,
      },
    });
  },

  async update(id, data) {
    return prisma.task.update({
      where: { id },
      data,
      include: {
        completions: true,
        roadmapDay: true,
      },
    });
  },

  async delete(id) {
    return prisma.task.delete({
      where: { id },
    });
  },

  async reorder(items) {
    return prisma.$transaction(
      items.map((item) =>
        prisma.task.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        })
      )
    );
  },

  /**
   * Toggle task completion.
   * Upserts or updates the completion record.
   */
  async setCompletion(taskId, { completed, notes = null }) {
    const existing = await prisma.taskCompletion.findUnique({
      where: { taskId },
    });

    if (existing) {
      return prisma.taskCompletion.update({
        where: { taskId },
        data: {
          completed,
          completedAt: completed ? new Date() : existing.completedAt,
          notes: notes !== undefined ? notes : existing.notes,
        },
      });
    }

    return prisma.taskCompletion.create({
      data: {
        taskId,
        completed,
        completedAt: new Date(),
        notes,
      },
    });
  },

  /**
   * Reassign a task to a different roadmap day without duplicating the task.
   * Preserves audit log in `task_reassignments`.
   */
  async reassign(taskId, newRoadmapDayId, reason = null) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });
    if (!task) {
      throw new Error('Task not found');
    }

    const originalRoadmapDayId = task.roadmapDayId;

    // 1. Create reassignment record
    await prisma.taskReassignment.create({
      data: {
        taskId,
        originalRoadmapDayId,
        newRoadmapDayId,
        reason,
      },
    });

    // 2. Update task's day association
    return prisma.task.update({
      where: { id: taskId },
      data: {
        roadmapDayId: newRoadmapDayId,
      },
      include: {
        roadmapDay: true,
        reassignments: {
          include: {
            originalDay: true,
            newDay: true,
          },
        },
      },
    });
  },

  /**
   * Cancel the latest reassignment and revert task to original day
   */
  async cancelReassignment(taskId) {
    const latestReassignment = await prisma.taskReassignment.findFirst({
      where: { taskId },
      orderBy: { reassignedAt: 'desc' },
    });
    if (!latestReassignment) {
      throw new Error('No reassignment history found for this task');
    }

    await prisma.task.update({
      where: { id: taskId },
      data: { roadmapDayId: latestReassignment.originalRoadmapDayId },
    });

    await prisma.taskReassignment.delete({
      where: { id: latestReassignment.id },
    });

    return prisma.task.findUnique({
      where: { id: taskId },
      include: {
        roadmapDay: true,
        reassignments: true,
      },
    });
  },
};
