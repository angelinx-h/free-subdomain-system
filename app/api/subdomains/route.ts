import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subdomains, domains } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/session';
import { subdomainSchema } from '@/lib/validations/subdomain';
import { eq, and } from 'drizzle-orm';

// GET - List user's subdomains
export async function GET() {
  try {
    const user = await requireAuth();

    const userSubdomains = await db
      .select({
        subdomain: subdomains,
        domain: domains,
      })
      .from(subdomains)
      .leftJoin(domains, eq(subdomains.domainId, domains.id))
      .where(eq(subdomains.userId, parseInt(user.id)))
      .all();

    return NextResponse.json({ subdomains: userSubdomains });
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}

// POST - Create new subdomain
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    // Validate input
    const validatedData = subdomainSchema.parse(body);

    // Check if subdomain already exists
    const existing = await db
      .select()
      .from(subdomains)
      .where(
        and(
          eq(subdomains.subdomainName, validatedData.subdomainName),
          eq(subdomains.domainId, validatedData.domainId)
        )
      )
      .get();

    if (existing) {
      return NextResponse.json(
        { error: 'Subdomain already taken' },
        { status: 400 }
      );
    }

    // Get parent domain
    const domain = await db
      .select()
      .from(domains)
      .where(eq(domains.id, validatedData.domainId))
      .get();

    if (!domain) {
      return NextResponse.json(
        { error: 'Invalid domain' },
        { status: 400 }
      );
    }

    const fullDomain = `${validatedData.subdomainName}.${domain.domainName}`;

    // Create subdomain
    const newSubdomain = await db
      .insert(subdomains)
      .values({
        userId: parseInt(user.id),
        domainId: validatedData.domainId,
        subdomainName: validatedData.subdomainName,
        fullDomain,
      })
      .returning()
      .get();

    return NextResponse.json(
      {
        message: 'Subdomain registered successfully',
        subdomain: newSubdomain
      },
      { status: 201 }
    );
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
