import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subdomains, domains } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/session';
import { eq, and } from 'drizzle-orm';

// GET - Get specific subdomain
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const subdomainId = parseInt(id);

    const subdomain = await db
      .select({
        subdomain: subdomains,
        domain: domains,
      })
      .from(subdomains)
      .leftJoin(domains, eq(subdomains.domainId, domains.id))
      .where(
        and(
          eq(subdomains.id, subdomainId),
          eq(subdomains.userId, parseInt(user.id))
        )
      )
      .get();

    if (!subdomain) {
      return NextResponse.json(
        { error: 'Subdomain not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ subdomain });
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}

// DELETE - Delete subdomain
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const subdomainId = parseInt(id);

    // Verify ownership
    const subdomain = await db
      .select()
      .from(subdomains)
      .where(
        and(
          eq(subdomains.id, subdomainId),
          eq(subdomains.userId, parseInt(user.id))
        )
      )
      .get();

    if (!subdomain) {
      return NextResponse.json(
        { error: 'Subdomain not found' },
        { status: 404 }
      );
    }

    // Delete subdomain (cascade will delete DNS records)
    await db
      .delete(subdomains)
      .where(eq(subdomains.id, subdomainId));

    return NextResponse.json({
      message: 'Subdomain deleted successfully',
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
