import React, { createContext, useContext, useState, useEffect } from 'react';
import { Routine, ClassSession } from '../types';

interface RoutineContextType {
  routines: Routine[];
  selectedRoutineId: string | null;
  setSelectedRoutineId: (id: string | null) => void;
  selectedRoutine: Routine | null;
  settings: {
    darkMode: boolean;
    fontSize: 'small' | 'medium' | 'large';
    preferredDepartment: string;
    preferredSemester: string;
    preferredSection: string;
    remindersEnabled: boolean;
    reminderMinutes: number;
  };
  updateSettings: (newSettings: Partial<RoutineContextType['settings']>) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const RoutineContext = createContext<RoutineContextType | undefined>(undefined);

export function RoutineProvider({ children }: { children: React.ReactNode }) {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('diu_settings');
    return saved ? JSON.parse(saved) : {
      darkMode: true,
      fontSize: 'medium',
      preferredDepartment: '',
      preferredSemester: '',
      preferredSection: '',
      remindersEnabled: false,
      reminderMinutes: 15
    };
  });

  useEffect(() => {
    fetch('/api/routines')
      .then(res => res.json())
      .then(data => {
        setRoutines(data);
        if (data.length > 0 && !selectedRoutineId) {
          // Try to match preferred settings
          const match = data.find((r: Routine) => 
            r.department === settings.preferredDepartment && 
            r.semester === settings.preferredSemester && 
            r.section === settings.preferredSection
          );
          setSelectedRoutineId(match ? match.id : data[0].id);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    localStorage.setItem('diu_settings', JSON.stringify(settings));
    
    // Apply dark mode
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<typeof settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const selectedRoutine = routines.find(r => r.id === selectedRoutineId) || null;

  return (
    <RoutineContext.Provider value={{
      routines,
      selectedRoutineId,
      setSelectedRoutineId,
      selectedRoutine,
      settings,
      updateSettings,
      searchQuery,
      setSearchQuery
    }}>
      {children}
    </RoutineContext.Provider>
  );
}

export function useRoutine() {
  const context = useContext(RoutineContext);
  if (context === undefined) {
    throw new Error('useRoutine must be used within a RoutineProvider');
  }
  return context;
}
