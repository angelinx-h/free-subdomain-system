import { Metadata } from 'next';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { subdomains, domains } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'My Subdomains',
  description: 'Manage your subdomains',
};

export default async function SubdomainsPage() {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Subdomains</h1>
        <Link href="/subdomains/new">
          <Button>Register New Subdomain</Button>
        </Link>
      </div>

      {userSubdomains.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500 mb-4">
              You haven&apos;t registered any subdomains yet.
            </p>
            <Link href="/subdomains/new">
              <Button>Register Your First Subdomain</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {userSubdomains.map(({ subdomain, domain }) => (
            <Card key={subdomain.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">
                  <Link
                    href={`/subdomains/${subdomain.id}`}
                    className="text-blue-600 hover:underline break-all"
                  >
                    {subdomain.fullDomain}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge variant={subdomain.isActive ? 'default' : 'secondary'}>
                      {subdomain.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Parent Domain:</span>
                    <span className="font-mono text-xs">{domain?.domainName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="text-xs">
                      {new Date(subdomain.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mt-4">
                    <Link href={`/subdomains/${subdomain.id}`}>
                      <Button variant="outline" className="w-full">
                        Manage DNS Records
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
