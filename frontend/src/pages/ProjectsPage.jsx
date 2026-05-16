import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { RiAddLine, RiFolderLine, RiMoreLine, RiCheckLine } from 'react-icons/ri';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#06b6d4', '#f59e0b', '#ef4444'];

const CreateProjectModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ name: '', description: '', color: COLORS[0] });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/projects', form);
      onCreated(data.project);
      toast.success('Project created!');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="card w-full max-w-md p-6 animate-slide-up">
        <h2 className="text-lg font-display font-700 text-white mb-5">New Project</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Project Name</label>
            <input className="input" placeholder="My Awesome Project" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Description</label>
            <textarea className="input resize-none" rows={3} placeholder="What's this project about?"
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform hover:scale-110"
                  style={{ background: c }}>
                  {form.color === c && <RiCheckLine size={14} className="text-white" />}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProjectCard = ({ project, currentUserId, onDelete }) => {
  const navigate = useNavigate();
  const member = project.members?.find(m => m.user?._id === currentUserId);
  const isAdmin = member?.role === 'Admin';
  const progress = project.taskCount > 0 ? Math.round((project.completedCount / project.taskCount) * 100) : 0;

  return (
    <div onClick={() => navigate(`/projects/${project._id}`)}
      className="card p-5 cursor-pointer hover:border-white/[0.12] transition-all duration-200 group hover:-translate-y-0.5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${project.color}20` }}>
            <RiFolderLine size={18} style={{ color: project.color }} />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm group-hover:text-brand-300 transition-colors">{project.name}</h3>
            <span className={`badge text-xs mt-0.5 ${isAdmin ? 'bg-brand-500/20 text-brand-300' : 'bg-white/10 text-white/50'}`}>
              {isAdmin ? 'Admin' : 'Member'}
            </span>
          </div>
        </div>
      </div>

      {project.description && (
        <p className="text-white/40 text-xs line-clamp-2 mb-4">{project.description}</p>
      )}

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-xs">
          <span className="text-white/30">Progress</span>
          <span className="text-white/50">{project.completedCount}/{project.taskCount} tasks</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: project.color }} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex -space-x-1.5">
          {project.members?.slice(0, 4).map((m, i) => (
            <div key={i} className="w-6 h-6 rounded-full bg-brand-600/30 border border-surface-900 flex items-center justify-center text-xs font-bold text-brand-400">
              {m.user?.name?.charAt(0)}
            </div>
          ))}
          {project.members?.length > 4 && (
            <div className="w-6 h-6 rounded-full bg-white/10 border border-surface-900 flex items-center justify-center text-xs text-white/40">
              +{project.members.length - 4}
            </div>
          )}
        </div>
        <span className="text-xs text-white/20">{new Date(project.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    api.get('/projects').then(r => setProjects(r.data.projects)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-700 text-white">Projects</h1>
          <p className="text-white/40 mt-1 text-sm">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <RiAddLine size={18} /> New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 bg-brand-600/10 rounded-2xl flex items-center justify-center mb-4">
            <RiFolderLine size={32} className="text-brand-500" />
          </div>
          <h2 className="text-white/60 font-medium mb-2">No projects yet</h2>
          <p className="text-white/30 text-sm mb-5">Create your first project to get started</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <RiAddLine size={18} /> Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(p => (
            <ProjectCard key={p._id} project={p} currentUserId={user?._id} />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateProjectModal
          onClose={() => setShowCreate(false)}
          onCreated={p => setProjects([p, ...projects])}
        />
      )}
    </div>
  );
}
