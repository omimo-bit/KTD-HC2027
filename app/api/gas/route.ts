import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function gasUrl(): string {
  // GAS_API_URL is server-only. The NEXT_PUBLIC name remains as a compatibility fallback.
  const value = process.env.GAS_API_URL || process.env.NEXT_PUBLIC_GAS_API_URL;
  if (!value) throw new Error('GAS_API_URL belum diatur di Vercel Environment Variables.');
  let parsed: URL;
  try { parsed = new URL(value); } catch { throw new Error('GAS_API_URL bukan alamat URL yang valid.'); }
  if (parsed.protocol !== 'https:' || parsed.hostname !== 'script.google.com' || !/^\/macros\/s\/[^/]+\/exec$/.test(parsed.pathname)) {
    throw new Error('GAS_API_URL harus berupa Google Apps Script Web App URL yang berakhir dengan /exec.');
  }
  return parsed.toString();
}

async function forward(url: string, init: RequestInit): Promise<NextResponse> {
  const upstream = await fetch(url, { ...init, cache: 'no-store', redirect: 'follow' });
  const raw = await upstream.text();
  let payload: unknown;
  try { payload = JSON.parse(raw); }
  catch {
    const contentType = upstream.headers.get('content-type') || 'unknown';
    const finalUrl = upstream.url || url;
    const googleLogin = /accounts\.google\.com/i.test(finalUrl) || /<title>\s*(sign in|google accounts)/i.test(raw);
    const message = googleLogin
      ? 'Google Apps Script meminta login Google. Periksa deployment Web App: Execute as Me dan akses Anyone (atau akses organisasi yang sesuai).'
      : 'Google Apps Script tidak mengembalikan JSON. Pastikan URL deployment aktif berakhiran /exec, akses Web App benar, dan deployment sudah menggunakan versi kode terbaru.';
    return NextResponse.json({
      ok: false,
      error: message,
      diagnostic: { upstreamStatus: upstream.status, contentType, finalHost: (() => { try { return new URL(finalUrl).hostname; } catch { return 'unknown'; } })() }
    }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
  }

  if (!payload || typeof payload !== 'object' || !('ok' in payload)) {
    return NextResponse.json({ ok: false, error: 'Respons Apps Script berbentuk JSON, tetapi format API tidak sesuai.' }, { status: 502 });
  }
  return NextResponse.json(payload, { status: upstream.ok ? 200 : upstream.status, headers: { 'Cache-Control': 'no-store' } });
}

export async function GET(request: NextRequest) {
  try {
    const target = new URL(gasUrl());
    request.nextUrl.searchParams.forEach((value, key) => target.searchParams.set(key, value));
    return await forward(target.toString(), { method: 'GET' });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'GAS proxy error' }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    return await forward(gasUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'GAS proxy error' }, { status: 502 });
  }
}
