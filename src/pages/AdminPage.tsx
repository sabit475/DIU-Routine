import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, File, X, Save, Plus, Trash2, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { Routine, ClassSession } from '../types';
import { motion } from 'motion/react';

export function AdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<Routine | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [savedRoutines, setSavedRoutines] = useState<Routine[]>([]);

  useEffect(() => {
    fetchRoutines();
  }, []);

  const fetchRoutines = async () => {
    try {
      const res = await fetch('/api/routines');
      const data = await res.json();
      setSavedRoutines(data);
    } catch (err) {
      console.error("Failed to fetch routines", err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        setError('Please select a valid PDF file.');
        return;
      }
      setFile(selectedFile);
      setError(null);
      setExtractedData(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type !== 'application/pdf') {
        setError('Please drop a valid PDF file.');
        return;
      }
      setFile(droppedFile);
      setError(null);
      setExtractedData(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(20);
    setError(null);

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      setUploadProgress(50);
      const response = await fetch('/api/extract-routine', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(80);

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error("Server returned an invalid response. API route may not be configured correctly.");
      }

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to extract routine');
      }

      const responseData = await response.json();
      setUploadProgress(100);
      
      // Handle { success: true, data: { ... } } format
      const data = (responseData.success && responseData.data) ? responseData.data : responseData;
      
      // Data contains the structure from Gemini
      setExtractedData({
        id: 'new', // Temporary ID
        department: data.department || 'Not detected',
        semester: data.semester || 'Not detected',
        section: data.section || 'Not detected',
        routine: data.routine?.map((c: any) => ({
          ...c,
          id: Math.random().toString(36).substring(7)
        })) || []
      });

    } catch (err: any) {
      console.error("Extraction error:", err);
      setError(err.message || 'An error occurred during extraction. Please try again.');
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const handleSaveRoutine = async () => {
    if (!extractedData) return;
    
    try {
      const response = await fetch('/api/routines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(extractedData)
      });
      
      if (response.ok) {
        alert("Routine saved successfully!");
        setExtractedData(null);
        setFile(null);
        fetchRoutines();
      } else {
        throw new Error("Failed to save routine");
      }
    } catch (err) {
      alert("Error saving routine.");
    }
  };

  const handleDeleteRoutine = async (id: string) => {
    if (!confirm("Are you sure you want to delete this routine?")) return;
    try {
      await fetch(`/api/routines/${id}`, { method: 'DELETE' });
      fetchRoutines();
    } catch (err) {
      alert("Error deleting routine.");
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-slate-400">Upload new PDF routines or manage existing ones.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-800/50 rounded-3xl p-6 border border-slate-700 shadow-sm transition-all">
            <h2 className="text-lg font-semibold text-white mb-4">Upload Routine PDF</h2>
            
            <div 
              className={`border border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer ${file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-700 bg-[#1e293b] hover:border-emerald-500/50 hover:bg-emerald-500/5'}`}
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => !file && fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="application/pdf" 
                className="hidden" 
              />
              
              {!file ? (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-slate-700 rounded-2xl flex items-center justify-center mb-4 transition-all group-hover:bg-emerald-500 group-hover:scale-110">
                    <UploadCloud className="h-8 w-8 text-slate-400 group-hover:text-white transition-colors" />
                  </div>
                  <p className="text-sm font-medium text-white mb-1">Click or drag PDF to upload</p>
                  <p className="text-xs text-slate-500">PDF files only (max 10MB)</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <File className="h-12 w-12 text-emerald-500 mb-3" />
                  <p className="text-sm font-medium text-white truncate max-w-full px-4 mb-1">{file.name}</p>
                  <p className="text-xs text-slate-400 mb-4">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setFile(null); setExtractedData(null); }}
                    className="text-xs text-red-400 hover:text-red-300 font-medium flex items-center gap-1 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20 transition-colors"
                  >
                    <X className="h-3 w-3" /> Remove File
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-500/10 text-red-400 text-sm rounded-xl flex items-start gap-2 border border-red-500/20">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {isUploading && (
              <div className="mt-6 space-y-3">
                <div className="flex justify-between text-xs font-medium text-slate-400 uppercase tracking-wider">
                  <span>Extracting Data...</span>
                  <span className="text-emerald-400">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="w-full mt-6 py-3 px-4 bg-emerald-500 text-white font-bold uppercase tracking-wider text-sm rounded-xl hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
            >
              {isUploading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
              ) : (
                <><Sparkles className="h-4 w-4" /> Extract Routine</>
              )}
            </button>
          </div>

          <div className="bg-[#1e293b] p-6 rounded-3xl border border-slate-700 flex-1">
             <h3 className="text-white font-semibold mb-4">Saved Routines</h3>
             {savedRoutines.length === 0 ? (
               <p className="text-sm text-slate-500">No routines saved yet.</p>
             ) : (
               <div className="space-y-3">
                 {savedRoutines.map(r => (
                   <div key={r.id} className="flex items-center gap-4 p-3 bg-slate-800/30 rounded-2xl border border-slate-700">
                     <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                       <File className="w-5 h-5 text-emerald-400" />
                     </div>
                     <div className="flex-1 overflow-hidden">
                       <p className="text-sm font-medium text-white truncate">{r.department} - {r.semester}</p>
                       <p className="text-[10px] text-slate-500">Section {r.section} • {r.routine.length} classes</p>
                     </div>
                     <button onClick={() => handleDeleteRoutine(r.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors">
                       <Trash2 className="h-4 w-4" />
                     </button>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>

        {/* Extracted Data Section */}
        <div className="lg:col-span-2">
          {extractedData ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-[#1e293b] rounded-3xl border border-slate-700 shadow-sm overflow-hidden flex flex-col h-full"
            >
              <div className="p-6 border-b border-slate-700/50 bg-[#0f172a]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">Review Extracted Data</h2>
                  <p className="text-sm text-slate-400">Please verify and edit any incorrect information before saving.</p>
                </div>
                <button 
                  onClick={handleSaveRoutine}
                  className="px-6 py-2.5 bg-emerald-500 text-white font-bold text-sm uppercase tracking-wider rounded-full hover:bg-emerald-600 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 whitespace-nowrap"
                >
                  <Save className="h-4 w-4" /> Save Routine
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Department</label>
                    <input 
                      type="text" 
                      value={extractedData.department}
                      onChange={(e) => setExtractedData({...extractedData, department: e.target.value})}
                      className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors ${extractedData.department === 'Not detected' ? 'bg-orange-500/10 border border-orange-500/30 text-orange-400' : 'bg-slate-800 border border-slate-700 text-white'}`}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Semester</label>
                    <input 
                      type="text" 
                      value={extractedData.semester}
                      onChange={(e) => setExtractedData({...extractedData, semester: e.target.value})}
                      className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors ${extractedData.semester === 'Not detected' ? 'bg-orange-500/10 border border-orange-500/30 text-orange-400' : 'bg-slate-800 border border-slate-700 text-white'}`}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Section</label>
                    <input 
                      type="text" 
                      value={extractedData.section}
                      onChange={(e) => setExtractedData({...extractedData, section: e.target.value})}
                      className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors ${extractedData.section === 'Not detected' ? 'bg-orange-500/10 border border-orange-500/30 text-orange-400' : 'bg-slate-800 border border-slate-700 text-white'}`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">Class Schedule ({extractedData.routine.length})</h3>
                  <button 
                    onClick={() => {
                      const newClass: ClassSession = { id: Math.random().toString(36).substring(7), day: 'Saturday', startTime: '', endTime: '', courseCode: '', courseName: '', teacher: '', room: '' };
                      setExtractedData({...extractedData, routine: [...extractedData.routine, newClass]});
                    }}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-bold uppercase tracking-wider flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" /> Add Class
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-700 rounded-2xl bg-slate-800/30">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-[#0f172a]/50 text-slate-400 uppercase text-[10px] font-bold tracking-widest border-b border-slate-700">
                      <tr>
                        <th className="px-4 py-4 whitespace-nowrap">Day</th>
                        <th className="px-4 py-4 whitespace-nowrap">Time (Start - End)</th>
                        <th className="px-4 py-4 whitespace-nowrap">Course Code</th>
                        <th className="px-4 py-4 min-w-[200px]">Course Name</th>
                        <th className="px-4 py-4 whitespace-nowrap">Teacher</th>
                        <th className="px-4 py-4 whitespace-nowrap">Room</th>
                        <th className="px-4 py-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50 text-slate-300">
                      {extractedData.routine.map((cls, index) => (
                        <tr key={cls.id || index} className="hover:bg-slate-700/30 transition-colors">
                          <td className="p-3">
                            <input 
                              type="text" value={cls.day} 
                              onChange={(e) => {
                                const newRoutine = [...extractedData.routine];
                                newRoutine[index].day = e.target.value;
                                setExtractedData({...extractedData, routine: newRoutine});
                              }}
                              className={`w-28 px-3 py-1.5 rounded-lg text-sm bg-slate-900 border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${cls.day === 'Not detected' ? 'border-orange-500/30 text-orange-400 bg-orange-500/10' : 'border-slate-700'}`}
                            />
                          </td>
                          <td className="p-3 flex gap-2 items-center">
                            <input 
                              type="text" value={cls.startTime} placeholder="08:30 AM"
                              onChange={(e) => {
                                const newRoutine = [...extractedData.routine];
                                newRoutine[index].startTime = e.target.value;
                                setExtractedData({...extractedData, routine: newRoutine});
                              }}
                              className={`w-24 px-3 py-1.5 rounded-lg text-sm bg-slate-900 border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${cls.startTime === 'Not detected' ? 'border-orange-500/30 text-orange-400 bg-orange-500/10' : 'border-slate-700'}`}
                            />
                            <span className="text-slate-500">-</span>
                            <input 
                              type="text" value={cls.endTime} placeholder="10:00 AM"
                              onChange={(e) => {
                                const newRoutine = [...extractedData.routine];
                                newRoutine[index].endTime = e.target.value;
                                setExtractedData({...extractedData, routine: newRoutine});
                              }}
                              className={`w-24 px-3 py-1.5 rounded-lg text-sm bg-slate-900 border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${cls.endTime === 'Not detected' ? 'border-orange-500/30 text-orange-400 bg-orange-500/10' : 'border-slate-700'}`}
                            />
                          </td>
                          <td className="p-3">
                            <input 
                              type="text" value={cls.courseCode} 
                              onChange={(e) => {
                                const newRoutine = [...extractedData.routine];
                                newRoutine[index].courseCode = e.target.value;
                                setExtractedData({...extractedData, routine: newRoutine});
                              }}
                              className={`w-28 px-3 py-1.5 rounded-lg text-sm bg-slate-900 border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${cls.courseCode === 'Not detected' ? 'border-orange-500/30 text-orange-400 bg-orange-500/10' : 'border-slate-700'}`}
                            />
                          </td>
                          <td className="p-3">
                            <input 
                              type="text" value={cls.courseName} 
                              onChange={(e) => {
                                const newRoutine = [...extractedData.routine];
                                newRoutine[index].courseName = e.target.value;
                                setExtractedData({...extractedData, routine: newRoutine});
                              }}
                              className={`w-full px-3 py-1.5 rounded-lg text-sm bg-slate-900 border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${cls.courseName === 'Not detected' ? 'border-orange-500/30 text-orange-400 bg-orange-500/10' : 'border-slate-700'}`}
                            />
                          </td>
                          <td className="p-3">
                            <input 
                              type="text" value={cls.teacher} 
                              onChange={(e) => {
                                const newRoutine = [...extractedData.routine];
                                newRoutine[index].teacher = e.target.value;
                                setExtractedData({...extractedData, routine: newRoutine});
                              }}
                              className={`w-24 px-3 py-1.5 rounded-lg text-sm bg-slate-900 border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${cls.teacher === 'Not detected' ? 'border-orange-500/30 text-orange-400 bg-orange-500/10' : 'border-slate-700'}`}
                            />
                          </td>
                          <td className="p-3">
                            <input 
                              type="text" value={cls.room} 
                              onChange={(e) => {
                                const newRoutine = [...extractedData.routine];
                                newRoutine[index].room = e.target.value;
                                setExtractedData({...extractedData, routine: newRoutine});
                              }}
                              className={`w-20 px-3 py-1.5 rounded-lg text-sm bg-slate-900 border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${cls.room === 'Not detected' ? 'border-orange-500/30 text-orange-400 bg-orange-500/10' : 'border-slate-700'}`}
                            />
                          </td>
                          <td className="p-3 text-center">
                            <button 
                              onClick={() => {
                                const newRoutine = extractedData.routine.filter((_, i) => i !== index);
                                setExtractedData({...extractedData, routine: newRoutine});
                              }}
                              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {extractedData.routine.length === 0 && (
                    <div className="p-8 text-center text-slate-500">
                      No classes found. Add one manually.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full min-h-[400px] flex items-center justify-center bg-[#1e293b] rounded-3xl border border-slate-700 shadow-sm border-dashed p-12 text-center">
              <div>
                <File className="h-16 w-16 text-slate-700 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-1">No Data Extracted Yet</h3>
                <p className="text-sm text-slate-400 max-w-sm mx-auto">
                  Upload a class routine PDF and click "Extract Routine" to review and edit the data here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
