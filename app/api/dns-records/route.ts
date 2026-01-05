import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { dnsRecords, subdomains, domains } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/session';
import { dnsRecordSchema } from '@/lib/validations/dns-record';
import { eq, and } from 'drizzle-orm';
import { route53Client } from '@/lib/route53/mock-client';

// GET - List DNS records for a subdomain
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const searchParams = request.nextUrl.searchParams;
    const subdomainId = searchParams.get('subdomainId');

    if (!subdomainId) {
      return NextResponse.json(
        { error: 'Subdomain ID required' },
        { status: 400 }
      );
    }

    // Verify subdomain belongs to user
    const subdomain = await db
      .select()
      .from(subdomains)
      .where(
        and(
          eq(subdomains.id, parseInt(subdomainId)),
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

    const records = await db
      .select()
      .from(dnsRecords)
      .where(eq(dnsRecords.subdomainId, parseInt(subdomainId)))
      .all();

    return NextResponse.json({ records });
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}

// POST - Create DNS record
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const { subdomainId, ...recordData } = body;

    // Verify subdomain belongs to user
    const subdomainResult = await db
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

    if (!subdomainResult) {
      return NextResponse.json(
        { error: 'Subdomain not found' },
        { status: 404 }
      );
    }

    // Validate DNS record
    const validatedRecord = dnsRecordSchema.parse(recordData);

    // Call mock Route 53 API
    const route53Response = await route53Client.createRecord({
      zoneId: subdomainResult.domain!.route53ZoneId,
      name: subdomainResult.subdomain.fullDomain,
      type: validatedRecord.recordType,
      value: validatedRecord.recordValue,
      ttl: validatedRecord.ttl,
      priority: 'priority' in validatedRecord ? validatedRecord.priority : undefined,
    });

    if (!route53Response.success) {
      return NextResponse.json(
        { error: 'Failed to create DNS record' },
        { status: 500 }
      );
    }

    // Save to database
    const newRecord = await db
      .insert(dnsRecords)
      .values({
        subdomainId,
        recordType: validatedRecord.recordType,
        recordValue: validatedRecord.recordValue,
        priority: 'priority' in validatedRecord ? validatedRecord.priority : null,
        ttl: validatedRecord.ttl,
      })
      .returning()
      .get();

    return NextResponse.json(
      {
        message: 'DNS record created successfully',
        record: newRecord
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
