import fs from "fs";
import path from "path";

export interface FeedbackReport {
  id: string;
  category: "bug" | "feature" | "stream" | "other";
  status: "new" | "resolved";
  message: string;
  timestamp: string;
  userAgent: string;
}

const FALLBACK_FILE = path.join(process.cwd(), ".feedback.json");

export function getLocalStore(): Map<string, FeedbackReport> {
  try {
    if (fs.existsSync(FALLBACK_FILE)) {
      const data = fs.readFileSync(FALLBACK_FILE, "utf-8");
      return new Map(Object.entries(JSON.parse(data)));
    }
  } catch {
    // ignore
  }
  return new Map();
}

export function saveLocalStore(store: Map<string, FeedbackReport>) {
  try {
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(Object.fromEntries(store), null, 2));
  } catch {
    // ignore
  }
}
