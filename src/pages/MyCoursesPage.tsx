import React, { useMemo } from 'react';
import { useRoutine } from '../lib/RoutineContext';
import { BookOpen, User, Hash } from 'lucide-react';
import { motion } from 'motion/react';

export function MyCoursesPage() {
  const { selectedRoutine, settings } = useRoutine();

  const courses = useMemo(() => {
    if (!selectedRoutine) return [];
    
    const courseMap = new Map();
    
    selectedRoutine.routine.forEach(cls => {
      if (!courseMap.has(cls.courseCode)) {
        courseMap.set(cls.courseCode, {
          courseCode: cls.courseCode,
          courseName: cls.courseName,
          teacher: cls.teacher,
          classCount: 1
        });
      } else {
        const c = courseMap.get(cls.courseCode);
        c.classCount += 1;
        courseMap.set(cls.courseCode, c);
      }
    });
    
    return Array.from(courseMap.values());
  }, [selectedRoutine]);

  if (!selectedRoutine) {
    return (
      <div className={`p-8 text-center rounded-3xl border ${settings.darkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-200'}`}>
        <p className={settings.darkMode ? 'text-slate-400' : 'text-slate-500'}>Please select a routine first.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className={`text-3xl font-bold tracking-tight mb-2 ${settings.darkMode ? 'text-white' : 'text-slate-900'}`}>My Courses</h1>
        <p className={settings.darkMode ? 'text-slate-400' : 'text-slate-500'}>
          Overview of courses in {selectedRoutine.department} - Sec {selectedRoutine.section}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courses.map((course, idx) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ delay: idx * 0.05 }}
            key={course.courseCode} 
            className={`p-6 rounded-3xl border flex flex-col sm:flex-row gap-6 ${settings.darkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${settings.darkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
              <BookOpen className="w-7 h-7" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${settings.darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                  {course.courseCode}
                </span>
                <span className={`text-xs font-bold flex items-center gap-1 ${settings.darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  <Hash className="w-3 h-3" /> {course.classCount} {course.classCount === 1 ? 'class' : 'classes'}/wk
                </span>
              </div>
              <h3 className={`text-lg font-bold leading-tight mb-3 ${settings.darkMode ? 'text-white' : 'text-slate-900'}`}>{course.courseName}</h3>
              <div className={`flex items-center gap-2 text-sm ${settings.darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                <User className="w-4 h-4" />
                <span className="font-medium">Faculty: {course.teacher}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
