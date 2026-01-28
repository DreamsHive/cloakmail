export const config = {
  smtpPort: Number(process.env.SMTP_PORT) || 25,
  apiPort: Number(process.env.API_PORT) || 3000,
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  emailTtlSeconds: Number(process.env.EMAIL_TTL_SECONDS) || 86400,
  domain: process.env.DOMAIN || "localhost",
  maxEmailSizeMb: Number(process.env.MAX_EMAIL_SIZE_MB) || 10,
};
