import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  RiFolderLine, RiTaskLine, RiTimeLine, RiCheckboxCircleLine,
  RiLoader4Line, RiAlertLine, RiUser3Line
} from 'react-icons/ri';
import { format } from 'date-fns';

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="card p-5 flex items-start gap-4">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon size={20} />
    </div>
    <div>
      <div className="text-2xl font-display font-700 text-white">{value}</div>
      <div className="text-white/40 text-xs mt-0.5">{label}</div>
      {sub && <div className="text-white/25 text-xs mt-1">{sub}</div>}
    </div>
  </div>
);

const priorityColors = { Low: '#10b981', Medium: '#f59e0b', High: '#f97316', Critical: '#ef4444' };
const statusColors = { 'To Do': '#94a3b8', 'In Progress': '#f59e0b', 'Done': '#10b981' };

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/dashboard').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const { stats, tasksPerUser, overdueTasks, recentTasks, statusBreakdown } = data || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-700 text-white">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-white/40 mt-1 text-sm">Here's what's happening with your projects</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={RiFolderLine} label="Total Projects" value={stats?.totalProjects || 0} color="bg-brand-600/20 text-brand-400" />
        <StatCard icon={RiTaskLine} label="Total Tasks" value={stats?.totalTasks || 0} color="bg-purple-500/20 text-purple-400" />
        <StatCard icon={RiCheckboxCircleLine} label="Completed" value={stats?.doneCount || 0} color="bg-emerald-500/20 text-emerald-400" />
        <StatCard icon={RiAlertLine} label="Overdue" value={stats?.overdueCount || 0} color="bg-red-500/20 text-red-400" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-5">Tasks by Status</h2>
          {stats?.totalTasks > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={statusBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" strokeWidth={0}>
                    {statusBreakdown?.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3 flex-1">
                {statusBreakdown?.map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                      <span className="text-sm text-white/60">{s.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-white">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-white/20 text-sm">No tasks yet</div>
          )}
        </div>

        {/* Tasks Per User */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-5">Tasks per Team Member</h2>
          {tasksPerUser?.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={tasksPerUser} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '12px' }} />
                <Bar dataKey="count" name="Total" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="done" name="Done" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex items-center justify-center text-white/20 text-sm">No assigned tasks</div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue Tasks */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-4">Overdue Tasks</h2>
          {overdueTasks?.length > 0 ? (
            <div className="space-y-3">
              {overdueTasks.map(task => (
                <div key={task._id} className="flex items-start gap-3 p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
                  <RiAlertLine size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white/90 truncate">{task.title}</div>
                    <div className="text-xs text-red-400 mt-0.5">Due {format(new Date(task.dueDate), 'MMM d, yyyy')}</div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${priorityColors[task.priority]}20`, color: priorityColors[task.priority] }}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-24 flex items-center justify-center">
              <div className="text-center">
                <RiCheckboxCircleLine size={28} className="text-emerald-500 mx-auto mb-1" />
                <p className="text-white/30 text-xs">No overdue tasks!</p>
              </div>
            </div>
          )}
        </div>

        {/* Recent Tasks */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-4">Recent Tasks</h2>
          {recentTasks?.length > 0 ? (
            <div className="space-y-3">
              {recentTasks.map(task => (
                <div key={task._id} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: statusColors[task.status] }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white/80 truncate">{task.title}</div>
                    <div className="text-xs text-white/30">{task.project?.name}</div>
                  </div>
                  <span className="text-xs text-white/30 flex-shrink-0">{task.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-24 flex items-center justify-center text-white/20 text-sm">No recent tasks</div>
          )}
        </div>
      </div>
    </div>
  );
}
