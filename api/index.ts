import express from "express";
import multer from "multer";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
app.use(express.json());

// In-memory data storage
let routines: any[] = [
  {
    id: "dummy-1",
    department: "CSE",
    semester: "Summer 2026",
    section: "61",
    routine: [
      { id: "c1", day: "Saturday", startTime: "08:30 AM", endTime: "10:00 AM", courseCode: "CSE123", courseName: "Data Structures", teacher: "MHK", room: "AB-101" },
      { id: "c2", day: "Saturday", startTime: "10:00 AM", endTime: "11:30 AM", courseCode: "CSE221", courseName: "Algorithms", teacher: "SA", room: "AB-201" },
      { id: "c3", day: "Sunday", startTime: "11:30 AM", endTime: "01:00 PM", courseCode: "MAT101", courseName: "Calculus", teacher: "AR", room: "AB-104" },
      { id: "c4", day: "Tuesday", startTime: "08:30 AM", endTime: "10:00 AM", courseCode: "ENG101", courseName: "English", teacher: "ZK", room: "AB-305" }
    ]
  },
  {
    id: "dummy-2",
    department: "BBA",
    semester: "Summer 2026",
    section: "A",
    routine: [
      { id: "c5", day: "Monday", startTime: "08:30 AM", endTime: "10:00 AM", courseCode: "ACT101", courseName: "Accounting", teacher: "TJ", room: "MB-101" },
      { id: "c6", day: "Wednesday", startTime: "11:30 AM", endTime: "01:00 PM", courseCode: "MGT101", courseName: "Management", teacher: "RH", room: "MB-204" }
    ]
  }
];

let pdfDocuments: any[] = [];

// Setup multer for file uploads (store in memory for processing)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Initialize Gemini API
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API Routes
app.get("/api/routines", (req, res) => {
  res.json(routines);
});

app.post("/api/routines", (req, res) => {
  const newRoutine = { ...req.body, id: Date.now().toString() };
  routines.push(newRoutine);
  res.json({ success: true, routine: newRoutine });
});

app.put("/api/routines/:id", (req, res) => {
  const index = routines.findIndex(r => r.id === req.params.id);
  if (index !== -1) {
    routines[index] = { ...req.body, id: req.params.id };
    res.json({ success: true, routine: routines[index] });
  } else {
    res.status(404).json({ error: "Routine not found" });
  }
});

app.delete("/api/routines/:id", (req, res) => {
  routines = routines.filter(r => r.id !== req.params.id);
  res.json({ success: true });
});

app.get("/api/pdf-documents", (req, res) => {
  res.json(pdfDocuments);
});

app.post("/api/pdf-documents", upload.single("pdf"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No PDF file uploaded" });
  }
  const newDoc = {
    id: Date.now().toString(),
    filename: req.file.originalname,
    size: req.file.size,
    uploadDate: new Date().toISOString()
  };
  pdfDocuments.push(newDoc);
  res.json({ success: true, document: newDoc });
});

app.delete("/api/pdf-documents/:id", (req, res) => {
  pdfDocuments = pdfDocuments.filter(d => d.id !== req.params.id);
  res.json({ success: true });
});

app.post("/api/extract-routine", upload.single("pdf"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: "No PDF file uploaded" });
  }
  
  if (req.file.mimetype !== "application/pdf") {
    return res.status(400).json({ success: false, error: "Uploaded file is not a valid PDF" });
  }
  
  if (req.file.size > 10 * 1024 * 1024) { // 10MB limit
    return res.status(400).json({ success: false, error: "PDF file is too large (max 10MB)" });
  }

  if (!ai) {
    if (process.env.GEMINI_API_KEY) {
       ai = new GoogleGenAI({
         apiKey: process.env.GEMINI_API_KEY,
       });
    } else {
       return res.status(500).json({ error: "Gemini API key is not configured on the server." });
    }
  }

  try {
    const base64Pdf = req.file.buffer.toString("base64");
    
    const contents = [
      {
        inlineData: {
          mimeType: "application/pdf",
          data: base64Pdf
        }
      },
      "Extract the class routine information from this PDF. Identify the department, semester, and section if possible. Then, extract all classes in the schedule. Output the result in JSON."
    ];
    
    const config = {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          department: { type: Type.STRING, description: "Department name (e.g. CSE, BBA) or 'Not detected'" },
          semester: { type: Type.STRING, description: "Semester (e.g. Summer 2026) or 'Not detected'" },
          section: { type: Type.STRING, description: "Section (e.g. 61, A) or 'Not detected'" },
          routine: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.STRING, description: "Day of the week (e.g. Saturday, Sunday) or 'Not detected'" },
                startTime: { type: Type.STRING, description: "Start time (e.g. 08:30 AM) or 'Not detected'" },
                endTime: { type: Type.STRING, description: "End time (e.g. 10:00 AM) or 'Not detected'" },
                courseCode: { type: Type.STRING, description: "Course code (e.g. CSE123) or 'Not detected'" },
                courseName: { type: Type.STRING, description: "Course name (e.g. Data Structures) or 'Not detected'" },
                teacher: { type: Type.STRING, description: "Teacher name/initials or 'Not detected'" },
                room: { type: Type.STRING, description: "Room number or 'Not detected'" }
              },
              required: ["day", "startTime", "endTime", "courseCode", "courseName", "teacher", "room"]
            }
          }
        },
        required: ["department", "semester", "section", "routine"]
      }
    };

    const attemptGeneration = async (modelName: string) => {
      const maxRetries = 3;
      for (let i = 0; i < maxRetries; i++) {
        try {
          console.log(`[Gemini API] Attempting extraction with model: ${modelName}, Attempt: ${i + 1}/${maxRetries}`);
          const res = await ai!.models.generateContent({
            model: modelName,
            contents,
            config
          });
          console.log(`[Gemini API] Success with model: ${modelName} on attempt ${i + 1}`);
          return res;
        } catch (error: any) {
          const status = error?.status || error?.response?.status;
          const errorMessage = error?.message || "";
          console.warn(`[Gemini API] Error with model ${modelName} (Attempt ${i + 1}): Status ${status} - ${errorMessage}`);
          
          const is503 = status === 503 || errorMessage.includes("503") || errorMessage.includes("UNAVAILABLE") || errorMessage.includes("high demand");
          const is429 = status === 429 || errorMessage.includes("429") || errorMessage.includes("quota");
          
          if ((is503 || is429) && i < maxRetries - 1) {
            const waitTime = Math.pow(2, i) * 2000 + Math.random() * 1000;
            console.log(`[Gemini API] Retrying ${modelName} in ${Math.round(waitTime)}ms...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
          throw error;
        }
      }
      throw new Error("Max retries exceeded");
    };

    let response;
    let lastError: any = null;
    const primaryModel = "gemini-3.1-pro-preview";
    const fallbackModel = "gemini-3.1-pro-preview";

    try {
      response = await attemptGeneration(primaryModel);
    } catch (error: any) {
      console.warn(`[Gemini API] Primary model (${primaryModel}) failed completely. Switching to fallback model (${fallbackModel})...`);
      try {
        response = await attemptGeneration(fallbackModel);
      } catch (fallbackError: any) {
        console.error(`[Gemini API] Fallback model (${fallbackModel}) also failed.`);
        lastError = fallbackError;
      }
    }

    if (!response && lastError) {
       throw lastError;
    }

    let jsonStr = response?.text?.trim() || "{}";
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }
    
    let data;
    try {
      data = JSON.parse(jsonStr);
      if (!data || typeof data !== 'object' || !Array.isArray(data.routine)) {
        throw new Error("Invalid structure");
      }
    } catch (e) {
      console.error("[Gemini API] Failed to parse JSON or invalid structure:", jsonStr);
      throw new Error("Invalid JSON response from AI: The model did not return the expected class schedule format.");
    }
    
    res.json({ success: true, data: data });

  } catch (error: any) {
    console.error("Extraction error:", error); 
    
    // Convert raw errors to user-friendly messages
    let userMessage = "Failed to extract routine from PDF due to an unexpected error.";
    const status = error?.status || error?.response?.status;
    const errorMsg = error?.message || "";
    
    if (status === 503 || errorMsg.includes("503") || errorMsg.includes("UNAVAILABLE") || errorMsg.includes("high demand")) {
      userMessage = "The AI service is currently experiencing extremely high demand. Please try again in a few moments.";
    } else if (status === 429 || errorMsg.includes("429") || errorMsg.includes("quota")) {
      userMessage = "Too many requests to the AI service. Please wait a minute and try again.";
    } else if (status === 400 || errorMsg.includes("400") || errorMsg.includes("Invalid")) {
      userMessage = "The uploaded PDF could not be processed. It might be corrupted, password-protected, or in an unsupported format.";
    }
    
    // If there is a specific error message from Gemini, use it instead of the generic one.
    if (!userMessage.includes("extremely high demand") && !userMessage.includes("Too many requests") && !userMessage.includes("uploaded PDF could not be processed")) {
      userMessage = errorMsg || userMessage;
    }
    res.status(500).json({ success: false, error: userMessage });
  }
});

export default app;
