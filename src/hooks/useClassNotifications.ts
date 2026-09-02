import { useEffect, useRef } from 'react';
import { useRoutine } from '../lib/RoutineContext';

export function useClassNotifications() {
  const { selectedRoutine, settings } = useRoutine();
  const notifiedClassesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!settings.remindersEnabled || !selectedRoutine || typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }
    
    // Parse time strings like "08:30 AM" or "08:30AM" into today's Date object
    const parseTimeToday = (timeStr: string): Date | null => {
      try {
        const cleanStr = timeStr.trim().toUpperCase();
        // Regex to extract hours, minutes, and AM/PM safely
        const match = cleanStr.match(/(\d+):(\d+)\s*(AM|PM)/);
        if (!match) return null;
        
        let hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const period = match[3];
        
        if (period === 'PM' && hours !== 12) {
          hours += 12;
        } else if (period === 'AM' && hours === 12) {
          hours = 0;
        }
        
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
      } catch (e) {
        return null;
      }
    };
    
    const getTodayName = (): string => {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[new Date().getDay()];
    };

    const checkClasses = () => {
      if (Notification.permission !== 'granted') return;
      
      const today = getTodayName();
      const now = new Date();
      const reminderMs = (settings.reminderMinutes || 15) * 60 * 1000;
      
      const todaysClasses = selectedRoutine.routine.filter(c => 
        c.day.toLowerCase() === today.toLowerCase()
      );
      
      todaysClasses.forEach(cls => {
        const classStartTime = parseTimeToday(cls.startTime);
        if (!classStartTime) return;
        
        const timeDiff = classStartTime.getTime() - now.getTime();
        
        // If class is within the reminder window (0 to reminderMs)
        // We use a 1-minute grace window to catch it (60000ms)
        if (timeDiff > 0 && timeDiff <= reminderMs && timeDiff > reminderMs - 60000) {
          const classKey = `${cls.courseCode}-${cls.startTime}-${now.toDateString()}`;
          
          if (!notifiedClassesRef.current.has(classKey)) {
            // Trigger notification
            if (navigator.serviceWorker && navigator.serviceWorker.controller) {
              navigator.serviceWorker.ready.then(registration => {
                registration.showNotification(`Class Reminder: ${cls.courseName}`, {
                  body: `${cls.courseCode} starts at ${cls.startTime} in Room ${cls.room || 'TBD'}`,
                  icon: '/icon.svg',
                  vibrate: [200, 100, 200, 100, 200],
                  tag: classKey
                });
              });
            } else {
              new Notification(`Class Reminder: ${cls.courseName}`, {
                body: `${cls.courseCode} starts at ${cls.startTime} in Room ${cls.room || 'TBD'}`,
                icon: '/icon.svg'
              });
            }
            
            notifiedClassesRef.current.add(classKey);
          }
        }
      });
      
      if (notifiedClassesRef.current.size > 20) {
        notifiedClassesRef.current.clear();
      }
    };

    // Check immediately and then every minute
    checkClasses();
    const interval = setInterval(checkClasses, 60000);
    
    return () => clearInterval(interval);
  }, [selectedRoutine, settings.remindersEnabled, settings.reminderMinutes]);
}
