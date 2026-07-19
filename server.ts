import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();   // 👈 Ye line pehle honi chahiye

app.use(cors({
  origin: [
    "https://nexvolt-website-olive.vercel.app",
    "http://localhost:5173"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.options("*", cors());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// --- KNOWLEDGE BASE CACHE ---
let knowledgeCache = {
  lastUpdated: null,
  products: [],
  categories: [],
  sports: [],
  blogs: [],
  contextString: ""
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function refreshKnowledge() {
  console.log("[NEXAI] Refreshing Knowledge Base...");
  
  try {
    // 1. Fetch Products
    // Including stock, rating, reviews if they exist, otherwise handled gracefully
    const { data: products } = await supabase
      .from('products')
      .select('id, name, description, short_description, price, sale_price, category, sport, stock, rating, reviews')
      .eq('active', true);
      
    // 2. Fetch Categories
    const { data: categories } = await supabase
      .from('categories')
      .select('*');
      
    // 3. Fetch Sports
    const { data: sports } = await supabase
      .from('sports')
      .select('*');
      
    // 4. Fetch Blogs (published only)
    let blogs = [];
    try {
      const { data } = await supabase
        .from('blogs')
        .select('*')
        .eq('status', 'published');
      if (data) blogs = data;
    } catch(e) {}

    knowledgeCache.products = products || [];
    knowledgeCache.categories = categories || [];
    knowledgeCache.sports = sports || [];
    knowledgeCache.blogs = blogs || [];
    knowledgeCache.lastUpdated = Date.now();

    // Build the string context
    let ctx = "==================== NEXVOLT KNOWLEDGE BASE ====================\n";
    ctx += "This is live, up-to-date information from the database.\n\n";
    
    // Products
    if (knowledgeCache.products.length > 0) {
      ctx += "--- PRODUCTS ---\n";
      knowledgeCache.products.forEach(p => {
        // If stock is zero, do not include or mark as out of stock
        const stockStr = (p.stock !== undefined && p.stock <= 0) ? "[OUT OF STOCK - DO NOT RECOMMEND]" : "[IN STOCK]";
        
        ctx += `ID: ${p.id}\nName: ${p.name} ${stockStr}
- Category: ${p.category || 'N/A'}
- Sport: ${p.sport || 'General'}
- Price: ₹${p.sale_price || p.price} (Original: ₹${p.price})
- Rating: ${p.rating || 'N/A'} (${p.reviews || 0} reviews)
- Short Description: ${p.short_description || ''}
- Description: ${p.description || ''}\n\n`;
      });
    }

    // Categories
    if (knowledgeCache.categories.length > 0) {
      ctx += "--- CATEGORIES ---\n";
      knowledgeCache.categories.forEach(c => {
        ctx += `Name: ${c.name}\nDescription: ${c.description || ''}\n\n`;
      });
    }

    // Sports
    if (knowledgeCache.sports.length > 0) {
      ctx += "--- SPORTS ---\n";
      knowledgeCache.sports.forEach(s => {
        ctx += `Name: ${s.name}\nDescription: ${s.description || ''}\n\n`;
      });
    }
    
    // Blogs
    if (knowledgeCache.blogs.length > 0) {
      ctx += "--- PUBLISHED BLOGS & GUIDES ---\n";
      knowledgeCache.blogs.forEach(b => {
        ctx += `Title: ${b.title}\nExcerpt: ${b.excerpt || ''}\nContent: ${b.content || ''}\n\n`;
      });
    }
    
    ctx += "=================================================================\n";
    knowledgeCache.contextString = ctx;
    
    console.log("[NEXAI] Knowledge Base Refreshed Successfully.");
    return true;
  } catch (err) {
    console.error("[NEXAI] Error refreshing knowledge base:", err);
    return false;
  }
}

async function startServer() {
  const PORT = 3000;

  app.use(express.json());

const rateLimits = new Map();
const RATE_LIMIT_WINDOW_MS = 60000;
const MAX_REQUESTS_PER_WINDOW = 10;

  
  // Initial knowledge load
  await refreshKnowledge();
  
  // Setup auto-refresh every 5 minutes
  setInterval(refreshKnowledge, CACHE_TTL);

  // Admin endpoint to force refresh
  app.post("/api/nexai/refresh", async (req, res) => {
    const success = await refreshKnowledge();
    if (success) {
      res.json({ success: true, message: "Knowledge base refreshed successfully." });
    } else {
      res.status(500).json({ success: false, error: "Failed to refresh knowledge base." });
    }
  });

  app.post("/api/nexai/chat", async (req, res) => {

    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const userRequests = rateLimits.get(ip) || [];
    const validRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW_MS);
    
    if (validRequests.length >= MAX_REQUESTS_PER_WINDOW) {
      console.warn("Rate limit exceeded for IP:", ip);
      return res.status(429).json({ error: "Too many requests. Please try again later." });
    }
    
    validRequests.push(now);
    rateLimits.set(ip, validRequests);

    const { messages, userId, pageContext } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
       console.error("Validation failed: Messages array missing or empty");
       return res.status(400).json({ error: "Invalid request payload" });
    }

    try {
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Invalid messages array" });
      }

      // Check cache freshness just in case
      if (!knowledgeCache.lastUpdated || (Date.now() - knowledgeCache.lastUpdated > CACHE_TTL)) {
        await refreshKnowledge();
      }

      // 1. Fetch AI Settings
      const { data: aiSettings } = await supabase
        .from('nexai_settings')
        .select('*')
        .maybeSingle();

      const isAiEnabled = aiSettings ? aiSettings.ai_enabled : true;

      if (!isAiEnabled) {
        return res.json({ response: JSON.stringify({ response: "I am currently offline for maintenance. Please check back later." }) });
      }

      const temperature = aiSettings?.temperature || 0.7;
      const modelName = "gemini-2.5-flash";
      const baseSystemPrompt = aiSettings?.system_prompt || `You are NEXAI, a professional sports nutrition coach and personal assistant for the NEXVOLT website.

CRITICAL RULES:
1. You must ONLY recommend NEXVOLT products from the catalog provided below.
2. NEVER invent, hallucinate, or suggest products that are not in the provided catalog.
3. NEVER recommend competitor brands.
4. If a user asks for a product that does not exist in the catalog, you MUST say exactly: "Currently we don't have this product in our catalog."
5. Behave like a professional sports nutrition coach. Keep responses concise, friendly, and conversational.
6. Before recommending products (e.g. if the user asks "Which protein should I buy?"), FIRST ask follow-up questions to understand their needs (e.g., What sport do you play? What's your goal? What's your age? What's your budget? What's your weight? Training frequency?). Do NOT recommend immediately if you lack this context.
7. NEVER ask the same question twice if the information already exists in the USER PROFILE.
8. If required information is missing, ask naturally inside the conversation. Do not display any form.
9. NEVER answer with medical diagnoses or provide medical advice. If the question is medical, suggest consulting a healthcare professional.
10. Do not mention that you are an AI developed by Google.
11. You MUST ALWAYS respond with a JSON object. Do not include markdown json blocks, just the raw JSON object.
12. When you have gathered enough info to make a recommendation, your Markdown response must include a personalized recommendation summary (Athlete Profile, Primary Goal, Current Sport, Training Frequency, Recommended Daily Supplement Timing, Estimated Monthly Cost, Key Nutrition Tips, Hydration Tips, Recovery Tips). Also populate 'recommended_products' with product IDs.`;

      // RAG Specific Rules
      let ragRules = `
ADDITIONAL KNOWLEDGE BASE RULES:
- Use the NEXVOLT KNOWLEDGE BASE context below to answer questions about products, sports, categories, FAQs, and blogs.
- Smart Budget Optimization: If the user provides a budget (e.g. ₹2500), recommend the best possible stack within that budget. DO NOT exceed the budget.
- Personalized Coaching: Adapt answers using the USER PROFILE and PREVIOUSLY PURCHASED PRODUCTS. E.g., if they are a volleyball player, focus on vertical jump/recovery.
- If multiple products match, rank them by Relevance, Goal, Sport, and Rating. Explain WHY each recommendation was chosen.
- If stock is zero or marked [OUT OF STOCK], NEVER recommend that product.
- Daily Supplement Schedule: ALWAYS include a "Daily Supplement Schedule" section in your markdown response detailing Morning, Pre Workout, Post Workout, and Night routines using the catalog products.
- Shopping Assistant Actions: Return actionable commands (ADD_TO_CART, NAVIGATE) if you deduce the user wants to add an item to their cart or view a specific page/category based on the current context. Do NOT ask them to do it manually if you can generate the action.
- Context Awareness: The user is currently viewing the page: "${pageContext || 'Home'}". Use this context to understand references like "this product", "add this to cart".
- Smart Cross-Sell: Frequently suggest complementary products (cross_sell_products) like Creatine + Hydration.
- Follow-up Suggestions: Always provide 3 intelligent follow-up chips.
- Multilingual: Support English and Hindi. Automatically detect the user's language and reply in the same language.
- If no information exists to answer a question, say exactly: "I couldn't find that information in the current NEXVOLT knowledge base." Never hallucinate.
- NEVER ask for information twice if it's already in the USER PROFILE.
`;

      // Build safety instructions
      let safetyContext = "";
      if (aiSettings) {
        if (aiSettings.safety_toggles?.competitors) {
          safetyContext += "\n- IMPORTANT: DO NOT mention any competitor brands. If asked, pivot back to NEXVOLT.\n";
        }
        if (aiSettings.safety_toggles?.medical) {
          safetyContext += "\n- IMPORTANT: " + (aiSettings.medical_disclaimer || "Consult a healthcare professional for medical advice.") + "\n";
        }
        if (aiSettings.blocked_words && aiSettings.blocked_words.length > 0) {
          safetyContext += "\n- DO NOT use the following blocked words: " + aiSettings.blocked_words.join(", ") + "\n";
        }
        if (aiSettings.restricted_topics && aiSettings.restricted_topics.length > 0) {
          safetyContext += "\n- DO NOT discuss the following topics: " + aiSettings.restricted_topics.join(", ") + "\n";
        }
      }

      // 1. Load the existing profile if user is logged in
      let profile = null;
      let profileContext = "";
      if (userId) {
        const { data } = await supabase
          .from('user_ai_profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (data) {
          profile = data;
          profileContext = `
USER PROFILE (Do NOT ask for this information if it is already provided here):
- Name: ${profile.name || 'Unknown'}
- Age: ${profile.age || 'Unknown'}
- Gender: ${profile.gender || 'Unknown'}
- Height: ${profile.height || 'Unknown'}
- Weight: ${profile.weight || 'Unknown'}
- Sport: ${profile.sport || 'Unknown'}
- Training Frequency: ${profile.training_days || 'Unknown'}
- Goal: ${profile.goal || 'Unknown'}
- Budget: ${profile.budget || 'Unknown'}
- Dietary Preference: ${profile.diet || 'Unknown'}`;
        } else {
          // Attempt to insert an empty profile row to guarantee it exists for updates later
          await supabase.from('user_ai_profiles').insert([{ user_id: userId }]).select();
        }
      }

      const formattedMessages = messages.map((m: any) => ({
        role: m.role === "ai" ? "model" : "user",
        parts: [{ text: m.content }]
      }));

      const finalSystemInstruction = baseSystemPrompt + "\n\n" + ragRules + "\n\n" + safetyContext + "\n\n" + profileContext + "\n\n" + knowledgeCache.contextString;

      const response = await ai.models.generateContent({
        model: modelName,
        contents: formattedMessages,
        config: {
          systemInstruction: { parts: [{ text: finalSystemInstruction }] },
          temperature: temperature,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              response: { type: Type.STRING, description: "Your conversational markdown response." },
              recommended_products: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    reason: { type: Type.STRING }
                  }
                }
              },
              actions: {
                type: Type.ARRAY,
                description: "Frontend actions to execute based on user intent.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING, description: "One of: ADD_TO_CART, REMOVE_FROM_CART, NAVIGATE" },
                    payload: { 
                      type: Type.OBJECT, 
                      properties: { 
                        productId: { type: Type.STRING, nullable: true },
                        quantity: { type: Type.INTEGER, nullable: true },
                        path: { type: Type.STRING, nullable: true }
                      } 
                    }
                  }
                }
              },
              follow_up_questions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3 intelligent follow-up chips"
              },
              cross_sell_products: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    reason: { type: Type.STRING }
                  }
                }
              }
            },
            required: ["response", "follow_up_questions"]
          },
        }
      });

      const aiText = response.text;

      // Log conversation to database
      if (userId) {
        logConversation(userId, messages, aiText).catch(console.error);
        extractAndSaveProfile(userId, messages, profile).catch(err => console.error("Profile extraction failed:", err));
      }

      res.json({ response: aiText });
    } catch (error: any) {
      console.error("Error in /api/nexai/chat:", error);
      res.status(500).json({ error: "Failed to process chat request.", details: error.message, stack: error.stack });
    }
  });

  async function logConversation(userId: string, messages: any[], aiResponseText: string) {
    try {
      const summaryContent = messages[messages.length - 1]?.content || "New conversation";
      
      const newMessages = [...messages];
      try {
        const parsedResponse = JSON.parse(aiResponseText);
        newMessages.push({ role: 'ai', content: parsedResponse.response, timestamp: new Date().toISOString() });
      } catch(e) {
        newMessages.push({ role: 'ai', content: aiResponseText, timestamp: new Date().toISOString() });
      }

      await supabase.from('nexai_conversations').insert([{
        user_id: userId,
        summary: summaryContent.substring(0, 100),
        messages: newMessages
      }]);
    } catch (e) {
      console.error("Failed to log conversation:", e);
    }
  }

  // Background extraction function
  async function extractAndSaveProfile(userId: string, messages: any[], currentProfile: any) {
    // Only analyze the last few messages to save tokens and time
    const recentMessages = messages.slice(-3);
    const chatLog = recentMessages.map(m => `${m.role}: ${m.content}`).join("\n");
    
    const extractionPrompt = `Extract the user's profile information from the following conversation snippet.
Only return information that is EXPLICITLY mentioned by the user in this snippet.
If a field is not mentioned or you are unsure, leave it as null.
Do NOT guess or infer from past context.

Conversation:
${chatLog}
`;

    const extractionResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: extractionPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, nullable: true },
            age: { type: Type.STRING, nullable: true },
            gender: { type: Type.STRING, nullable: true },
            height: { type: Type.STRING, nullable: true },
            weight: { type: Type.STRING, nullable: true },
            sport: { type: Type.STRING, nullable: true },
            training_days: { type: Type.STRING, nullable: true },
            goal: { type: Type.STRING, nullable: true },
            budget: { type: Type.STRING, nullable: true },
            diet: { type: Type.STRING, nullable: true }
          }
        },
        temperature: 0.1,
      }
    });

    try {
      if (extractionResponse.text) {
        const extracted = JSON.parse(extractionResponse.text);
        
        // Prepare update payload (only include fields that are not null)
        const updatePayload: any = {};
        for (const key of Object.keys(extracted)) {
          if (extracted[key] !== null && extracted[key] !== undefined && extracted[key] !== "") {
            updatePayload[key] = extracted[key];
          }
        }

        if (Object.keys(updatePayload).length > 0) {
          updatePayload.updated_at = new Date().toISOString();
          
          await supabase
            .from('user_ai_profiles')
            .update(updatePayload)
            .eq('user_id', userId);
            
          console.log(`[NEXAI] Updated profile for user ${userId}:`, updatePayload);
        }
      }
    } catch (e) {
      console.error("Error parsing profile extraction:", e);
    }
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
