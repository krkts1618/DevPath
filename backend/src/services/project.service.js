import { prisma } from '../config/db.js';

/**
 * Calculate weighted progress for a project based on its milestones and tasks:
 * - Both exist: 50% milestone progress + 50% task progress
 * - Only milestones exist: 100% milestone progress
 * - Only tasks exist: 100% task progress
 * - Neither exist: 0%
 */
export function calculateProjectProgress(milestones = [], tasks = []) {
  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter(
    (m) => m.status === 'completed' || m.completedAt !== null
  ).length;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (t) => t.status === 'completed' || t.completedAt !== null
  ).length;

  const milestoneProgress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : null;
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : null;

  if (milestoneProgress !== null && taskProgress !== null) {
    return Math.round((milestoneProgress * 0.5) + (taskProgress * 0.5));
  } else if (milestoneProgress !== null) {
    return Math.round(milestoneProgress);
  } else if (taskProgress !== null) {
    return Math.round(taskProgress);
  }
  return 0;
}

export const ProjectService = {
  /**
   * Get all projects with filters and calculated progress
   */
  async getProjects(filters = {}) {
    const { status, search, roadmapId, priority, sort = 'updatedAt', order = 'desc' } = filters;

    const where = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (roadmapId) {
      where.roadmapId = roadmapId;
    }

    if (priority) {
      where.priority = priority;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { techStack: { contains: q, mode: 'insensitive' } },
        { problemStatement: { contains: q, mode: 'insensitive' } },
      ];
    }

    const sortField = ['name', 'createdAt', 'updatedAt', 'startDate', 'targetDate'].includes(sort)
      ? sort
      : 'updatedAt';
    const sortDirection = order?.toLowerCase() === 'asc' ? 'asc' : 'desc';

    const projects = await prisma.project.findMany({
      where,
      include: {
        roadmap: {
          select: {
            id: true,
            title: true,
            category: { select: { id: true, name: true } },
          },
        },
        milestones: {
          orderBy: { displayOrder: 'asc' },
        },
        tasks: {
          include: {
            curriculumTask: {
              select: { id: true, title: true, taskType: true },
            },
          },
        },
        resources: true,
      },
      orderBy: { [sortField]: sortDirection },
    });

    return projects.map((project) => {
      const progress = calculateProjectProgress(project.milestones, project.tasks);
      const totalMilestones = project.milestones.length;
      const completedMilestones = project.milestones.filter((m) => m.status === 'completed' || m.completedAt).length;
      const totalTasks = project.tasks.length;
      const completedTasks = project.tasks.filter((t) => t.status === 'completed' || t.completedAt).length;

      return {
        ...project,
        progress,
        stats: {
          totalMilestones,
          completedMilestones,
          totalTasks,
          completedTasks,
          resourceCount: project.resources.length,
        },
      };
    });
  },

  /**
   * Get single project by ID with full details
   */
  async getProjectById(id) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        roadmap: {
          select: {
            id: true,
            title: true,
            category: { select: { id: true, name: true } },
          },
        },
        milestones: {
          orderBy: { displayOrder: 'asc' },
          include: {
            tasks: {
              include: {
                curriculumTask: { select: { id: true, title: true, taskType: true } },
              },
            },
          },
        },
        tasks: {
          orderBy: { createdAt: 'asc' },
          include: {
            milestone: { select: { id: true, title: true } },
            curriculumTask: { select: { id: true, title: true, taskType: true } },
          },
        },
        resources: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const progress = calculateProjectProgress(project.milestones, project.tasks);
    const totalMilestones = project.milestones.length;
    const completedMilestones = project.milestones.filter((m) => m.status === 'completed' || m.completedAt).length;
    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter((t) => t.status === 'completed' || t.completedAt).length;

    return {
      ...project,
      progress,
      stats: {
        totalMilestones,
        completedMilestones,
        totalTasks,
        completedTasks,
        resourceCount: project.resources.length,
      },
    };
  },

  /**
   * Create a new project
   */
  async createProject(data) {
    const {
      name,
      description,
      problemStatement,
      goals,
      techStack,
      githubUrl,
      demoUrl,
      documentationUrl,
      roadmapId,
      status = 'planned',
      priority = 'normal',
      startDate,
      targetDate,
      projectNotes,
    } = data;

    if (!name || !name.trim()) {
      throw new Error('Project name is required');
    }

    return prisma.project.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        problemStatement: problemStatement?.trim() || null,
        goals: goals?.trim() || null,
        techStack: techStack ? (Array.isArray(techStack) ? techStack.join(', ') : techStack.trim()) : null,
        githubUrl: githubUrl?.trim() || null,
        demoUrl: demoUrl?.trim() || null,
        documentationUrl: documentationUrl?.trim() || null,
        roadmapId: roadmapId || null,
        status: status || 'planned',
        priority: priority || 'normal',
        startDate: startDate ? new Date(startDate) : null,
        targetDate: targetDate ? new Date(targetDate) : null,
        projectNotes: projectNotes?.trim() || null,
      },
      include: {
        roadmap: { select: { id: true, title: true } },
      },
    });
  },

  /**
   * Update an existing project
   */
  async updateProject(id, data) {
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Project not found');
    }

    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.description !== undefined) updateData.description = data.description?.trim() || null;
    if (data.problemStatement !== undefined) updateData.problemStatement = data.problemStatement?.trim() || null;
    if (data.goals !== undefined) updateData.goals = data.goals?.trim() || null;
    if (data.techStack !== undefined) {
      updateData.techStack = Array.isArray(data.techStack) ? data.techStack.join(', ') : data.techStack?.trim() || null;
    }
    if (data.githubUrl !== undefined) updateData.githubUrl = data.githubUrl?.trim() || null;
    if (data.demoUrl !== undefined) updateData.demoUrl = data.demoUrl?.trim() || null;
    if (data.documentationUrl !== undefined) updateData.documentationUrl = data.documentationUrl?.trim() || null;
    if (data.roadmapId !== undefined) updateData.roadmapId = data.roadmapId || null;
    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === 'completed' && !existing.endDate) {
        updateData.endDate = new Date();
      } else if (data.status !== 'completed') {
        updateData.endDate = null;
      }
    }
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null;
    if (data.targetDate !== undefined) updateData.targetDate = data.targetDate ? new Date(data.targetDate) : null;
    if (data.projectNotes !== undefined) updateData.projectNotes = data.projectNotes?.trim() || null;

    return prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        roadmap: { select: { id: true, title: true } },
        milestones: true,
        tasks: true,
        resources: true,
      },
    });
  },

  /**
   * Delete a project (safe delete; does NOT cascade to roadmap)
   */
  async deleteProject(id) {
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Project not found');
    }

    await prisma.project.delete({ where: { id } });
    return { success: true, message: 'Project deleted successfully' };
  },

  // =================== MILESTONES ===================

  async addMilestone(projectId, data) {
    const { title, description, dueDate, status = 'pending', displayOrder = 0 } = data;
    if (!title || !title.trim()) {
      throw new Error('Milestone title is required');
    }

    const isCompleted = status === 'completed';

    return prisma.projectMilestone.create({
      data: {
        projectId,
        title: title.trim(),
        description: description?.trim() || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: status || 'pending',
        displayOrder: Number(displayOrder) || 0,
        completedAt: isCompleted ? new Date() : null,
      },
    });
  },

  async updateMilestone(milestoneId, data) {
    const existing = await prisma.projectMilestone.findUnique({ where: { id: milestoneId } });
    if (!existing) {
      throw new Error('Milestone not found');
    }

    const updateData = {};
    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.description !== undefined) updateData.description = data.description?.trim() || null;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    if (data.displayOrder !== undefined) updateData.displayOrder = Number(data.displayOrder) || 0;
    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === 'completed' && !existing.completedAt) {
        updateData.completedAt = new Date();
      } else if (data.status !== 'completed') {
        updateData.completedAt = null;
      }
    }

    return prisma.projectMilestone.update({
      where: { id: milestoneId },
      data: updateData,
    });
  },

  async toggleMilestone(milestoneId) {
    const existing = await prisma.projectMilestone.findUnique({ where: { id: milestoneId } });
    if (!existing) {
      throw new Error('Milestone not found');
    }

    const willBeCompleted = existing.status !== 'completed';
    return prisma.projectMilestone.update({
      where: { id: milestoneId },
      data: {
        status: willBeCompleted ? 'completed' : 'pending',
        completedAt: willBeCompleted ? new Date() : null,
      },
    });
  },

  async deleteMilestone(milestoneId) {
    await prisma.projectMilestone.delete({ where: { id: milestoneId } });
    return { success: true };
  },

  // =================== PROJECT TASKS ===================

  async addProjectTask(projectId, data) {
    const {
      title,
      description,
      priority = 'normal',
      dueDate,
      estimatedDuration = 30,
      milestoneId = null,
      roadmapTaskId = null,
      status = 'todo',
    } = data;

    if (!title || !title.trim()) {
      throw new Error('Task title is required');
    }

    const isCompleted = status === 'completed';

    return prisma.projectTask.create({
      data: {
        projectId,
        title: title.trim(),
        description: description?.trim() || null,
        priority: priority || 'normal',
        dueDate: dueDate ? new Date(dueDate) : null,
        estimatedDuration: Number(estimatedDuration) || 30,
        milestoneId: milestoneId || null,
        roadmapTaskId: roadmapTaskId || null,
        status: status || 'todo',
        completedAt: isCompleted ? new Date() : null,
      },
      include: {
        milestone: { select: { id: true, title: true } },
        curriculumTask: { select: { id: true, title: true, taskType: true } },
      },
    });
  },

  async updateProjectTask(taskId, data) {
    const existing = await prisma.projectTask.findUnique({ where: { id: taskId } });
    if (!existing) {
      throw new Error('Project task not found');
    }

    const updateData = {};
    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.description !== undefined) updateData.description = data.description?.trim() || null;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    if (data.estimatedDuration !== undefined) updateData.estimatedDuration = Number(data.estimatedDuration) || 30;
    if (data.milestoneId !== undefined) updateData.milestoneId = data.milestoneId || null;
    if (data.roadmapTaskId !== undefined) updateData.roadmapTaskId = data.roadmapTaskId || null;
    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === 'completed' && !existing.completedAt) {
        updateData.completedAt = new Date();
      } else if (data.status !== 'completed') {
        updateData.completedAt = null;
      }
    }

    return prisma.projectTask.update({
      where: { id: taskId },
      data: updateData,
      include: {
        milestone: { select: { id: true, title: true } },
        curriculumTask: { select: { id: true, title: true, taskType: true } },
      },
    });
  },

  async toggleProjectTask(taskId) {
    const existing = await prisma.projectTask.findUnique({ where: { id: taskId } });
    if (!existing) {
      throw new Error('Project task not found');
    }

    const willBeCompleted = existing.status !== 'completed';
    return prisma.projectTask.update({
      where: { id: taskId },
      data: {
        status: willBeCompleted ? 'completed' : 'todo',
        completedAt: willBeCompleted ? new Date() : null,
      },
      include: {
        milestone: { select: { id: true, title: true } },
        curriculumTask: { select: { id: true, title: true, taskType: true } },
      },
    });
  },

  async deleteProjectTask(taskId) {
    await prisma.projectTask.delete({ where: { id: taskId } });
    return { success: true };
  },

  // =================== PROJECT RESOURCES ===================

  async addResource(projectId, data) {
    const { title, url, resourceType = 'link' } = data;
    if (!title || !title.trim()) throw new Error('Resource title is required');
    if (!url || !url.trim()) throw new Error('Resource URL is required');

    return prisma.projectResource.create({
      data: {
        projectId,
        title: title.trim(),
        url: url.trim(),
        resourceType: resourceType || 'link',
      },
    });
  },

  async deleteResource(resourceId) {
    await prisma.projectResource.delete({ where: { id: resourceId } });
    return { success: true };
  },
};
