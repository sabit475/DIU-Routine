import React, { useMemo } from 'react';
import { useRoutine } from '../lib/RoutineContext';
import { CalendarDays, Clock, MapPin, BookOpen, User, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export function HomePage() {
  const { selectedRoutine, routines, setSelectedRoutineId, settings } = useRoutine();

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayClasses = useMemo(() => {
    if (!selectedRoutine) return [];
    return selectedRoutine.routine.filter(c => c.day === todayStr)
      .sort((a, b) => {
        // basic string sort for time, assuming standard AM/PM format
        const timeA = new Date(`1970/01/01 ${a.startTime}`).getTime();
        const timeB = new Date(`1970/01/01 ${b.startTime}`).getTime();
        return timeA - timeB;
      });
  }, [selectedRoutine, todayStr]);

  if (routines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto text-center">
        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-xl ${settings.darkMode ? 'bg-emerald-500/10 shadow-emerald-500/20' : 'bg-emerald-100 shadow-emerald-200'}`}>
          <CalendarDays className={`w-10 h-10 ${settings.darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
        </div>
        <h2 className={`text-3xl font-bold mb-4 tracking-tight ${settings.darkMode ? 'text-white' : 'text-slate-900'}`}>Welcome to DIU Routine</h2>
        <p className={`text-lg mb-8 leading-relaxed ${settings.darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          The administration hasn't uploaded any class routines yet. Check back later or access the admin panel if you are an administrator.
        </p>
        <Link 
          to="/admin" 
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-3.5 rounded-full transition-all shadow-lg shadow-emerald-500/20"
        >
          Go to Admin Panel
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Top Banner / Selector */}
      <div className={`p-6 rounded-3xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${settings.darkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div>
          <h1 className={`text-2xl font-bold tracking-tight mb-1 ${settings.darkMode ? 'text-white' : 'text-slate-900'}`}>Hello, Student 👋</h1>
          <p className={settings.darkMode ? 'text-slate-400' : 'text-slate-500'}>
            Here is your academic overview for {todayStr}.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="w-full sm:w-auto">
            <label className={`text-xs font-bold uppercase tracking-widest mb-1 block ${settings.darkMode ? 'text-slate-500' : 'text-slate-500'}`}>Viewing Routine For</label>
            <select 
              value={selectedRoutine?.id || ''} 
              onChange={(e) => setSelectedRoutineId(e.target.value)}
              className={`w-full sm:w-64 px-4 py-3 text-sm font-semibold rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors appearance-none cursor-pointer ${settings.darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='${settings.darkMode ? '%2394a3b8' : '%2364748b'}'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em 1.2em' }}
            >
              <option value="" disabled>Select your batch...</option>
              {routines.map(r => (
                <option key={r.id} value={r.id}>
                  {r.department} • {r.semester} • Sec {r.section}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`p-6 rounded-3xl border ${settings.darkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${settings.darkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>
            <CalendarDays className="w-6 h-6" />
          </div>
          <h3 className={`text-4xl font-black mb-1 ${settings.darkMode ? 'text-white' : 'text-slate-900'}`}>{selectedRoutine?.routine.length || 0}</h3>
          <p className={`text-sm font-medium ${settings.darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Total Classes/Week</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`p-6 rounded-3xl border ${settings.darkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${settings.darkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className={`text-4xl font-black mb-1 ${settings.darkMode ? 'text-white' : 'text-slate-900'}`}>{todayClasses.length}</h3>
          <p className={`text-sm font-medium ${settings.darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Classes Today</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={`p-6 rounded-3xl border ${settings.darkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${settings.darkMode ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className={`text-4xl font-black mb-1 ${settings.darkMode ? 'text-white' : 'text-slate-900'}`}>{new Set(selectedRoutine?.routine.map(c => c.courseCode)).size || 0}</h3>
          <p className={`text-sm font-medium ${settings.darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Unique Courses</p>
        </motion.div>
      </div>

      {/* Today's Classes */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-2xl font-bold tracking-tight ${settings.darkMode ? 'text-white' : 'text-slate-900'}`}>Today's Schedule</h2>
          <Link to="/weekly" className={`text-sm font-semibold hover:underline ${settings.darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>View Full Week</Link>
        </div>

        {todayClasses.length === 0 ? (
          <div className={`py-12 px-6 text-center rounded-3xl border border-dashed ${settings.darkMode ? 'bg-[#1e293b]/50 border-slate-700' : 'bg-slate-50 border-slate-300'}`}>
            <p className={`text-lg font-medium mb-2 ${settings.darkMode ? 'text-white' : 'text-slate-800'}`}>No classes today!</p>
            <p className={settings.darkMode ? 'text-slate-400' : 'text-slate-500'}>Enjoy your day off or use this time to catch up on assignments.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {todayClasses.map((cls, idx) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: 0.1 * idx }}
                key={cls.id || idx} 
                className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center gap-6 transition-all hover:scale-[1.01] ${settings.darkMode ? 'bg-[#1e293b] border-slate-700 hover:border-slate-600' : 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300'}`}
              >
                <div className="flex items-center gap-4 md:w-48 shrink-0">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${settings.darkMode ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                    <Clock className={`w-5 h-5 ${settings.darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                  </div>
                  <div>
                    <p className={`font-bold ${settings.darkMode ? 'text-white' : 'text-slate-900'}`}>{cls.startTime}</p>
                    <p className={`text-xs font-medium uppercase tracking-wider ${settings.darkMode ? 'text-slate-500' : 'text-slate-400'}`}>To {cls.endTime}</p>
                  </div>
                </div>

                <div className={`w-full md:w-px h-px md:h-12 shrink-0 ${settings.darkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`}></div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${settings.darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                      {cls.courseCode}
                    </span>
                  </div>
                  <h4 className={`text-lg font-bold leading-tight ${settings.darkMode ? 'text-white' : 'text-slate-900'}`}>{cls.courseName}</h4>
                </div>

                <div className="flex flex-row md:flex-col gap-4 md:gap-2 shrink-0 md:min-w-[140px]">
                  <div className={`flex items-center gap-2 text-sm ${settings.darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    <User className="w-4 h-4" />
                    <span className="font-medium truncate">{cls.teacher}</span>
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${settings.darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium truncate">{cls.room}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
