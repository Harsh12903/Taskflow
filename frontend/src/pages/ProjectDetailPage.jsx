import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { format, isPast } from 'date-fns';
import {
  RiAddLine, RiArrowLeftLine, RiUserAddLine, RiDeleteBin6Line,
  RiEditLine, RiUser3Line, RiCalendarLine, RiFlag2Line, RiCloseLine
} from 'react-icons/ri';

const PRIORITY_STYLES = {
  Low: 'bg-emerald-500/10 text-emerald-400',
  Medium: 'bg-amber-500/10 text-amber-400',
  High: 'bg-orange-500/10 text-orange-400',
  Critical: 'bg-red-500/10 text-red-400',
};

const STATUS_STYLES = {
  'To Do': 'bg-slate-500/20 text-slate-400',
  'In Progress': 'bg-amber-500/20 text-amber-400',
  'Done': 'bg-emerald-500/20 text-emerald-400',
};

// Task Form Modal
const TaskModal = ({ task, project, onClose, onSaved }) => {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'To Do',
    priority: task?.priority || 'Medium',
    dueDate: task?.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
    assignedTo: task?.assignedTo?._id || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, project: project._id, assignedTo: form.assignedTo || null };
      const { data } = task
        ? await api.put(`/tasks/${task._id}`, payload)
        : await api.post('/tasks', payload);
      onSaved(data.task, !!task);
      toast.success(task ? 'Task updated!' : 'Task created!');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    } finally { setLoading(false); }
  };

  const members = project.members || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="card w-full max-w-lg p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-display font-700 text-white">{task ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/60"><RiCloseLine size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Title *</label>
            <input className="input" placeholder="Task title" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Description</label>
            <textarea className="input resize-none" rows={3} placeholder="Task details..."
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Status</label>
              <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                {['To Do', 'In Progress', 'Done'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Priority</label>
              <select className="input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                {['Low', 'Medium', 'High', 'Critical'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Due Date</label>
              <input type="date" className="input" value={form.dueDate}
                onChange={e => setForm({ ...form, dueDate: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Assign To</label>
              <select className="input" value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })}>
                <option value="">Unassigned</option>
                {members.map(m => <option key={m.user?._id} value={m.user?._id}>{m.user?.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Add Member Modal
const AddMemberModal = ({ project, onClose, onAdded }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Member');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post(`/projects/${project._id}/members`, { email, role });
      onAdded(data.project);
      toast.success('Member added!');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="card w-full max-w-sm p-6 animate-slide-up">
        <h2 className="text-lg font-display font-700 text-white mb-5">Add Team Member</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Email Address</label>
            <input type="email" className="input" placeholder="member@example.com" value={email}
              onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Role</label>
            <select className="input" value={role} onChange={e => setRole(e.target.value)}>
              <option value="Member">Member</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Task Card
const TaskCard = ({ task, isAdmin, currentUserId, onEdit, onDelete, onStatusChange }) => {
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'Done';
  const isAssignedToMe = task.assignedTo?._id === currentUserId;

  return (
    <div className={`card p-4 group transition-all duration-200 hover:border-white/[0.12] ${isOverdue ? 'border-red-500/20' : ''}`}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className={`text-sm font-medium leading-tight ${task.status === 'Done' ? 'line-through text-white/40' : 'text-white/90'}`}>
              {task.title}
            </h4>
            <div className="flex gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              {(isAdmin || isAssignedToMe) && (
                <button onClick={() => onEdit(task)} className="p-1 rounded-lg hover:bg-white/10 text-white/30 hover:text-white/70">
                  <RiEditLine size={14} />
                </button>
              )}
              {isAdmin && (
                <button onClick={() => onDelete(task._id)} className="p-1 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400">
                  <RiDeleteBin6Line size={14} />
                </button>
              )}
            </div>
          </div>

          {task.description && <p className="text-xs text-white/30 mb-3 line-clamp-2">{task.description}</p>}

          <div className="flex items-center gap-2 flex-wrap">
            <span className={`badge text-xs ${PRIORITY_STYLES[task.priority]}`}>{task.priority}</span>

            {isAdmin || isAssignedToMe ? (
              <select
                value={task.status}
                onChange={e => onStatusChange(task._id, e.target.value)}
                onClick={e => e.stopPropagation()}
                className={`badge text-xs cursor-pointer bg-transparent border-0 appearance-none ${STATUS_STYLES[task.status]} pr-0`}
              >
                {['To Do', 'In Progress', 'Done'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            ) : (
              <span className={`badge text-xs ${STATUS_STYLES[task.status]}`}>{task.status}</span>
            )}

            {task.dueDate && (
              <span className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-400' : 'text-white/30'}`}>
                <RiCalendarLine size={11} />
                {format(new Date(task.dueDate), 'MMM d')}
              </span>
            )}

            {task.assignedTo && (
              <span className="flex items-center gap-1 text-xs text-white/30">
                <RiUser3Line size={11} />
                {task.assignedTo.name}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks');
  const [filterStatus, setFilterStatus] = useState('All');

  const fetchData = async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/project/${id}`)
      ]);
      setProject(projRes.data.project);
      setTasks(taskRes.data.tasks);
    } catch (err) {
      toast.error('Failed to load project');
      navigate('/projects');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const currentMember = project?.members?.find(m => m.user?._id === user?._id);
  const isAdmin = currentMember?.role === 'Admin';

  const handleTaskSaved = (task, isEdit) => {
    if (isEdit) setTasks(prev => prev.map(t => t._id === task._id ? task : t));
    else setTasks(prev => [task, ...prev]);
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(prev => prev.filter(t => t._id !== taskId));
      toast.success('Task deleted');
    } catch (err) { toast.error('Failed to delete task'); }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      const { data } = await api.put(`/tasks/${taskId}`, { status });
      setTasks(prev => prev.map(t => t._id === taskId ? data.task : t));
    } catch (err) { toast.error('Failed to update status'); }
  };

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Remove this member?')) return;
    try {
      const { data } = await api.delete(`/projects/${id}/members/${memberId}`);
      setProject(data.project);
      toast.success('Member removed');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to remove member'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!project) return null;

  const filteredTasks = filterStatus === 'All' ? tasks : tasks.filter(t => t.status === filterStatus);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={() => navigate('/projects')} className="btn-secondary p-2.5 mt-1">
          <RiArrowLeftLine size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${project.color}20` }}>
              <span style={{ color: project.color }} className="text-xl">◈</span>
            </div>
            <div>
              <h1 className="text-xl font-display font-700 text-white">{project.name}</h1>
              <p className="text-white/40 text-sm">{project.description}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <>
              <button onClick={() => setShowMemberModal(true)} className="btn-secondary">
                <RiUserAddLine size={16} /> Add Member
              </button>
              <button onClick={() => { setEditingTask(null); setShowTaskModal(true); }} className="btn-primary">
                <RiAddLine size={18} /> Task
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/[0.03] p-1 rounded-xl w-fit border border-white/[0.06]">
        {['tasks', 'members'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === tab ? 'bg-brand-600 text-white' : 'text-white/40 hover:text-white/60'}`}>
            {tab} {tab === 'tasks' ? `(${tasks.length})` : `(${project.members?.length})`}
          </button>
        ))}
      </div>

      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {/* Status Filter */}
          <div className="flex gap-2">
            {['All', 'To Do', 'In Progress', 'Done'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterStatus === s ? 'bg-brand-600 text-white' : 'bg-white/5 text-white/40 hover:text-white/70'}`}>
                {s}
              </button>
            ))}
          </div>

          {filteredTasks.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-16">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-white/30 text-sm">No tasks yet</p>
              {isAdmin && <button onClick={() => setShowTaskModal(true)} className="btn-primary mt-4"><RiAddLine size={16} /> Create first task</button>}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredTasks.map(task => (
                <TaskCard key={task._id} task={task} isAdmin={isAdmin} currentUserId={user?._id}
                  onEdit={t => { setEditingTask(t); setShowTaskModal(true); }}
                  onDelete={handleDeleteTask} onStatusChange={handleStatusChange} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'members' && (
        <div className="space-y-3 max-w-xl">
          {project.members?.map(m => (
            <div key={m.user?._id} className="card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-600/20 flex items-center justify-center font-bold text-brand-400">
                {m.user?.name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white text-sm">{m.user?.name}</div>
                <div className="text-white/30 text-xs">{m.user?.email}</div>
              </div>
              <span className={`badge text-xs ${m.role === 'Admin' ? 'bg-brand-500/20 text-brand-300' : 'bg-white/10 text-white/50'}`}>
                {m.role}
              </span>
              {isAdmin && m.user?._id !== project.createdBy?._id && m.user?._id !== user?._id && (
                <button onClick={() => handleRemoveMember(m.user?._id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-colors">
                  <RiDeleteBin6Line size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showTaskModal && (
        <TaskModal task={editingTask} project={project}
          onClose={() => { setShowTaskModal(false); setEditingTask(null); }}
          onSaved={handleTaskSaved} />
      )}
      {showMemberModal && (
        <AddMemberModal project={project}
          onClose={() => setShowMemberModal(false)}
          onAdded={p => setProject(p)} />
      )}
    </div>
  );
}
