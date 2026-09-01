import React, { useMemo } from 'react';
import { useRoutine } from '../lib/RoutineContext';
import { Search, Clock, MapPin, User } from 'lucide-react';
import { motion } from 'motion/react';

export function SearchPage() {
  const { selectedRoutine, searchQuery, setSearchQuery, settings } = useRoutine();

  const searchResults = useMemo(() => {
    if (!selectedRoutine || !searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    return selectedRoutine.routine.filter(cls => 
      cls.courseName.toLowerCase().includes(query) ||
      cls.courseCode.toLowerCase().includes(query) ||
      cls.teacher.toLowerCase().includes(query) ||
      cls.room.toLowerCase().includes(query) ||
      cls.day.toLowerCase().includes(query)
    );
  }, [selectedRoutine, searchQuery]);

  if (!selectedRoutine) {
    return (
      <div className={`p-8 text-center rounded-3xl border ${settings.darkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-200'}`}>
        <p className={settings.darkMode ? 'text-slate-400' : 'text-slate-500'}>Please select a routine first.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-8 max-w-2xl">
        <h1 className={`text-3xl font-bold tracking-tight mb-4 ${settings.darkMode ? 'text-white' : 'text-slate-900'}`}>Search Routine</h1>
        
        <div className={`flex items-center px-4 rounded-2xl border transition-all ${settings.darkMode ? 'bg-[#1e293b] border-slate-700 focus-within:border-emerald-500' : 'bg-white border-slate-300 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 shadow-sm'}`}>
          <Search className={`w-6 h-6 ${settings.darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
          <input 
            type="text" 
            placeholder="Search by course name, code, teacher, room or day..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full py-4 px-4 bg-transparent outline-none ${settings.darkMode ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400'}`}
          />
        </div>
      </div>

      {searchQuery && (
        <div className="space-y-4">
          <p className={`text-sm font-bold uppercase tracking-wider mb-6 ${settings.darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
            Found {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
          </p>

          {searchResults.length === 0 ? (
            <div className={`py-12 px-6 text-center rounded-3xl border border-dashed ${settings.darkMode ? 'bg-[#1e293b]/50 border-slate-700' : 'bg-slate-50 border-slate-300'}`}>
              <p className={`text-lg font-medium ${settings.darkMode ? 'text-white' : 'text-slate-900'}`}>No matches found for "{searchQuery}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map((cls, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: idx * 0.05 }}
                  key={cls.id || idx} 
                  className={`p-6 rounded-2xl border transition-all ${settings.darkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md inline-block mb-2 ${settings.darkMode ? 'bg-slate-800 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                        {cls.courseCode}
                      </div>
                      <h4 className={`font-bold leading-tight ${settings.darkMode ? 'text-white' : 'text-slate-900'}`}>{cls.courseName}</h4>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${settings.darkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>{cls.day}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className={`flex items-center gap-3 text-sm ${settings.darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">{cls.startTime} - {cls.endTime}</span>
                    </div>
                    <div className={`flex items-center gap-3 text-sm ${settings.darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      <User className="w-4 h-4" />
                      <span className="font-medium">{cls.teacher}</span>
                    </div>
                    <div className={`flex items-center gap-3 text-sm ${settings.darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      <MapPin className="w-4 h-4" />
                      <span className="font-medium">{cls.room}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
