import { NextResponse } from 'next/server';

export async function POST(_req: Request) {
  return NextResponse.json(
    { error: 'Service is currently disabled' },
    { status: 503 }
  );
}
