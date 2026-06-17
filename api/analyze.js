import { GoogleGenerativeAI } from "@google/generative-ai";
import formidable from "formidable";
import fs from "fs";
import { ANALYSIS_PROMPT } from "./_prompts.js";

function safeJsonParse(rawText) {
  const cleaned = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      try {
        return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
      } catch {
        throw new Error("Model returned malformed JSON.");
      }
    }
    throw new Error("Model returned malformed JSON.");
  }
}

function parseForm(req) {
  const form = formidable({ maxFileSize: 10 * 1024 * 1024, multiples: false });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED", message: "Only POST is supported." });
  }
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "SERVER_MISCONFIGURED", message: "Server is missing its API key configuration." });
  }

  try {
    const { fields, files } = await parseForm(req);

    const uploadedFile = Array.isArray(files.screenshot) ? files.screenshot[0] : files.screenshot;
    if (!uploadedFile) {
      return res.status(400).json({ error: "NO_FILE", message: "No image file was uploaded." });
    }

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    const mimetype = uploadedFile.mimetype || uploadedFile.type;
    if (!allowedTypes.includes(mimetype)) {
      return res.status(400).json({ error: "INVALID_FILE_TYPE", message: "Only PNG, JPG, and WEBP image files are accepted." });
    }

    const fileBuffer = fs.readFileSync(uploadedFile.filepath || uploadedFile.path);
    const interestField = Array.isArray(fields.interest) ? fields.interest[0] : fields.interest;
    const interest = (interestField || "Everyday Life").trim();

    const imagePart = {
      inlineData: {
        data: fileBuffer.toString("base64"),
        mimeType: mimetype,
      },
    };

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });


    const analysisResult = await model.generateContent([ANALYSIS_PROMPT(interest), imagePart]);
let analysisJson;
try {
  analysisJson = safeJsonParse(analysisResult.response.text());
} catch {
  return res.status(502).json({ error: "MODEL_PARSE_ERROR", message: "The AI returned an unreadable response. Please try again." });
}

if (!analysisJson.valid) {
  return res.status(422).json({
    error: "INVALID_INPUT",
    message: `This doesn't look like a technical UI screenshot. ${analysisJson.reason || ""}`.trim(),
  });
}

return res.status(200).json({ success: true, data: analysisJson });
  } catch (err) {
  console.error("Analyze function error:", err.message, err.stack);
  if (err.message && err.message.includes("429")) {
    return res.status(429).json({
      error: "QUOTA_EXCEEDED",
      message: "The AI service has hit its daily free quota. Please try again later.",
    });
  }
  return res.status(500).json({
    error: "SERVER_ERROR",
    message: "Something went wrong analyzing the image. Please try again.",
  });
}
}

export const config = {
  api: {
    bodyParser: false,
  },
};