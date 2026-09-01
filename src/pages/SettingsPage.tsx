import React from 'react';
import { useRoutine } from '../lib/RoutineContext';
import { Moon, Sun, Monitor, Trash2, Save } from 'lucide-react';
import { motion } from 'motion/react';

export function SettingsPage() {
  const { settings, updateSettings, routines, setSelectedRoutineId } = useRoutine();

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      updateSettings({
        darkMode: true,
        fontSize: 'medium',
        preferredDepartment: '',
        preferredSemester: '',
        preferredSection: ''
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className={`text-3xl font-bold tracking-tight mb-2 ${settings.darkMode ? 'text-white' : 'text-slate-900'}`}>Settings</h1>
        <p className={settings.darkMode ? 'text-slate-400' : 'text-slate-500'}>
          Customize your experience and manage preferences.
        </p>
      </div>

      <div className="space-y-6">
        {/* Appearance Settings */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-3xl border ${settings.darkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-xl ${settings.darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
              <Monitor className={`w-5 h-5 ${settings.darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
            </div>
            <h2 className={`text-xl font-bold ${settings.darkMode ? 'text-white' : 'text-slate-900'}`}>Appearance</h2>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className={`font-medium ${settings.darkMode ? 'text-white' : 'text-slate-900'}`}>Theme Mode</h3>
                <p className={`text-sm ${settings.darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Choose between light and dark themes.</p>
              </div>
              <div className={`flex p-1 rounded-xl w-full sm:w-auto ${settings.darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <button 
                  onClick={() => updateSettings({ darkMode: false })}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold transition-all ${!settings.darkMode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  <Sun className="w-4 h-4" /> Light
                </button>
                <button 
                  onClick={() => updateSettings({ darkMode: true })}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold transition-all ${settings.darkMode ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  <Moon className="w-4 h-4" /> Dark
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Preferences */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-6 rounded-3xl border ${settings.darkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-xl ${settings.darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
              <Save className={`w-5 h-5 ${settings.darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
            </div>
            <h2 className={`text-xl font-bold ${settings.darkMode ? 'text-white' : 'text-slate-900'}`}>Default Routine</h2>
          </div>

          <div className="space-y-4">
            <p className={`text-sm ${settings.darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Set your preferred routine to load automatically when you open the app.
            </p>
            
            <select 
              value={routines.find(r => 
                r.department === settings.preferredDepartment && 
                r.semester === settings.preferredSemester && 
                r.section === settings.preferredSection
              )?.id || ''}
              onChange={(e) => {
                const r = routines.find(rout => rout.id === e.target.value);
                if (r) {
                  updateSettings({
                    preferredDepartment: r.department,
                    preferredSemester: r.semester,
                    preferredSection: r.section
                  });
                  setSelectedRoutineId(r.id);
                }
              }}
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors appearance-none ${settings.darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='${settings.darkMode ? '%2394a3b8' : '%2364748b'}'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em 1.2em' }}
            >
              <option value="">No default set</option>
              {routines.map(r => (
                <option key={r.id} value={r.id}>
                  {r.department} • {r.semester} • Sec {r.section}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Data & Reset */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`p-6 rounded-3xl border ${settings.darkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className={`font-bold ${settings.darkMode ? 'text-white' : 'text-slate-900'}`}>Reset Settings</h3>
              <p className={`text-sm ${settings.darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Clear your preferences and restore default app settings.</p>
            </div>
            <button 
              onClick={handleReset}
              className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${settings.darkMode ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
            >
              <Trash2 className="w-4 h-4" /> Reset All
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
