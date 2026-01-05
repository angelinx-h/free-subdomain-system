import { Metadata } from 'next';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { subdomains, dnsRecords } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Manage your subdomains',
};

export default async function DashboardPage() {
  const user = await requireAuth();

  const userSubdomains = await db
    .select()
    .from(subdomains)
    .where(eq(subdomains.userId, parseInt(user.id)))
    .all();

  const totalRecordsResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(dnsRecords)
    .leftJoin(subdomains, eq(dnsRecords.subdomainId, subdomains.id))
    .where(eq(subdomains.userId, parseInt(user.id)))
    .get();

  const totalRecords = totalRecordsResult?.count || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <Link href="/subdomains/new">
          <Button>Register New Subdomain</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Subdomains
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-gray-900">{userSubdomains.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              DNS Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-gray-900">{totalRecords}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Domains
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-gray-900">
              {userSubdomains.filter((s) => s.isActive).length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Subdomains</CardTitle>
        </CardHeader>
        <CardContent>
          {userSubdomains.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No subdomains registered yet.</p>
              <Link href="/subdomains/new">
                <Button>Register Your First Subdomain</Button>
              </Link>
            </div>
          ) : (
            <ul className="space-y-2">
              {userSubdomains.slice(0, 5).map((subdomain) => (
                <li key={subdomain.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <Link
                    href={`/subdomains/${subdomain.id}`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {subdomain.fullDomain}
                  </Link>
                  <span className="text-sm text-gray-500">
                    {new Date(subdomain.createdAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {userSubdomains.length > 5 && (
            <div className="mt-4 text-center">
              <Link href="/subdomains">
                <Button variant="outline">View All Subdomains</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
