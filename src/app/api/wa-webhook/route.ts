import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // Validasi x-api-key header
  const apiKey = req.headers.get('x-api-key');
  const expectedKey = process.env.WA_API_KEY;

  if (expectedKey && apiKey !== expectedKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { senderNumber, messageText } = body as {
    senderNumber?: unknown;
    messageText?: unknown;
  };

  if (typeof senderNumber !== 'string' || typeof messageText !== 'string') {
    return NextResponse.json(
      { error: 'senderNumber and messageText are required strings' },
      { status: 400 }
    );
  }

  console.log('[WA Webhook] Incoming message:', { senderNumber, messageText });

  return NextResponse.json({ status: 'received' }, { status: 200 });
}
