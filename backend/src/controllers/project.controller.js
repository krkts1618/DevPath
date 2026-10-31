import { ProjectService } from '../services/project.service.js';
import { successResponse } from '../utils/response.util.js';

export const ProjectController = {
  async getProjects(req, res, next) {
    try {
      const { status, search, roadmapId, priority, sort, order } = req.query;
      const projects = await ProjectService.getProjects({
        status,
        search,
        roadmapId,
        priority,
        sort,
        order,
      });
      return successResponse(res, projects, 'Projects retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const project = await ProjectService.getProjectById(req.params.id);
      return successResponse(res, project, 'Project retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const project = await ProjectService.createProject(req.body);
      return successResponse(res, project, 'Project created successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const project = await ProjectService.updateProject(req.params.id, req.body);
      return successResponse(res, project, 'Project updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const result = await ProjectService.deleteProject(req.params.id);
      return successResponse(res, result, 'Project deleted successfully');
    } catch (error) {
      next(error);
    }
  },

  // Milestones
  async addMilestone(req, res, next) {
    try {
      const milestone = await ProjectService.addMilestone(req.params.id, req.body);
      return successResponse(res, milestone, 'Milestone created successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async updateMilestone(req, res, next) {
    try {
      const milestone = await ProjectService.updateMilestone(req.params.milestoneId, req.body);
      return successResponse(res, milestone, 'Milestone updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async toggleMilestone(req, res, next) {
    try {
      const milestone = await ProjectService.toggleMilestone(req.params.milestoneId);
      return successResponse(res, milestone, 'Milestone toggled successfully');
    } catch (error) {
      next(error);
    }
  },

  async deleteMilestone(req, res, next) {
    try {
      const result = await ProjectService.deleteMilestone(req.params.milestoneId);
      return successResponse(res, result, 'Milestone deleted successfully');
    } catch (error) {
      next(error);
    }
  },

  // Project Tasks
  async addTask(req, res, next) {
    try {
      const task = await ProjectService.addProjectTask(req.params.id, req.body);
      return successResponse(res, task, 'Project task created successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async updateTask(req, res, next) {
    try {
      const task = await ProjectService.updateProjectTask(req.params.taskId, req.body);
      return successResponse(res, task, 'Project task updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async toggleTask(req, res, next) {
    try {
      const task = await ProjectService.toggleProjectTask(req.params.taskId);
      return successResponse(res, task, 'Project task toggled successfully');
    } catch (error) {
      next(error);
    }
  },

  async deleteTask(req, res, next) {
    try {
      const result = await ProjectService.deleteProjectTask(req.params.taskId);
      return successResponse(res, result, 'Project task deleted successfully');
    } catch (error) {
      next(error);
    }
  },

  // Resources
  async addResource(req, res, next) {
    try {
      const resource = await ProjectService.addResource(req.params.id, req.body);
      return successResponse(res, resource, 'Project resource added successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async deleteResource(req, res, next) {
    try {
      const result = await ProjectService.deleteResource(req.params.resourceId);
      return successResponse(res, result, 'Project resource deleted successfully');
    } catch (error) {
      next(error);
    }
  },
};
