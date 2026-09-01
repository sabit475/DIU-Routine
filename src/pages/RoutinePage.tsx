import React, { useState } from 'react';
import { useRoutine } from '../lib/RoutineContext';
import { 
  Search, 
  Clock, 
  MapPin, 
  User, 
  CalendarDays, 
  SlidersHorizontal, 
  Grid, 
  List, 
  Bookmark, 
  Check,
  ChevronRight
} from 'lucide-react';
import { ClassSession } from '../types';
import { motion } from 'motion/react';

const WEEKDAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

export function RoutinePage() {
  const { routines, preferences, updatePreferences, loading } = useRoutine();

  // Local filter states initialized with user preferences
  const [selectedDept, setSelectedDept] = useState<string>(preferences.department);
  const [selectedBatch, setSelectedBatch] = useState<string>(preferences.batch);
  const [selectedSemester, setSelectedSemester] = useState<string>(preferences.semester);
  const [selectedSection, setSelectedSection] = useState<string>(preferences.section);
  const [selectedDay, setSelectedDay] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'daily' | 'grid'>('daily');
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Available filter choices
  const departments = Array.from(new Set(routines.map(r => r.department)));
  const batches = Array.from(new Set(routines.filter(r => !selectedDept || r.department === selectedDept).map(r => r.batch)));
  const semesters = Array.from(new Set(routines.filter(r => (!selectedDept || r.department === selectedDept) && (!selectedBatch || r.batch === selectedBatch)).map(r => r.semester)));
  const sections = Array.from(new Set(routines.filter(r => (!selectedDept || r.department === selectedDept) && (!selectedSemester || r.semester === selectedSemester)).map(r => r.section)));

  // Target routine
  const currentRoutine = routines.find(r => 
    r.department === selectedDept &&
    r.batch === selectedBatch &&
    r.semester === selectedSemester &&
    r.section === selectedSection
  ) || routines.find(r => 
    r.department === selectedDept && r.section === selectedSection
  ) || routines[0] || null;

  // Save current selection to student preferences in browser storage
  const handleSavePreferences = () => {
    updatePreferences({
      department: selectedDept,
      batch: selectedBatch,
      semester: selectedSemester,
      section: selectedSection,
    });
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  const parseTime = (timeStr: string) => {
    try {
      if (!timeStr || timeStr === 'Not detected') return 0;
      const [time, period] = timeStr.split(' ');
      const [h, m] = time.split(':').map(Number);
      let hours = h;
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      return hours * 60 + m;
    } catch {
      return 0;
    }
  };

  const getClassesForDay = (day: string) => {
    if (!currentRoutine) return [];
    let list = currentRoutine.routine.filter(c => c.day.toLowerCase() === day.toLowerCase());

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c => 
        c.courseCode.toLowerCase().includes(q) ||
        c.courseName.toLowerCase().includes(q) ||
        c.teacher.toLowerCase().includes(q) ||
        c.room.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => parseTime(a.startTime) - parseTime(b.startTime));
  };

  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500">
        Loading DIU Routine records...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Class Routine
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Filter, inspect and organize your university schedule.
          </p>
        </div>

        {/* Search and View Toggles */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search course, room, teacher..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-full text-xs sm:text-sm bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div className="flex items-center bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/60 p-1 rounded-full">
            <button
              onClick={() => setViewMode('daily')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                viewMode === 'daily'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-500'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Daily Cards</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                viewMode === 'grid'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-500'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Weekly Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* Routine Filter Toolbar */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-500" /> Routine Filter Selection
          </span>
          <button
            onClick={handleSavePreferences}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              savedFeedback
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white'
            }`}
          >
            {savedFeedback ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Saved as Default!</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5" />
                <span>Save Selection</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {/* Department */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 mb-1 block">Department</label>
            <select
              value={selectedDept}
              onChange={e => {
                setSelectedDept(e.target.value);
                const r = routines.find(ro => ro.department === e.target.value);
                if (r) {
                  setSelectedBatch(r.batch);
                  setSelectedSemester(r.semester);
                  setSelectedSection(r.section);
                }
              }}
              className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Batch */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 mb-1 block">Batch</label>
            <select
              value={selectedBatch}
              onChange={e => setSelectedBatch(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              {batches.map(b => <option key={b} value={b}>Batch {b}</option>)}
            </select>
          </div>

          {/* Semester */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 mb-1 block">Semester</label>
            <select
              value={selectedSemester}
              onChange={e => setSelectedSemester(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              {semesters.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Section */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 mb-1 block">Section</label>
            <select
              value={selectedSection}
              onChange={e => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              {sections.map(s => <option key={s} value={s}>Section {s}</option>)}
            </select>
          </div>

          {/* Day Filter */}
          <div className="col-span-2 sm:col-span-1">
            <label className="text-[11px] font-semibold text-slate-400 mb-1 block">Filter Day</label>
            <select
              value={selectedDay}
              onChange={e => setSelectedDay(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="All">All Weekdays</option>
              {WEEKDAYS.map(d => (
                <option key={d} value={d}>
                  {d} {d.toLowerCase() === todayName.toLowerCase() ? '(Today)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {!currentRoutine ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/60 space-y-3">
          <CalendarDays className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No routine matched</h3>
          <p className="text-xs text-slate-500">Please choose a different department or section combination.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Weekly Grid View */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {WEEKDAYS.filter(d => selectedDay === 'All' || d.toLowerCase() === selectedDay.toLowerCase()).map(day => {
              const classes = getClassesForDay(day);
              const isToday = day.toLowerCase() === todayName.toLowerCase();

              return (
                <div
                  key={day}
                  className={`flex flex-col rounded-2xl border overflow-hidden transition-all ${
                    isToday
                      ? 'border-emerald-500/50 bg-emerald-500/5 ring-1 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#1e293b]'
                  }`}
                >
                  <div className={`p-3 text-center border-b font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 ${
                    isToday 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-inherit'
                  }`}>
                    <span>{day}</span>
                    {isToday && <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded">Today</span>}
                  </div>

                  <div className="p-3 space-y-3 flex-1 flex flex-col justify-start">
                    {classes.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-700/60 rounded-xl">
                        No classes scheduled.
                      </div>
                    ) : (
                      classes.map(cls => (
                        <div
                          key={cls.id}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 hover:border-emerald-500/40 transition-colors group"
                        >
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block group-hover:underline">
                            {cls.courseCode}
                          </span>
                          <p className="text-[11px] font-medium text-slate-800 dark:text-slate-200 mt-0.5 line-clamp-1" title={cls.courseName}>
                            {cls.courseName}
                          </p>
                          <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{cls.startTime} - {cls.endTime}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400" />
                              <span className="truncate">{cls.teacher}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span className="font-semibold text-slate-700 dark:text-slate-300">Room {cls.room}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Daily Card View (Great for Mobile and Detailed Scrutiny) */
        <div className="space-y-6">
          {WEEKDAYS.filter(d => selectedDay === 'All' || d.toLowerCase() === selectedDay.toLowerCase()).map(day => {
            const classes = getClassesForDay(day);
            const isToday = day.toLowerCase() === todayName.toLowerCase();

            return (
              <div
                key={day}
                className={`p-5 sm:p-6 rounded-3xl border transition-all ${
                  isToday
                    ? 'bg-white dark:bg-[#1e293b] border-emerald-500/50 shadow-md ring-2 ring-emerald-500/15'
                    : 'bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-700/60 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between border-b border-inherit pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      {day}
                    </h2>
                    {isToday && (
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                        Today
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    {classes.length} {classes.length === 1 ? 'Class' : 'Classes'}
                  </span>
                </div>

                {classes.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 italic">
                    No classes scheduled for {day}.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classes.map(cls => (
                      <div
                        key={cls.id}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 hover:border-emerald-500/40 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                              {cls.courseCode}
                            </span>
                            <h4 className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5">
                              {cls.courseName}
                            </h4>
                          </div>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 shrink-0">
                            {cls.room}
                          </span>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-emerald-500" />
                            <span>{cls.startTime} - {cls.endTime}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span className="truncate max-w-[110px]">{cls.teacher}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
