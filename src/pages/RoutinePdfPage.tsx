import React from 'react';
import { useRoutine } from '../lib/RoutineContext';
import { FileText, Download } from 'lucide-react';

export function RoutinePdfPage() {
  const { settings, routines } = useRoutine();

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className={`text-3xl font-bold tracking-tight mb-2 ${settings.darkMode ? 'text-white' : 'text-slate-900'}`}>PDF Archive</h1>
        <p className={settings.darkMode ? 'text-slate-400' : 'text-slate-500'}>
          Download original PDF routines provided by the administration.
        </p>
      </div>

      {routines.length === 0 ? (
        <div className={`p-12 text-center rounded-3xl border border-dashed ${settings.darkMode ? 'bg-[#1e293b]/50 border-slate-700' : 'bg-slate-50 border-slate-300'}`}>
          <FileText className={`w-12 h-12 mx-auto mb-4 ${settings.darkMode ? 'text-slate-600' : 'text-slate-400'}`} />
          <p className={`text-lg font-medium ${settings.darkMode ? 'text-slate-300' : 'text-slate-700'}`}>No PDF routines available.</p>
          <p className={`text-sm ${settings.darkMode ? 'text-slate-500' : 'text-slate-500'}`}>Check back later when admins upload new schedules.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {routines.map((r, idx) => (
            <div 
              key={r.id} 
              className={`p-6 rounded-3xl border flex items-center justify-between transition-all hover:-translate-y-1 hover:shadow-md ${settings.darkMode ? 'bg-[#1e293b] border-slate-700 hover:border-slate-500' : 'bg-white border-slate-200 shadow-sm hover:border-emerald-500/50'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${settings.darkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'}`}>
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={`font-bold ${settings.darkMode ? 'text-white' : 'text-slate-900'}`}>{r.department} - {r.semester}</h3>
                  <p className={`text-xs uppercase tracking-wider font-semibold ${settings.darkMode ? 'text-slate-500' : 'text-slate-500'}`}>Section {r.section}</p>
                </div>
              </div>
              
              <button className={`p-3 rounded-xl transition-colors ${settings.darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600'}`}>
                <Download className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
