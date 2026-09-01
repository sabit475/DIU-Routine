export interface ClassSession {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  courseCode: string;
  courseName: string;
  teacher: string;
  room: string;
  batch?: string;
  section?: string;
}

export interface Routine {
  id: string;
  department: string;
  batch: string;
  semester: string;
  section: string;
  updatedAt?: string;
  routine: ClassSession[];
}

export interface PdfDocument {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  department: string;
  semester: string;
  batch: string;
  extractedSlotsCount: number;
  pdfDataUrl?: string; // base64 or stored URL
}

export interface StudentPreferences {
  department: string;
  batch: string;
  semester: string;
  section: string;
  darkMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
  remindersEnabled: boolean;
  reminderMinutes: number; // e.g. 15, 30
}

export interface CourseSummary {
  courseCode: string;
  courseName: string;
  teacher: string;
  weeklyClassesCount: number;
  sessions: ClassSession[];
}
