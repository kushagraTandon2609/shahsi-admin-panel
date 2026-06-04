import { NextRequest, NextResponse } from 'next/server';

type ClientLogPayload = {
  type?: string;
  message?: string;
  status?: number;
  url?: string;
  page?: string;
  time?: string;
  details?: any;
};

function safeStringify(value: any) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function getBadge(type?: string) {
  const value = String(type || 'CLIENT_LOG').toUpperCase();

  if (value.includes('API')) return 'API ERROR';
  if (value.includes('BROWSER')) return 'BROWSER ERROR';
  if (value.includes('PROMISE')) return 'PROMISE ERROR';

  return value;
}

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as ClientLogPayload;

    const badge = getBadge(payload.type);
    const time = payload.time || new Date().toISOString();

    console.log('\n');
    console.log('======================================================');
    console.log(`🚨 FRONTEND ${badge}`);
    console.log('======================================================');
    console.log(`Time:    ${time}`);
    console.log(`Page:    ${payload.page || '-'}`);
    console.log(`Status:  ${payload.status || '-'}`);
    console.log(`URL:     ${payload.url || '-'}`);
    console.log(`Message: ${payload.message || '-'}`);

    if (payload.details) {
      console.log('Details:');
      console.log(safeStringify(payload.details));
    }

    console.log('======================================================');
    console.log('\n');

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error('\n');
    console.error('======================================================');
    console.error('🚨 CLIENT LOG ROUTE FAILED');
    console.error('======================================================');
    console.error(error?.message || error);
    console.error('======================================================');
    console.error('\n');

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to write client log',
      },
      { status: 500 },
    );
  }
}