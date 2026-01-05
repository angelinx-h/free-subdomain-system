import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { dnsRecords, subdomains, domains } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/session';
import { eq, and } from 'drizzle-orm';
import { route53Client } from '@/lib/route53/mock-client';

// DELETE - Delete DNS record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const recordId = parseInt(id);

    // Get record with subdomain and domain info
    const recordResult = await db
      .select({
        record: dnsRecords,
        subdomain: subdomains,
        domain: domains,
      })
      .from(dnsRecords)
      .leftJoin(subdomains, eq(dnsRecords.subdomainId, subdomains.id))
      .leftJoin(domains, eq(subdomains.domainId, domains.id))
      .where(eq(dnsRecords.id, recordId))
      .get();

    if (!recordResult || recordResult.subdomain?.userId !== parseInt(user.id)) {
      return NextResponse.json(
        { error: 'DNS record not found' },
        { status: 404 }
      );
    }

    // Call mock Route 53 API
    await route53Client.deleteRecord({
      zoneId: recordResult.domain!.route53ZoneId,
      recordId: recordId.toString(),
    });

    // Delete from database
    await db.delete(dnsRecords).where(eq(dnsRecords.id, recordId));

    return NextResponse.json({
      message: 'DNS record deleted successfully',
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
