import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { domains } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const activeDomains = await db
      .select()
      .from(domains)
      .where(eq(domains.isActive, true))
      .all();

    return NextResponse.json({ domains: activeDomains });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch domains' },
      { status: 500 }
    );
  }
}
