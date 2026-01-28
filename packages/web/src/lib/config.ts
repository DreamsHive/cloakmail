import { env } from '$env/dynamic/public';

export const APP_NAME = env.PUBLIC_APP_NAME || 'CloakMail';
export const EMAIL_DOMAIN = env.PUBLIC_EMAIL_DOMAIN || 'cloakmail.com';
