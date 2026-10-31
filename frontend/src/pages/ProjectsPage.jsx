import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderGit2,
  Plus,
  GitBranch,
  ExternalLink,
  Globe,
  FileCode,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Archive,
  RotateCcw,
  Trash2,
  Layers,
  Sparkles,
  Link as LinkIcon,
  CheckSquare,
  Square,
  Clock,
  BookOpen,
  Timer,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import StatCard from '../components/ui/StatCard';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import ConfirmationDialog from '../components/ui/ConfirmationDialog';
import { projectService } from '../services/projectService';
import { roadmapService } from '../services/roadmapService';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'active' | 'planned' | 'completed' | 'archived'

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [activeProjectDetail, setActiveProjectDetail] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    problemStatement: '',
    goals: '',
    techStack: '',
    githubUrl: '',
    demoUrl: '',
    documentationUrl: '',
    roadmapId: '',
    status: 'planned',
    priority: 'normal',
    targetDate: '',
    projectNotes: '',
  });

  // Milestone / Task / Resource addition inside Project Detail Modal
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('normal');
  const [newTaskMilestoneId, setNewTaskMilestoneId] = useState('');
  const [newResourceTitle, setNewResourceTitle] = useState('');
  const [newResourceUrl, setNewResourceUrl] = useState('');
  const [newResourceType, setNewResourceType] = useState('link');

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const params = activeTab === 'all' ? {} : { status: activeTab };
      const data = await projectService.getProjects(params);
      setProjects(data || []);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    async function loadRoadmaps() {
      try {
        const res = await roadmapService.getRoadmaps({ status: 'all' });
        setRoadmaps(res?.roadmaps || res || []);
      } catch (err) {
        console.error('Failed to load roadmaps:', err);
      }
    }
    loadRoadmaps();
  }, []);

  const refreshProjectDetail = async (id) => {
    try {
      const detailed = await projectService.getProjectById(id);
      setActiveProjectDetail(detailed);
      fetchProjects();
    } catch (err) {
      console.error('Error refreshing project:', err);
    }
  };

  const handleOpenCreate = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      description: '',
      problemStatement: '',
      goals: '',
      techStack: '',
      githubUrl: '',
      demoUrl: '',
      documentationUrl: '',
      roadmapId: '',
      status: 'planned',
      priority: 'normal',
      targetDate: '',
      projectNotes: '',
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name || '',
      description: project.description || '',
      problemStatement: project.problemStatement || '',
      goals: project.goals || '',
      techStack: project.techStack || '',
      githubUrl: project.githubUrl || '',
      demoUrl: project.demoUrl || '',
      documentationUrl: project.documentationUrl || '',
      roadmapId: project.roadmapId || '',
      status: project.status || 'planned',
      priority: project.priority || 'normal',
      targetDate: project.targetDate ? project.targetDate.substring(0, 10) : '',
      projectNotes: project.projectNotes || '',
    });
    setIsCreateModalOpen(true);
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      if (editingProject) {
        await projectService.updateProject(editingProject.id, formData);
      } else {
        await projectService.createProject(formData);
      }
      setIsCreateModalOpen(false);
      fetchProjects();
      if (activeProjectDetail?.id) {
        refreshProjectDetail(activeProjectDetail.id);
      }
    } catch (err) {
      console.error('Failed to save project:', err);
    }
  };

  const handleToggleArchive = async (project) => {
    try {
      const newStatus = project.status === 'archived' ? 'active' : 'archived';
      await projectService.updateProject(project.id, { status: newStatus });
      fetchProjects();
    } catch (err) {
      console.error('Failed to toggle archive:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    try {
      await projectService.deleteProject(projectToDelete.id);
      setProjectToDelete(null);
      if (activeProjectDetail?.id === projectToDelete.id) {
        setActiveProjectDetail(null);
      }
      fetchProjects();
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  // Milestone Actions
  const handleAddMilestone = async (e) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim() || !activeProjectDetail) return;
    try {
      await projectService.addMilestone(activeProjectDetail.id, {
        title: newMilestoneTitle.trim(),
        dueDate: newMilestoneDueDate || null,
      });
      setNewMilestoneTitle('');
      setNewMilestoneDueDate('');
      refreshProjectDetail(activeProjectDetail.id);
    } catch (err) {
      console.error('Add milestone error:', err);
    }
  };

  const handleToggleMilestone = async (milestoneId) => {
    try {
      await projectService.toggleMilestone(milestoneId);
      refreshProjectDetail(activeProjectDetail.id);
    } catch (err) {
      console.error('Toggle milestone error:', err);
    }
  };

  const handleDeleteMilestone = async (milestoneId) => {
    try {
      await projectService.deleteMilestone(milestoneId);
      refreshProjectDetail(activeProjectDetail.id);
    } catch (err) {
      console.error('Delete milestone error:', err);
    }
  };

  // Task Actions
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !activeProjectDetail) return;
    try {
      await projectService.addTask(activeProjectDetail.id, {
        title: newTaskTitle.trim(),
        priority: newTaskPriority,
        milestoneId: newTaskMilestoneId || null,
      });
      setNewTaskTitle('');
      refreshProjectDetail(activeProjectDetail.id);
    } catch (err) {
      console.error('Add task error:', err);
    }
  };

  const handleToggleTask = async (taskId) => {
    try {
      await projectService.toggleTask(taskId);
      refreshProjectDetail(activeProjectDetail.id);
    } catch (err) {
      console.error('Toggle task error:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await projectService.deleteTask(taskId);
      refreshProjectDetail(activeProjectDetail.id);
    } catch (err) {
      console.error('Delete task error:', err);
    }
  };

  // Resource Actions
  const handleAddResource = async (e) => {
    e.preventDefault();
    if (!newResourceTitle.trim() || !newResourceUrl.trim() || !activeProjectDetail) return;
    try {
      await projectService.addResource(activeProjectDetail.id, {
        title: newResourceTitle.trim(),
        url: newResourceUrl.trim(),
        resourceType: newResourceType,
      });
      setNewResourceTitle('');
      setNewResourceUrl('');
      refreshProjectDetail(activeProjectDetail.id);
    } catch (err) {
      console.error('Add resource error:', err);
    }
  };

  const handleDeleteResource = async (resourceId) => {
    try {
      await projectService.deleteResource(resourceId);
      refreshProjectDetail(activeProjectDetail.id);
    } catch (err) {
      console.error('Delete resource error:', err);
    }
  };

  // Stats
  const activeCount = projects.filter((p) => p.status === 'active').length;
  const completedCount = projects.filter((p) => p.status === 'completed').length;
  const plannedCount = projects.filter((p) => p.status === 'planned').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#202A23] dark:text-[#DFD0B8] flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-[#244C3B] dark:text-[#DFD0B8]" />
            Engineering Projects & Capstones
          </h2>
          <p className="text-xs text-[#737C74] dark:text-[#948979] mt-1">
            Build production-grade systems, benchmark architectures, and track milestones with weighted completion progress.
          </p>
        </div>

        <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenCreate}>
          New Project
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Active Projects"
          value={`${activeCount} In Progress`}
          subtitle="Currently building"
          icon={FolderGit2}
          color="emerald"
        />
        <StatCard
          title="Planned Capstones"
          value={`${plannedCount} Queued`}
          subtitle="Curriculum deliverables"
          icon={Calendar}
          color="amber"
        />
        <StatCard
          title="Completed"
          value={`${completedCount} Production Ready`}
          subtitle="Shipped and documented"
          icon={CheckCircle2}
          color="sky"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E8E8DF] dark:border-[#393E46] pb-3 overflow-x-auto text-xs">
        {[
          { id: 'all', label: `All (${projects.length})` },
          { id: 'active', label: `Active (${activeCount})` },
          { id: 'planned', label: `Planned (${plannedCount})` },
          { id: 'completed', label: `Completed (${completedCount})` },
          { id: 'archived', label: 'Archived' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#244C3B] text-white dark:bg-[#DFD0B8] dark:text-[#222831]'
                : 'text-[#737C74] dark:text-[#948979] hover:bg-[#EAEAE4] dark:hover:bg-[#393E46]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Project Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-56 rounded-xl bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] animate-pulse"
            />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-8">
          <EmptyState
            icon={FolderGit2}
            title={`No ${activeTab} projects found`}
            description="Create capstone projects and track your system engineering deliverables from design to deployment."
            action={
              <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenCreate}>
                Create Capstone Project
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] hover:border-[#244C3B] dark:hover:border-[#DFD0B8] rounded-xl p-5 shadow-xs transition flex flex-col justify-between"
            >
              <div>
                {/* Header: Priority & Status & Actions */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        project.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : project.status === 'active'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                          : project.status === 'archived'
                          ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {project.status}
                    </span>

                    {project.priority === 'urgent' && (
                      <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950/60 text-[10px] font-bold">
                        Urgent
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleArchive(project)}
                      title={project.status === 'archived' ? 'Restore' : 'Archive'}
                      className="p-1 rounded text-[#737C74] hover:text-[#202A23] dark:text-[#948979] dark:hover:text-[#DFD0B8]"
                    >
                      {project.status === 'archived' ? (
                        <RotateCcw className="w-3.5 h-3.5" />
                      ) : (
                        <Archive className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => setProjectToDelete(project)}
                      title="Delete project"
                      className="p-1 rounded text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Project Title */}
                <h3
                  onClick={() => refreshProjectDetail(project.id)}
                  className="font-bold text-base text-[#202A23] dark:text-[#DFD0B8] mb-1.5 hover:text-[#244C3B] dark:hover:text-white cursor-pointer line-clamp-1"
                >
                  {project.name}
                </h3>

                {/* Description */}
                <p className="text-xs text-[#737C74] dark:text-[#948979] line-clamp-2 mb-3 leading-relaxed">
                  {project.description || project.problemStatement || 'No description provided.'}
                </p>

                {/* Tech Stack Badges */}
                {project.techStack && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {project.techStack.split(',').slice(0, 4).map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-[#E8F0EB] text-[#244C3B] dark:bg-[#393E46] dark:text-[#DFD0B8] text-[10px] font-medium"
                      >
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Progress & Bottom Info */}
              <div className="space-y-3 pt-3 border-t border-[#E8E8DF] dark:border-[#393E46]/60">
                <div>
                  <div className="flex justify-between items-center text-xs mb-1 font-semibold text-[#202A23] dark:text-[#DFD0B8]">
                    <span>Weighted Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <ProgressBar progress={project.progress} />
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#737C74] dark:text-[#948979]">
                  <div className="flex items-center gap-2">
                    <span>
                      {project.stats?.completedMilestones || 0}/{project.stats?.totalMilestones || 0} Milestones
                    </span>
                    <span>•</span>
                    <span>
                      {project.stats?.completedTasks || 0}/{project.stats?.totalTasks || 0} Tasks
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#737C74] hover:text-[#202A23] dark:hover:text-white"
                        title="GitHub Repository"
                      >
                        <GitBranch className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {project.demoUrl && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#737C74] hover:text-[#202A23] dark:hover:text-white"
                        title="Live Demo"
                      >
                        <Globe className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => refreshProjectDetail(project.id)}
                >
                  Manage Milestones & Tasks
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Project Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={editingProject ? 'Edit Project Details' : 'Create Engineering Project'}
      >
        <form onSubmit={handleSaveProject} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-1">
              Project Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Distributed Key-Value Store with Raft"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full text-xs bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-lg px-3 py-2 text-[#202A23] dark:text-[#DFD0B8] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-1">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="High-level architecture and overview..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full text-xs bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-lg px-3 py-2 text-[#202A23] dark:text-[#DFD0B8] outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-1">
                Problem Statement
              </label>
              <textarea
                rows={2}
                placeholder="What core engineering challenge does this solve?"
                value={formData.problemStatement}
                onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
                className="w-full text-xs bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-lg px-3 py-2 text-[#202A23] dark:text-[#DFD0B8] outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-1">
                Learning Goals & Success Criteria
              </label>
              <textarea
                rows={2}
                placeholder="Benchmarks, test coverage targets, latency goals..."
                value={formData.goals}
                onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                className="w-full text-xs bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-lg px-3 py-2 text-[#202A23] dark:text-[#DFD0B8] outline-none resize-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-1">
              Tech Stack (Comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Go, gRPC, Docker, PostgreSQL, Redis"
              value={formData.techStack}
              onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
              className="w-full text-xs bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-lg px-3 py-2 text-[#202A23] dark:text-[#DFD0B8] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-1">
                GitHub Repository URL
              </label>
              <input
                type="url"
                placeholder="https://github.com/..."
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                className="w-full text-xs bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-lg px-3 py-2 text-[#202A23] dark:text-[#DFD0B8] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-1">
                Live Demo URL
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={formData.demoUrl}
                onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                className="w-full text-xs bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-lg px-3 py-2 text-[#202A23] dark:text-[#DFD0B8] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-1">
                Documentation URL
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={formData.documentationUrl}
                onChange={(e) => setFormData({ ...formData, documentationUrl: e.target.value })}
                className="w-full text-xs bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-lg px-3 py-2 text-[#202A23] dark:text-[#DFD0B8] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full text-xs bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-lg px-3 py-2 text-[#202A23] dark:text-[#DFD0B8] outline-none"
              >
                <option value="planned">Planned</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full text-xs bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-lg px-3 py-2 text-[#202A23] dark:text-[#DFD0B8] outline-none"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-1">
                Curriculum Link
              </label>
              <select
                value={formData.roadmapId}
                onChange={(e) => setFormData({ ...formData, roadmapId: e.target.value })}
                className="w-full text-xs bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-lg px-3 py-2 text-[#202A23] dark:text-[#DFD0B8] outline-none"
              >
                <option value="">Standalone Project</option>
                {roadmaps.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#E8E8DF] dark:border-[#393E46]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              {editingProject ? 'Update Project' : 'Create Project'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Detailed Project Workspace Modal */}
      <Modal
        isOpen={!!activeProjectDetail}
        onClose={() => setActiveProjectDetail(null)}
        title={activeProjectDetail?.name || 'Project Details'}
      >
        {activeProjectDetail && (
          <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
            {/* Overview & Progress Header */}
            <div className="p-4 rounded-xl bg-[#F7F7F2] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46]">
              <div className="flex items-center justify-between gap-4 mb-2">
                <div>
                  <h4 className="font-bold text-sm text-[#202A23] dark:text-[#DFD0B8]">
                    {activeProjectDetail.name}
                  </h4>
                  {activeProjectDetail.roadmap?.title && (
                    <span className="text-xs text-[#244C3B] dark:text-[#DFD0B8] font-medium flex items-center gap-1 mt-0.5">
                      <Layers className="w-3.5 h-3.5" />
                      {activeProjectDetail.roadmap.title}
                    </span>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleOpenEdit(activeProjectDetail);
                  }}
                >
                  Edit Details
                </Button>
              </div>

              {activeProjectDetail.problemStatement && (
                <div className="text-xs text-[#737C74] dark:text-[#948979] mt-2">
                  <span className="font-semibold text-[#202A23] dark:text-[#DFD0B8]">
                    Problem Statement:{' '}
                  </span>
                  {activeProjectDetail.problemStatement}
                </div>
              )}

              {/* Progress bar */}
              <div className="mt-3">
                <div className="flex justify-between items-center text-xs mb-1 font-semibold text-[#202A23] dark:text-[#DFD0B8]">
                  <span>Weighted Progress</span>
                  <span>{activeProjectDetail.progress}%</span>
                </div>
                <ProgressBar progress={activeProjectDetail.progress} />
              </div>
            </div>

            {/* Milestones Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#202A23] dark:text-[#DFD0B8] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#244C3B] dark:text-[#DFD0B8]" />
                  Milestones ({activeProjectDetail.milestones?.length || 0})
                </h4>
              </div>

              {/* Add Milestone Form */}
              <form onSubmit={handleAddMilestone} className="flex gap-2">
                <input
                  type="text"
                  placeholder="New milestone (e.g. M1: Database schema & migrations)..."
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  className="flex-1 text-xs bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-lg px-3 py-1.5 text-[#202A23] dark:text-[#DFD0B8] outline-none"
                />
                <Button type="submit" variant="primary" size="sm" disabled={!newMilestoneTitle.trim()}>
                  Add
                </Button>
              </form>

              {/* Milestones List */}
              <div className="space-y-2">
                {(activeProjectDetail.milestones || []).map((ms) => {
                  const isDone = ms.status === 'completed' || ms.completedAt;
                  return (
                    <div
                      key={ms.id}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-[#E8E8DF] dark:border-[#393E46] bg-[#FFFFFF] dark:bg-[#2A303A]"
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleMilestone(ms.id)}
                        className="flex items-center gap-2.5 text-left flex-1 min-w-0 cursor-pointer"
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100 dark:fill-emerald-950 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-[#737C74] dark:text-[#948979] shrink-0" />
                        )}
                        <span
                          className={`text-xs font-medium truncate ${
                            isDone
                              ? 'line-through text-[#737C74] dark:text-[#948979]'
                              : 'text-[#202A23] dark:text-[#DFD0B8]'
                          }`}
                        >
                          {ms.title}
                        </span>
                      </button>

                      <button
                        onClick={() => handleDeleteMilestone(ms.id)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Project Tasks Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#202A23] dark:text-[#DFD0B8] flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-[#244C3B] dark:text-[#DFD0B8]" />
                  Project Tasks ({activeProjectDetail.tasks?.length || 0})
                </h4>
              </div>

              {/* Add Task Form */}
              <form onSubmit={handleAddTask} className="flex gap-2">
                <input
                  type="text"
                  placeholder="New task (e.g. Implement Raft log compaction)..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="flex-1 text-xs bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-lg px-3 py-1.5 text-[#202A23] dark:text-[#DFD0B8] outline-none"
                />
                <Button type="submit" variant="primary" size="sm" disabled={!newTaskTitle.trim()}>
                  Add
                </Button>
              </form>

              {/* Tasks List */}
              <div className="space-y-2">
                {(activeProjectDetail.tasks || []).map((t) => {
                  const isDone = t.status === 'completed' || t.completedAt;
                  return (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-[#E8E8DF] dark:border-[#393E46] bg-[#FFFFFF] dark:bg-[#2A303A]"
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleTask(t.id)}
                        className="flex items-center gap-2.5 text-left flex-1 min-w-0 cursor-pointer"
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100 dark:fill-emerald-950 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-[#737C74] dark:text-[#948979] shrink-0" />
                        )}
                        <span
                          className={`text-xs font-medium truncate ${
                            isDone
                              ? 'line-through text-[#737C74] dark:text-[#948979]'
                              : 'text-[#202A23] dark:text-[#DFD0B8]'
                          }`}
                        >
                          {t.title}
                        </span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            navigate(
                              `/focus?projectId=${activeProjectDetail.id}&title=${encodeURIComponent(
                                `Project: ${t.title}`
                              )}`
                            )
                          }
                          title="Focus on this project task"
                          className="p-1 text-[#737C74] hover:text-[#202A23] dark:text-[#948979] dark:hover:text-[#DFD0B8]"
                        >
                          <Timer className="w-3.5 h-3.5 text-[#244C3B] dark:text-[#DFD0B8]" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(t.id)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Resources Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#202A23] dark:text-[#DFD0B8] flex items-center gap-1.5">
                <LinkIcon className="w-4 h-4 text-[#244C3B] dark:text-[#DFD0B8]" />
                Project Resources ({activeProjectDetail.resources?.length || 0})
              </h4>

              {/* Add Resource */}
              <form onSubmit={handleAddResource} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Resource title (e.g. Design Doc)"
                  value={newResourceTitle}
                  onChange={(e) => setNewResourceTitle(e.target.value)}
                  className="w-1/3 text-xs bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-lg px-3 py-1.5 text-[#202A23] dark:text-[#DFD0B8] outline-none"
                />
                <input
                  type="url"
                  placeholder="https://..."
                  value={newResourceUrl}
                  onChange={(e) => setNewResourceUrl(e.target.value)}
                  className="flex-1 text-xs bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-lg px-3 py-1.5 text-[#202A23] dark:text-[#DFD0B8] outline-none"
                />
                <Button type="submit" variant="primary" size="sm" disabled={!newResourceTitle || !newResourceUrl}>
                  Add
                </Button>
              </form>

              <div className="space-y-2">
                {(activeProjectDetail.resources || []).map((res) => (
                  <div
                    key={res.id}
                    className="flex items-center justify-between p-2 rounded-lg border border-[#E8E8DF] dark:border-[#393E46] text-xs"
                  >
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-[#244C3B] dark:text-[#DFD0B8] hover:underline flex items-center gap-1.5 truncate"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      {res.title}
                    </a>

                    <button
                      onClick={() => handleDeleteResource(res.id)}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Project"
        message={`Are you sure you want to permanently delete "${projectToDelete?.name}"? All associated milestones and tasks inside this project will be deleted, but your curriculum roadmaps and tasks will remain completely safe.`}
        confirmText="Delete Project"
        confirmVariant="danger"
      />
    </div>
  );
}
