/**
 * Public Google Apps Script Web App endpoint.
 * Replace the placeholder with the deployed URL ending in /exec.
 * This URL is public; user data remains protected by short-lived session tokens.
 */
export const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyuIN9QvJQrJt1Hsa8xM4hatQvtzoAGRr0MtlUzY70x0IR0EO7a4RV3Em_Yw9xWG_Ry/exec';

export const APP_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function appAsset(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${APP_BASE_PATH}${normalized}` || '/';
}
