/**
 * Public Google Apps Script Web App endpoint.
 * Replace the placeholder with the deployed URL ending in /exec.
 * This URL is public; user data remains protected by short-lived session tokens.
 */
export const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbx5bBsVX2_OgF5miNVJSdXJxFCL7OmLDxFYd6SDkNFB_IO4Ggfc39TvP9udmVlQmgD1/exec';

export const APP_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function appAsset(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${APP_BASE_PATH}${normalized}` || '/';
}
