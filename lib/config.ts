/**
 * Public Google Apps Script Web App endpoint.
 * Replace the placeholder with the deployed URL ending in /exec.
 * This URL is public; user data remains protected by short-lived session tokens.
 */
export const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbw6tFwfO_oA-jkamEz6FAj-qKbywsJh0d12f43xNl7FZj_q07znehxvdOiWA9UgL_0q/exec';

export const APP_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function appAsset(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${APP_BASE_PATH}${normalized}` || '/';
}
