import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { CalendarDays, Home, Upload, LogIn, Calendar, Search, FileText, Settings, BookOpen } from 'lucide-react';
import { useRoutine } from '../lib/RoutineContext';

export function Layout() {
  const location = useLocation();
  const { settings } = useRoutine();

  return (
    <div className={`flex h-screen w-full font-sans overflow-hidden ${settings.darkMode ? 'bg-[#0f172a] text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
      {/* Sidebar */}
      <aside className={`w-64 border-r flex flex-col shrink-0 ${settings.darkMode ? 'bg-[#1e293b] border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="text-white font-bold text-xl">D</span>
            </div>
            <div className="leading-tight">
              <h1 className={`font-bold text-lg ${settings.darkMode ? 'text-white' : 'text-slate-900'}`}>DIU Routine</h1>
              <p className={`text-xs ${settings.darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Manager Pro</p>
            </div>
          </div>

          <nav className="space-y-1">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive || location.pathname === '/' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-medium' : settings.darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'}`
              }
            >
              <Home className="w-5 h-5" /> Dashboard
            </NavLink>
            <NavLink 
              to="/weekly" 
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-medium' : settings.darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'}`
              }
            >
              <CalendarDays className="w-5 h-5" /> Weekly Schedule
            </NavLink>
            <NavLink 
              to="/courses" 
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-medium' : settings.darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'}`
              }
            >
              <BookOpen className="w-5 h-5" /> My Courses
            </NavLink>
            <NavLink 
              to="/search" 
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-medium' : settings.darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'}`
              }
            >
              <Search className="w-5 h-5" /> Search Routine
            </NavLink>
            <NavLink 
              to="/pdf" 
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-medium' : settings.darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'}`
              }
            >
              <FileText className="w-5 h-5" /> PDF Archive
            </NavLink>
          </nav>
          
          <div className="mt-8 mb-4">
             <p className={`px-4 text-xs font-bold uppercase tracking-wider ${settings.darkMode ? 'text-slate-600' : 'text-slate-400'}`}>System</p>
          </div>
          <nav className="space-y-1">
            <NavLink 
              to="/settings" 
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-medium' : settings.darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'}`
              }
            >
              <Settings className="w-5 h-5" /> Settings
            </NavLink>
            <NavLink 
              to="/admin" 
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-medium' : settings.darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'}`
              }
            >
              <Upload className="w-5 h-5" /> Admin Panel
            </NavLink>
          </nav>
        </div>

        <div className="mt-auto p-6">
          <div className={`rounded-2xl p-4 border ${settings.darkMode ? 'bg-slate-700/30 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <p className={`text-xs mb-1 ${settings.darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Current Status</p>
            <p className={`text-sm font-medium ${settings.darkMode ? 'text-white' : 'text-slate-800'}`}>Student Mode</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className={`h-20 border-b flex items-center justify-between px-8 backdrop-blur-md sticky top-0 z-10 shrink-0 ${settings.darkMode ? 'border-slate-700/50 bg-[#0f172a]/80' : 'border-slate-200 bg-slate-50/80'}`}>
          <div>
            <h2 className={`text-xl font-bold ${settings.darkMode ? 'text-white' : 'text-slate-900'}`}>
              {location.pathname === '/' ? 'Dashboard' : 
               location.pathname === '/weekly' ? 'Weekly Schedule' : 
               location.pathname === '/courses' ? 'My Courses' :
               location.pathname === '/search' ? 'Search' :
               location.pathname === '/pdf' ? 'PDF Archive' :
               location.pathname === '/settings' ? 'Settings' :
               'Administration'}
            </h2>
            <p className={`text-sm ${settings.darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Spring 2026 • Daffodil International University
            </p>
          </div>
          <div className="flex gap-4">
             {/* Optional header actions can go here */}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
