import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { format, isPast } from 'date-fns';
import { RiTaskLine, RiCalendarLine, RiFlag2Line, RiFolderLine } from 'react-icons/ri';

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

export default function MyTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/tasks/my-tasks').then(r => setTasks(r.data.tasks)).finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (taskId, status) => {
    try {
      const { data } = await api.put(`/tasks/${taskId}`, { status });
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: data.task.status } : t));
      toast.success('Status updated');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update'); }
  };

  const filtered = filter === 'All' ? tasks : filter === 'Overdue'
    ? tasks.filter(t => t.dueDate && isPast(new Date(t.dueDate)) && t.status !== 'Done')
    : tasks.filter(t => t.status === filter);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-700 text-white">My Tasks</h1>
        <p className="text-white/40 mt-1 text-sm">{tasks.length} task{tasks.length !== 1 ? 's' : ''} assigned to you</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['All', 'To Do', 'In Progress', 'Done', 'Overdue'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? 'bg-brand-600 text-white' : 'bg-white/5 text-white/40 hover:text-white/70'}`}>
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 bg-brand-600/10 rounded-2xl flex items-center justify-center mb-4">
            <RiTaskLine size={32} className="text-brand-500" />
          </div>
          <h2 className="text-white/60 font-medium mb-1">No tasks here</h2>
          <p className="text-white/30 text-sm">
            {filter === 'All' ? 'You have no assigned tasks yet' : `No ${filter.toLowerCase()} tasks`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(task => {
            const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'Done';
            return (
              <div key={task._id} className={`card p-4 hover:border-white/[0.12] transition-all ${isOverdue ? 'border-red-500/20' : ''}`}>
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`font-medium text-sm ${task.status === 'Done' ? 'line-through text-white/40' : 'text-white/90'}`}>
                        {task.title}
                      </h3>
                      {isOverdue && <span className="badge text-xs bg-red-500/10 text-red-400">Overdue</span>}
                    </div>
                    {task.description && <p className="text-white/40 text-xs mb-3 line-clamp-2">{task.description}</p>}
                    <div className="flex items-center gap-3 flex-wrap">
                      <button onClick={() => navigate(`/projects/${task.project?._id}`)}
                        className="flex items-center gap-1 text-xs text-white/30 hover:text-brand-400 transition-colors">
                        <RiFolderLine size={11} />
                        {task.project?.name}
                      </button>
                      <span className={`badge text-xs ${PRIORITY_STYLES[task.priority]}`}>{task.priority}</span>
                      {task.dueDate && (
                        <span className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-400' : 'text-white/30'}`}>
                          <RiCalendarLine size={11} />
                          {format(new Date(task.dueDate), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                  <select
                    value={task.status}
                    onChange={e => handleStatusChange(task._id, e.target.value)}
                    className={`badge text-xs cursor-pointer bg-transparent border border-current/20 px-3 py-1.5 rounded-lg appearance-none ${STATUS_STYLES[task.status]}`}
                  >
                    {['To Do', 'In Progress', 'Done'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
