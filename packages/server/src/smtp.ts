import { SMTPServer } from "smtp-server";
import { simpleParser } from "mailparser";
import { storeEmail } from "./store";
import { isSpam } from "./spam";
import { config } from "./config";

let server: SMTPServer | null = null;

export function startSMTP(port = config.smtpPort): SMTPServer {
  server = new SMTPServer({
    authOptional: true,
    disabledCommands: ["AUTH"],
    size: config.maxEmailSizeMb * 1024 * 1024,
    onData(stream, _session, callback) {
      simpleParser(stream, async (err, parsed) => {
        if (err) return callback(err);

        const toField = parsed.to;
        const toAddr = Array.isArray(toField)
          ? toField[0]?.value?.[0]?.address
          : toField?.value?.[0]?.address;
        if (!toAddr) return callback();

        const spam = await isSpam(parsed);
        if (spam.isSpam) {
          console.log(`[spam] Rejected: ${toAddr} (reason: ${spam.reason})`);
          return callback();
        }

        const headersObj: Record<string, string> = {};
        parsed.headers.forEach((value, key) => {
          headersObj[key] = typeof value === "string" ? value : String(value);
        });

        const id = await storeEmail({
          to: toAddr,
          from: parsed.from?.value?.[0]?.address || "unknown",
          subject: parsed.subject || "(no subject)",
          text: parsed.text || "",
          html: parsed.html || "",
          headers: headersObj,
        });

        console.log(`[smtp] Stored email ${id} for ${toAddr}`);
        callback();
      });
    },
  });

  server.listen(port, () => {
    console.log(`[smtp] Listening on port ${port}`);
  });

  return server;
}

export function isSMTPRunning(): boolean {
  return server !== null;
}
