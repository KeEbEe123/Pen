import React, { useState } from 'react';
import Modal from './Modal';
import './ProjectManager.css';

const ProjectManager = ({ 
  projects, 
  currentProject, 
  onProjectSwitch, 
  onProjectCreate,
  onProjectUpdate,
  onProjectDelete
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const handleCreateProject = async () => {
    if (formData.name.trim()) {
      await onProjectCreate(formData.name.trim(), formData.description.trim());
      setFormData({ name: '', description: '' });
      setShowCreateModal(false);
    }
  };

  const handleEditProject = async () => {
    if (editingProject && formData.name.trim()) {
      await onProjectUpdate(editingProject.id, formData.name.trim(), formData.description.trim());
      setFormData({ name: '', description: '' });
      setEditingProject(null);
      setShowEditModal(false);
    }
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setFormData({ name: project.name, description: project.description || '' });
    setShowEditModal(true);
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project? All notes and bookmarks will be deleted.')) {
      await onProjectDelete(projectId);
    }
  };

  return (
    <div className="project-manager">
      <div className="project-list">
        {projects.map(project => (
          <div 
            key={project.id}
            className={`project-card ${currentProject?.id === project.id ? 'active' : ''}`}
          >
            <div 
              className="project-main"
              onClick={() => onProjectSwitch(project)}
            >
              <div className="project-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div className="project-details">
                <h4>{project.name}</h4>
                {project.description && <p>{project.description}</p>}
              </div>
            </div>
            <div className="project-actions">
              <button 
                className="action-btn"
                onClick={() => openEditModal(project)}
                title="Edit project"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              {projects.length > 1 && (
                <button 
                  className="action-btn delete-btn"
                  onClick={() => handleDeleteProject(project.id)}
                  title="Delete project"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="3,6 5,6 21,6"/>
                    <path d="M19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"/>
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <button 
        className="create-project-btn"
        onClick={() => setShowCreateModal(true)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        New Project
      </button>

      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setFormData({ name: '', description: '' });
        }}
        title="Create New Project"
        size="small"
      >
        <div className="project-form">
          <div className="form-group">
            <label>Project Name</label>
            <input
              type="text"
              placeholder="e.g., Climate Change Research"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Description (optional)</label>
            <textarea
              placeholder="What is this project about?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="form-actions">
            <button 
              className="btn-secondary"
              onClick={() => {
                setShowCreateModal(false);
                setFormData({ name: '', description: '' });
              }}
            >
              Cancel
            </button>
            <button 
              className="btn-primary"
              onClick={handleCreateProject}
              disabled={!formData.name.trim()}
            >
              Create Project
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingProject(null);
          setFormData({ name: '', description: '' });
        }}
        title="Edit Project"
        size="small"
      >
        <div className="project-form">
          <div className="form-group">
            <label>Project Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="form-actions">
            <button 
              className="btn-secondary"
              onClick={() => {
                setShowEditModal(false);
                setEditingProject(null);
                setFormData({ name: '', description: '' });
              }}
            >
              Cancel
            </button>
            <button 
              className="btn-primary"
              onClick={handleEditProject}
              disabled={!formData.name.trim()}
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectManager;
