'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DNSRecordForm } from '@/components/dns/DNSRecordForm';
import { DNSRecordList } from '@/components/dns/DNSRecordList';
import { Loader2, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Subdomain {
  subdomain: {
    id: number;
    fullDomain: string;
    subdomainName: string;
    isActive: boolean;
    createdAt: Date;
  };
  domain: {
    domainName: string;
  };
}

interface DNSRecord {
  id: number;
  recordType: 'A' | 'CNAME' | 'MX';
  recordValue: string;
  priority: number | null;
  ttl: number;
  createdAt: Date;
}

export default function SubdomainDetailPage() {
  const params = useParams();
  const router = useRouter();
  const subdomainId = parseInt(params.id as string);

  const [subdomain, setSubdomain] = useState<Subdomain | null>(null);
  const [records, setRecords] = useState<DNSRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      // Fetch subdomain details
      const subdomainRes = await fetch(`/api/subdomains/${subdomainId}`);
      if (subdomainRes.ok) {
        const subdomainData = await subdomainRes.json();
        setSubdomain(subdomainData.subdomain);
      }

      // Fetch DNS records
      const recordsRes = await fetch(`/api/dns-records?subdomainId=${subdomainId}`);
      if (recordsRes.ok) {
        const recordsData = await recordsRes.json();
        setRecords(recordsData.records);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [subdomainId]);

  const handleDeleteSubdomain = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/subdomains/${subdomainId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/subdomains');
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to delete subdomain:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!subdomain) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Subdomain not found</p>
        <Link href="/subdomains">
          <Button className="mt-4">Back to Subdomains</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/subdomains">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Subdomains
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 break-all">
              {subdomain.subdomain.fullDomain}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <Badge variant={subdomain.subdomain.isActive ? 'default' : 'secondary'}>
                {subdomain.subdomain.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <span className="text-sm text-gray-500">
                Created {new Date(subdomain.subdomain.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Subdomain
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add DNS Record</CardTitle>
          </CardHeader>
          <CardContent>
            <DNSRecordForm subdomainId={subdomainId} onSuccess={fetchData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subdomain Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Subdomain Name</p>
              <p className="font-mono font-medium">{subdomain.subdomain.subdomainName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Parent Domain</p>
              <p className="font-mono font-medium">{subdomain.domain.domainName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total DNS Records</p>
              <p className="font-medium">{records.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>DNS Records</CardTitle>
        </CardHeader>
        <CardContent>
          <DNSRecordList records={records} onDelete={fetchData} />
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Subdomain</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{subdomain.subdomain.fullDomain}</strong>?
              This will also delete all associated DNS records. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSubdomain} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
