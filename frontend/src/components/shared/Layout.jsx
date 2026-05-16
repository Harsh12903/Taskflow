import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  RiDashboardLine, RiFolderLine, RiTaskLine, RiLogoutBoxLine,
  RiMenuLine, RiCloseLine, RiUser3Line, RiFlashlightLine
} from 'react-icons/ri';

const NavItem = ({ to, icon: Icon, label, onClick }) => {
  if (onClick) {
    return (
      <button onClick={onClick} className="sidebar-item sidebar-item-inactive w-full text-left">
        <Icon size={18} />
        <span>{label}</span>
      </button>
    );
  }
  return (
    <NavLink to={to} className={({ isActive }) => `sidebar-item ${isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'}`}>
      <Icon size={18} />
      <span>{label}</span>
    </NavLink>
  );
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const avatar = user?.name?.charAt(0).toUpperCase() || 'U';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 flex items-center gap-3 border-b border-white/[0.06]">
        <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-600/30">
          <RiFlashlightLine size={18} className="text-white" />
        </div>
        <div>
          <div className="font-display font-800 text-white text-lg leading-none">TaskFlow</div>
          <div className="text-white/30 text-xs mt-0.5">Project Manager</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className="text-white/20 text-xs font-semibold uppercase tracking-widest px-3 mb-2">Menu</div>
        <NavItem to="/dashboard" icon={RiDashboardLine} label="Dashboard" />
        <NavItem to="/projects" icon={RiFolderLine} label="Projects" />
        <NavItem to="/my-tasks" icon={RiTaskLine} label="My Tasks" />
      </nav>

      {/* User */}
      <div className="p-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-1">
          <div className="w-8 h-8 rounded-lg bg-brand-600/30 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold text-sm">
            {avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white/90 truncate">{user?.name}</div>
            <div className="text-xs text-white/30 truncate">{user?.email}</div>
          </div>
        </div>
        <NavItem icon={RiLogoutBoxLine} label="Sign Out" onClick={handleLogout} />
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 flex-col bg-surface-900/60 border-r border-white/[0.06] backdrop-blur-xl flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-60 h-full bg-surface-900 border-r border-white/[0.06] flex flex-col">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-surface-900/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
              <RiFlashlightLine size={14} />
            </div>
            <span className="font-display font-700 text-white">TaskFlow</span>
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5">
            {mobileOpen ? <RiCloseLine size={20} /> : <RiMenuLine size={20} />}
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
