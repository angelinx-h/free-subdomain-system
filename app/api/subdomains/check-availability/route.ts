import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subdomains } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const subdomainName = searchParams.get('name');
    const domainId = searchParams.get('domainId');

    if (!subdomainName || !domainId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const existing = await db
      .select()
      .from(subdomains)
      .where(
        and(
          eq(subdomains.subdomainName, subdomainName),
          eq(subdomains.domainId, parseInt(domainId))
        )
      )
      .get();

    return NextResponse.json({
      available: !existing,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    );
  }
}
