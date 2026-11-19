import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function gasUrl() {
  const value = process.env.NEXT_PUBLIC_GAS_API_URL;
  if (!value || !value.startsWith('https://script.google.com/macros/s/')) {
    throw new Error('NEXT_PUBLIC_GAS_API_URL is missing or is not a Google Apps Script Web App URL.');
  }
  return value;
}

export async function GET(request: NextRequest) {
  try {
    const upstreamUrl = new URL(gasUrl());
    request.nextUrl.searchParams.forEach((value, key) => upstreamUrl.searchParams.set(key, value));
    const upstream = await fetch(upstreamUrl.toString(), { cache: 'no-store', redirect: 'follow' });
    const body = await upstream.text();
    return new NextResponse(body, { status: upstream.ok ? 200 : upstream.status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'GAS proxy error' }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const upstream = await fetch(gasUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body,
      cache: 'no-store',
      redirect: 'follow'
    });
    const responseBody = await upstream.text();
    return new NextResponse(responseBody, { status: upstream.ok ? 200 : upstream.status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'GAS proxy error' }, { status: 502 });
  }
}
