import { NextRequest, NextResponse } from 'next/server';

function safeJson(value: any) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const type = body?.type || 'CLIENT_LOG';
    const status = body?.status || 'No status';
    const isError =
      String(type).toUpperCase().includes('ERROR') ||
      body?.level === 'error' ||
      Number(status) >= 400;

    const log = isError ? console.error : console.log;
    const title = isError ? 'FRONTEND CLIENT ERROR' : 'FRONTEND CLIENT LOG';

    log('');
    log(`================ ${title} ================`);
    log('Time:', new Date().toISOString());
    log('Page:', body?.page || 'unknown');
    log('Type:', type);
    log('Action:', body?.action || 'No action');
    log('Message:', body?.message || 'No message');
    log('Status:', status);
    log('URL:', body?.url || 'No URL');
    log('Details:', safeJson(body?.details || {}));
    log('======================================================');
    log('');

    return NextResponse.json({ ok: true, success: true });
  } catch (error) {
    console.error('');
    console.error('================ CLIENT LOG ROUTE ERROR ================');
    console.error('Time:', new Date().toISOString());
    console.error('Failed to log client message:', error);
    console.error('========================================================');
    console.error('');

    return NextResponse.json({ ok: false }, { status: 500 });
  }
}