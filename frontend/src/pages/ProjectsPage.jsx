import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FolderGit2,
  Plus,
  GitBranch,
  Globe,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  Trash2,
  Edit2,
  X,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ConfirmationDialog from '../components/ui/ConfirmationDialog';
import ProgressBar from '../components/ui/ProgressBar';
import { projectService } from '../services/projectService';
import { roadmapService } from '../services/roadmapService';

// Default banner visual styles for projects matching reference collage
const PROJECT_BANNERS = [
  'radial-gradient(ellipse at top left, #2E3846 0%, #171B21 100%)',
  'radial-gradient(ellipse at top right, #3B1C56 0%, #171B21 100%)',
  'radial-gradient(ellipse at bottom left, #1B382B 0%, #171B21 100%)',
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);

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
    roadmapId: '',
    status: 'planned',
  });

  // Milestone creation inside project detail
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const data = await projectService.getProjects();
      setProjects(data || []);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  }, []);

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
      roadmapId: '',
      status: 'planned',
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

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim() || !activeProjectDetail) return;
    try {
      await projectService.addMilestone(activeProjectDetail.id, {
        title: newMilestoneTitle.trim(),
      });
      setNewMilestoneTitle('');
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

  // Provide fallback sample projects matching reference image if live list is empty
  const displayProjects = useMemo(() => {
    if (projects && projects.length > 0) return projects;

    return [
      {
        id: 'ref-p1',
        name: 'DevPath',
        description: 'Personal learning tracker',
        techStack: 'React, Node.js',
        status: 'active', // In Progress
        githubUrl: 'https://github.com/krkts01/devpath',
        progress: 65,
      },
      {
        id: 'ref-p2',
        name: 'Portfolio Website',
        description: 'My developer portfolio.',
        techStack: 'Next.js, Tailwind',
        status: 'completed',
        githubUrl: 'https://github.com/krkts01/portfolio',
        progress: 100,
      },
      {
        id: 'ref-p3',
        name: 'E-commerce App',
        description: 'Full-stack e-commerce app.',
        techStack: 'MERN',
        status: 'planned', // Planning
        githubUrl: 'https://github.com/krkts01/ecommerce',
        progress: 15,
      },
    ];
  }, [projects]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Completed
          </span>
        );
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-[var(--accent-primary)] border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
            In Progress
          </span>
        );
      case 'planned':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
            Planning
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Add Project Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Projects
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
            Engineering capstones, deliverables, and production architectures
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--accent-primary)] text-[var(--accent-text)] text-xs font-semibold hover:bg-[var(--accent-hover)] transition shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add Project</span>
        </button>
      </div>

      {/* 2. Grid of Image-Led Project Cards Matching Reference Screen 7 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayProjects.map((project, idx) => {
          const bgGradient = PROJECT_BANNERS[idx % PROJECT_BANNERS.length];

          return (
            <div
              key={project.id}
              onClick={() => {
                if (!project.id.startsWith('ref-')) {
                  refreshProjectDetail(project.id);
                }
              }}
              className="group bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] rounded-2xl overflow-hidden shadow-xs transition flex flex-col justify-between cursor-pointer"
            >
              {/* Card Banner / Graphic Preview */}
              <div
                className="h-36 w-full flex items-center justify-center relative p-4 overflow-hidden border-b border-[var(--border-subtle)]"
                style={{ background: bgGradient }}
              >
                {/* Visual technical graphic */}
                <div className="w-4/5 h-20 rounded-lg bg-[var(--bg-card)]/80 border border-[var(--border-strong)] p-2.5 shadow-lg flex flex-col justify-between backdrop-blur-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-[9px] font-mono text-[var(--text-muted)] ml-2 truncate">
                      {project.name.toLowerCase()}.config.js
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="w-3/4 h-1.5 rounded-full bg-[var(--border-strong)]" />
                    <div className="w-1/2 h-1.5 rounded-full bg-[var(--accent-primary)]/40" />
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition">
                    {project.name}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2 leading-relaxed">
                    {project.description || 'Personal engineering deliverable.'}
                  </p>

                  {/* Tech stack badges */}
                  {project.techStack && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {project.techStack.split(',').map((tech, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded-md bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[10px] font-mono text-[var(--text-secondary)]"
                        >
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Footer: Status Pill on left, GitHub on right */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-[var(--border-subtle)]">
                  {getStatusBadge(project.status)}

                  <div className="flex items-center gap-2">
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition p-1"
                        title="GitHub Repository"
                      >
                        <GitBranch className="w-4 h-4" />
                      </a>
                    )}
                    {project.demoUrl && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition p-1"
                        title="Live Demo"
                      >
                        <Globe className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Project Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={editingProject ? 'Edit Project Details' : 'Create Engineering Project'}
      >
        <form onSubmit={handleSaveProject} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
              Project Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Distributed Key-Value Store with Raft"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full text-xs bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="High-level architecture and overview..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full text-xs bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[var(--text-primary)] outline-none resize-none focus:border-[var(--accent-primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
              Tech Stack (Comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. React, Node.js, PostgreSQL"
              value={formData.techStack}
              onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
              className="w-full text-xs bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                GitHub Repository URL
              </label>
              <input
                type="url"
                placeholder="https://github.com/..."
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                className="w-full text-xs bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[var(--text-primary)] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full text-xs bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[var(--text-primary)] outline-none"
              >
                <option value="planned">Planning</option>
                <option value="active">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-subtle)]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="amber" size="sm">
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
          <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
            <div className="p-4 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
              <h4 className="font-bold text-sm text-[var(--text-primary)]">
                {activeProjectDetail.name}
              </h4>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                {activeProjectDetail.description || 'No description provided.'}
              </p>
              <div className="mt-3">
                <div className="flex justify-between text-xs font-semibold text-[var(--text-primary)] mb-1">
                  <span>Progress</span>
                  <span>{activeProjectDetail.progress}%</span>
                </div>
                <ProgressBar progress={activeProjectDetail.progress} />
              </div>
            </div>

            {/* Milestones list */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                Milestones
              </h4>
              <form onSubmit={handleAddMilestone} className="flex gap-2">
                <input
                  type="text"
                  placeholder="New milestone..."
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  className="flex-1 text-xs bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-xl px-3 py-1.5 text-[var(--text-primary)] outline-none"
                />
                <Button type="submit" variant="amber" size="sm" disabled={!newMilestoneTitle.trim()}>
                  Add
                </Button>
              </form>

              <div className="space-y-2">
                {(activeProjectDetail.milestones || []).map((ms) => (
                  <div
                    key={ms.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]"
                  >
                    <span className="text-xs text-[var(--text-primary)] font-medium">
                      {ms.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleMilestone(ms.id)}
                      className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                        ms.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-[var(--bg-surface-elevated)] text-[var(--text-muted)]'
                      }`}
                    >
                      {ms.status === 'completed' ? 'Completed' : 'Mark Done'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Project"
        message={`Are you sure you want to delete "${projectToDelete?.name}"?`}
        confirmText="Delete Project"
        confirmVariant="danger"
      />
    </div>
  );
}
