import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const PORT = 3000;

// Lazy initialize Gemini client to prevent crashing on boot if key is missing
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please set it in the Settings > Secrets panel of your AI Studio UI.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();

  // Allow larger image payloads up to 15MB
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ limit: "15mb", extended: true }));

  // API endpoints
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/analyze-landmark", async (req, res) => {
    try {
      const { image, mimeType, latitude, longitude } = req.body;

      if (!image) {
        return res.status(400).json({ error: "No image file provided." });
      }

      // 1. Initialize Gemini
      const ai = getGeminiClient();

      // 2. Prepare visual and prompt content
      const imagePart = {
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: image,
        },
      };

      const prompt = `You are a world-class, charming, and highly knowledgeable local Tour Guide.
Analyze the landmark shown in this image.
${latitude && longitude ? `The user is currently near Latitude: ${latitude}, Longitude: ${longitude}. Use these coordinates to tailor dining and hidden gem recommendations specifically to their walking radius!` : ""}

First, identify the landmark and location clearly.
You MUST provide the response in two distinct parts, separated by this exact delimiter line on its own:
===DELIMITER===

PART 1: JSON metadata block. Output ONLY a valid JSON object matching this TypeScript structure:
{
  "name": "Landmark Name",
  "location": "City, Country",
  "latitude": 48.8584,
  "longitude": 2.2945,
  "year": "Year built or opened, e.g. 1889",
  "category": "Historical Site / Monument / Modern Architecture / Museum / Nature Park / Religious Site",
  "confidence": "High" | "Medium" | "Low",
  "funFact": "One fascinating, short, mind-blowing fun fact."
}

PART 2: Comprehensive Tour Guide. Use Google Search grounding to gather accurate, historical, and up-to-date facts, including:
1. **The Tour Guide's Story**: A warm, engaging narrative about the landmark. Weave in fascinating anecdotes, rich historical facts, and tell the user why this place is so special. Talk to them direct as a friendly guide.
2. **Nearby Local Dining**: Highlight 3 outstanding, authentic dining options nearby (cafés, street food, traditional restaurants, or hidden culinary spots) with brief descriptions of what to order.
3. **Hidden Gems**: Reveal 2-3 lesser-known surrounding spots, secret viewing points, or interesting detours within walking distance that regular tourists often miss.

Make sure to format PART 2 beautifully in clean, high-contrast Markdown, using elegant typography styles. Do not write any preamble before the JSON in PART 1, and start PART 2 immediately after the ===DELIMITER=== marker. Do not include markdown code ticks (\`\`\`) around the JSON block itself, just output the raw JSON object.`;

      const textPart = { text: prompt };

      console.log(`[Server] Analyzing image with gemini-3.5-flash and search grounding...`);
      
      // 3. Request Gemini with search grounding
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: { parts: [imagePart, textPart] },
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const responseText = response.text || "";
      console.log(`[Server] Received response from Gemini.`);

      // 4. Parse the output
      const delimiterIndex = responseText.indexOf("===DELIMITER===");
      let jsonPart = "";
      let markdownPart = "";

      if (delimiterIndex !== -1) {
        jsonPart = responseText.substring(0, delimiterIndex).trim();
        markdownPart = responseText.substring(delimiterIndex + "===DELIMITER===".length).trim();
      } else {
        // Fallback robust parsing: check if there's a JSON block somewhere
        const jsonMatch = responseText.match(/\{[\s\S]*?\}/);
        if (jsonMatch) {
          jsonPart = jsonMatch[0];
          markdownPart = responseText.replace(jsonPart, "").trim();
        } else {
          markdownPart = responseText;
        }
      }

      // Try to parse JSON metadata
      let metadata = {
        name: "Unknown Landmark",
        location: "Unknown Location",
        latitude: latitude || 0,
        longitude: longitude || 0,
        year: "Historical",
        category: "Cultural Landmark",
        confidence: "Low",
        funFact: "This landmark is waiting to share its secrets with you!"
      };

      try {
        if (jsonPart) {
          // Clean up model response JSON indicators (just in case they output ```json ... ``` anyway)
          const cleanJsonPart = jsonPart
            .replace(/^```json/, "")
            .replace(/^```/, "")
            .replace(/```$/, "")
            .trim();
          metadata = { ...metadata, ...JSON.parse(cleanJsonPart) };
        }
      } catch (e) {
        console.warn("[Server] Metdata JSON parsing failed. raw value was:", jsonPart, e);
      }

      // Extract Grounding Chunks (search reference links)
      let sourceLinks: Array<{ title: string; url: string }> = [];
      const grounds = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (grounds && Array.isArray(grounds)) {
        sourceLinks = grounds
          .filter(g => g.web && g.web.uri)
          .map(g => ({
            title: g.web.title || "Web Reference",
            url: g.web.uri
          }));
      }

      res.json({
        metadata,
        markdown: markdownPart || "### Landmark Analysis Complete\n\nI couldn't generate the narrative description, but I tracked down basic stats for this incredible landmark.",
        sources: sourceLinks,
      });

    } catch (error: any) {
      console.error("[Server] Error in analyze-landmark:", error);
      
      let errorMsg = error.message || "An error occurred while recognizing the landmark.";
      const isQuotaExceeded = 
        errorMsg.includes("429") || 
        errorMsg.includes("RESOURCE_EXHAUSTED") || 
        JSON.stringify(error).includes("429") || 
        JSON.stringify(error).includes("RESOURCE_EXHAUSTED");

      if (isQuotaExceeded) {
        errorMsg = "Your Gemini API Key has temporarily exceeded its rate limits/quota (Resource Exhausted). Because the free tier has strict limits, please wait 60 seconds before clicking Try Again, or supply your own unrestricted Gemini API Key under the Secrets panel in AI Studio Settings (Key: GEMINI_API_KEY).";
      }

      res.status(500).json({
        error: errorMsg
      });
    }
  });

  // Vite middleware for development / Static file serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log(`[Server] Integrated Vite Dev Middleware.`);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log(`[Server] Serving production static files from ${distPath}`);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Web application running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
