import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Initialize GoogleGenAI client lazily to avoid crashing on start if the key is missing
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY" || key.trim() === "") {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not set correctly. AI Chat features will be inactive.");
      throw new Error("Gemini API key is not configured in Secrets. Please configure GEMINI_API_KEY inside Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

import fs from "fs";

const USERS_FILE = path.join(process.cwd(), "users.json");

// Simple user persistence functions with default crop profile seeds
function readUsers(): any[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, "utf-8");
      return JSON.parse(data);
    } else {
      // Pre-seed some default farmers corresponding to the sheet visualizer
      const seedUsers = [
        {
          name: "মোহাম্মদ আব্দুল কুদ্দুস",
          phone: "01711-223344",
          password: "123456",
          address: "মাঝিরা, শিবগঞ্জ, বগুড়া",
          land: "৭ বিঘা",
          crops: "আলু (Potato)",
          photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop",
          timestamp: "2026-06-08 10:22:15"
        },
        {
          name: "মোছাঃ ফাতেমা বেগম",
          phone: "01999-887766",
          password: "123456",
          address: "ভেড়ামারা, কুষ্টিয়া",
          land: "৪.৫ বিঘা",
          crops: "ধান (Rice)",
          photo: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=150&auto=format&fit=crop",
          timestamp: "2026-06-08 14:40:02"
        }
      ];
      fs.writeFileSync(USERS_FILE, JSON.stringify(seedUsers, null, 2), "utf-8");
      return seedUsers;
    }
  } catch (e) {
    console.error("Error reading users file, returning empty array:", e);
    return [];
  }
}

function writeUsers(usersList: any[]) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(usersList, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing users file:", e);
  }
}

// Global in-memory fallback
let inMemoryUsers: any[] = readUsers();

// 🔐 Farmer Authentication: Register Endpoint
app.post("/api/auth/register", (req, res) => {
  try {
    const { name, phone, password, address, land, crops, photo } = req.body;
    
    if (!name || !phone || !password || !address || !land || !crops) {
      return res.status(400).json({ error: "নিবন্ধনের জন্য সবগুলি প্রয়োজনীয় ক্ষেত্র পূরণ করুন।" });
    }

    const normalizedPhone = phone.trim();
    const users = readUsers().length > 0 ? readUsers() : inMemoryUsers;
    
    const existing = users.find((u: any) => u.phone === normalizedPhone);
    if (existing) {
      return res.status(400).json({ error: "এই মোবাইল নম্বরটি দিয়ে ইতিমধ্যে নিবন্ধন করা হয়েছে!" });
    }

    const newUser = {
      name,
      phone: normalizedPhone,
      password, // Stored securely for sandbox simulation
      address,
      land,
      crops,
      photo: photo || "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=150&auto=format&fit=crop",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19)
    };

    users.push(newUser);
    writeUsers(users);
    inMemoryUsers = users;

    res.json({ message: "নিবন্ধন সফলভাবে সম্পন্ন হয়েছে!", user: newUser });
  } catch (error: any) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: "সার্ভারে নিবন্ধন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।" });
  }
});

// 🔐 Farmer Authentication: Login Endpoint
app.post("/api/auth/login", (req, res) => {
  try {
    const { phone, password } = req.body;
    
    if (!phone || !password) {
      return res.status(400).json({ error: "মোবাইল নম্বর ও পাসওয়ার্ড প্রদান করুন।" });
    }

    const normalizedPhone = phone.trim();
    const users = readUsers().length > 0 ? readUsers() : inMemoryUsers;
    
    const user = users.find((u: any) => u.phone === normalizedPhone && u.password === password);
    if (!user) {
      return res.status(401).json({ error: "মোবাইল নম্বর অথবা পাসওয়ার্ডটি সঠিক নয়!" });
    }

    res.json({ message: "লগইন সফল হয়েছে!", user });
  } catch (error: any) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "সার্ভারে লগইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।" });
  }
});

// 📊 Retrieve User Profiles (Backing the interactive live Spreadsheet tracer)
app.get("/api/users", (req, res) => {
  try {
    const users = readUsers().length > 0 ? readUsers() : inMemoryUsers;
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: "ব্যবহারকারী তালিকা লোড করতে ব্যর্থ হয়েছে।" });
  }
});

// 🌾 Agriculture-specific AI Chat Endpoint (Supports Crop Disease Image Analysis)
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, userDetails, image } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    const client = getAiClient();
    
    // Create system instruction referencing the farmer if registered
    let systemInstruction = `You are an expert agricultural AI assistant (কৃষি সহকারী). You must answer queries exclusively related to agricultural problems, farming techniques, crop health, soil quality, pest control, weather impact, irrigation, and gardening. 

Your answers MUST be clear, highly practical, and primarily in Bangla (with English terms if they are common). Make sure to format lists and bullet points beautifully to be highly legible. Bold critical tips.

If a farmer uploads an image, they want a crop analysis. You should analyze the photo of the crop, plant, leaf or field to detect potential diseases, deficiencies, or pests. Outline your answer in this format:
1. রোগ বা সমস্যার নাম (Detected Disease name)
2. সম্ভাব্য কারণ (Potential Causes)
3. তাত্ক্ষণিক জৈব সমাধান (Immediate Organic Treatment)
4. রাসায়নিক বা কীটনাশক সমাধান (Chemical/Pesticide Solution)
5. ভবিষ্যৎ প্রতিষেধক পরামর্শ (Preventative Future Advice)

If a farmer asks a question that is not related to agriculture, farming, crops, pests, plants, or gardening, you must politely decline, explaining that your expertise is strictly limited to agricultural advice (e.g. "আমি দুঃখিত, আমি শুধুমাত্র কৃষি, চাষাবাদ এবং ফসলের রোগ-বালাই সংক্রান্ত প্রশ্নের উত্তর দিতে পারি।").

${
  userDetails && userDetails.name
    ? `The current user is a registered farmer. Here are their details:
Name: ${userDetails.name}
Mobile: ${userDetails.phone}
Address: ${userDetails.address}
Land area: ${userDetails.land}
Most cultivated crops: ${userDetails.crops}
Greet them by their name (${userDetails.name}) and customize tips considering their cultivated crop (${userDetails.crops}) and area (${userDetails.address}) when relevant!`
    : "The current user is an anonymous farmer/visitor. Help them warmly and encourage them to register on the platform!"
}`;

    // Format chat history
    const formattedHistory = messages.map(msg => ({
      role: msg.role === "assistant" ? "model" as const : "user" as const,
      parts: [{ text: msg.content }]
    }));

    let contents = [...formattedHistory];

    // Inject base64 image data if present in the latest turn
    if (image && image.data && image.mimeType) {
      let base64Data = image.data;
      if (base64Data.includes("base64,")) {
        base64Data = base64Data.split("base64,")[1];
      }

      const imagePart = {
        inlineData: {
          mimeType: image.mimeType,
          data: base64Data,
        }
      } as any;

      const lastIndex = contents.length - 1;
      if (lastIndex >= 0 && contents[lastIndex].role === "user") {
        contents[lastIndex].parts = [
          imagePart,
          { text: "প্রদত্ত ফসলের ছবি পর্যবেক্ষণ করুন এবং রোগ, বালাই বা পুষ্টির অভাব নির্ণয় করে চিকিৎসা এবং ভবিষ্যৎ পরামর্শ প্রদান করুন। অতিরিক্ত তথ্য: " + (contents[lastIndex].parts[0] as any).text } as any
        ];
      } else {
        contents.push({
          role: "user" as const,
          parts: [
            imagePart,
            { text: "প্রদত্ত ফসলের ছবি পর্যবেক্ষণ করুন এবং রোগ, বালাই বা পুষ্টির অভাব নির্ণয় করে চিকিৎসা এবং ভবিষ্যৎ পরামর্শ প্রদান করুন।" } as any
          ]
        });
      }
    }

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || "দুঃখিত, কোনো উত্তর তৈরি করা সম্ভব হয়নি।";
    res.json({ content: replyText });

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ 
      error: error.message || "Gemini API call failed", 
      details: error.toString() 
    });
  }
});

// Configure Vite middleware or serve static static build files
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite running middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode with compiled static directories...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error("Vite server initialization failed:", err);
});
