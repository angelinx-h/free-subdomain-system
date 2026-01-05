'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Trash2 } from 'lucide-react';

interface DNSRecord {
  id: number;
  recordType: 'A' | 'CNAME' | 'MX';
  recordValue: string;
  priority: number | null;
  ttl: number;
  createdAt: Date;
}

interface DNSRecordListProps {
  records: DNSRecord[];
  onDelete: () => void;
}

export function DNSRecordList({ records, onDelete }: DNSRecordListProps) {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/dns-records/${deleteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onDelete();
      }
    } catch (error) {
      console.error('Failed to delete record:', error);
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  if (records.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No DNS records configured yet. Add your first record above.
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>TTL</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell>
                <Badge variant="outline">{record.recordType}</Badge>
              </TableCell>
              <TableCell className="font-mono text-sm">{record.recordValue}</TableCell>
              <TableCell>{record.priority || '-'}</TableCell>
              <TableCell>{record.ttl}s</TableCell>
              <TableCell className="text-sm text-gray-500">
                {new Date(record.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteId(record.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete DNS Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this DNS record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
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
    </>
  );
}
