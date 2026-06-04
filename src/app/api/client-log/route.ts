import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.error('\n================ FRONTEND CLIENT ERROR ================');
    console.error('Time:', new Date().toISOString());
    console.error('Page:', body?.page || 'unknown');
    console.error('Type:', body?.type || 'unknown');
    console.error('Message:', body?.message || 'No message');
    console.error('Status:', body?.status || 'No status');
    console.error('URL:', body?.url || 'No URL');
    console.error('Details:', body?.details || {});
    console.error('======================================================\n');

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to log client error:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}