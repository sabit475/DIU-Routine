import React, { useMemo, useState } from 'react';
import { useRoutine } from '../lib/RoutineContext';
import { Clock, MapPin, User, LayoutGrid, List } from 'lucide-react';
import { motion } from 'motion/react';

const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export function WeeklySchedulePage() {
  const { selectedRoutine, settings } = useRoutine();
  const [viewMode, setViewMode] = useState<'cards' | 'grid'>('cards');

  const groupedByDay = useMemo(() => {
    if (!selectedRoutine) return {};
    const grouped: Record<string, typeof selectedRoutine.routine> = {};
    DAYS.forEach(d => grouped[d] = []);
    selectedRoutine.routine.forEach(c => {
      if (grouped[c.day]) {
        grouped[c.day].push(c);
      } else {
        grouped[c.day] = [c];
      }
    });
    
    // Sort times
    Object.keys(grouped).forEach(day => {
      grouped[day].sort((a, b) => {
        const timeA = new Date(`1970/01/01 ${a.startTime}`).getTime();
        const timeB = new Date(`1970/01/01 ${b.startTime}`).getTime();
        return timeA - timeB;
      });
    });
    return grouped;
  }, [selectedRoutine]);

  if (!selectedRoutine) {
    return (
      <div className={`p-8 text-center rounded-3xl border ${settings.darkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-200'}`}>
        <p className={settings.darkMode ? 'text-slate-400' : 'text-slate-500'}>Please select or upload a routine to view the weekly schedule.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className={`text-3xl font-bold tracking-tight mb-2 ${settings.darkMode ? 'text-white' : 'text-slate-900'}`}>Weekly Schedule</h1>
          <p className={settings.darkMode ? 'text-slate-400' : 'text-slate-500'}>
            Showing schedule for {selectedRoutine.department} - Semester {selectedRoutine.semester} (Sec {selectedRoutine.section})
          </p>
        </div>
        
        <div className={`flex p-1 rounded-xl ${settings.darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
          <button 
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'cards' ? (settings.darkMode ? 'bg-emerald-500 text-white shadow-md' : 'bg-white text-emerald-600 shadow-sm') : (settings.darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800')}`}
          >
            <List className="w-4 h-4" /> Daily Cards
          </button>
          <button 
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'grid' ? (settings.darkMode ? 'bg-emerald-500 text-white shadow-md' : 'bg-white text-emerald-600 shadow-sm') : (settings.darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800')}`}
          >
            <LayoutGrid className="w-4 h-4" /> Time Grid
          </button>
        </div>
      </div>

      {viewMode === 'cards' ? (
        <div className="space-y-8">
          {DAYS.map((day, idx) => {
            const classes = groupedByDay[day];
            if (!classes || classes.length === 0) return null;

            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: idx * 0.1 }}
                key={day}
              >
                <h3 className={`text-lg font-bold mb-4 uppercase tracking-widest pl-2 ${settings.darkMode ? 'text-slate-300' : 'text-slate-500'}`}>{day}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {classes.map(cls => (
                    <div key={cls.id} className={`p-5 rounded-2xl border transition-all hover:shadow-md hover:-translate-y-1 ${settings.darkMode ? 'bg-[#1e293b] border-slate-700 hover:border-slate-500' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md inline-block mb-2 ${settings.darkMode ? 'bg-slate-800 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                            {cls.courseCode}
                          </div>
                          <h4 className={`font-bold leading-tight line-clamp-2 ${settings.darkMode ? 'text-white' : 'text-slate-900'}`}>{cls.courseName}</h4>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mt-4">
                        <div className={`flex items-center gap-3 text-sm ${settings.darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          <Clock className={`w-4 h-4 ${settings.darkMode ? 'text-emerald-500/70' : 'text-emerald-500'}`} />
                          <span className="font-medium">{cls.startTime} - {cls.endTime}</span>
                        </div>
                        <div className={`flex items-center gap-3 text-sm ${settings.darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          <User className={`w-4 h-4 ${settings.darkMode ? 'text-emerald-500/70' : 'text-emerald-500'}`} />
                          <span className="font-medium truncate">{cls.teacher}</span>
                        </div>
                        <div className={`flex items-center gap-3 text-sm ${settings.darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          <MapPin className={`w-4 h-4 ${settings.darkMode ? 'text-emerald-500/70' : 'text-emerald-500'}`} />
                          <span className="font-medium">{cls.room}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className={`overflow-x-auto rounded-3xl border shadow-sm ${settings.darkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-200'}`}>
          <table className="w-full text-left min-w-[800px]">
            <thead className={`border-b ${settings.darkMode ? 'bg-[#0f172a]/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <tr>
                <th className={`p-4 text-xs font-bold uppercase tracking-wider ${settings.darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Day</th>
                <th className={`p-4 text-xs font-bold uppercase tracking-wider ${settings.darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Classes</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${settings.darkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
              {DAYS.map(day => {
                const classes = groupedByDay[day];
                if (!classes || classes.length === 0) return null;
                return (
                  <tr key={day}>
                    <td className={`p-4 font-bold align-top w-32 ${settings.darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{day}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-3">
                        {classes.map(cls => (
                          <div key={cls.id} className={`p-3 rounded-xl border w-64 ${settings.darkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200 shadow-sm'}`}>
                            <p className={`text-xs font-bold mb-1 ${settings.darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{cls.startTime} - {cls.endTime}</p>
                            <p className={`font-bold text-sm mb-1 line-clamp-1 ${settings.darkMode ? 'text-white' : 'text-slate-900'}`}>{cls.courseCode}: {cls.courseName}</p>
                            <div className={`text-xs flex items-center justify-between ${settings.darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                              <span className="truncate max-w-[100px]">{cls.teacher}</span>
                              <span className="font-semibold">{cls.room}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
