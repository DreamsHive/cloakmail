import type { SpamResult } from "./types";

const EXECUTABLE_EXTENSIONS = [
  ".exe", ".bat", ".cmd", ".scr", ".pif", ".com",
  ".vbs", ".js", ".wsh", ".ps1",
];

export async function isSpam(parsed: any): Promise<SpamResult> {
  try {
    // Check for executable attachments
    const attachments = parsed.attachments || [];
    for (const att of attachments) {
      const filename = (att.filename || "").toLowerCase();
      if (EXECUTABLE_EXTENSIONS.some((ext) => filename.endsWith(ext))) {
        return { isSpam: true, reason: "executable attachment detected" };
      }
    }

    return { isSpam: false, reason: null };
  } catch {
    return { isSpam: false, reason: null };
  }
}
