'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { dnsRecordSchema, type DNSRecordInput } from '@/lib/validations/dns-record';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface DNSRecordFormProps {
  subdomainId: number;
  onSuccess: () => void;
}

export function DNSRecordForm({ subdomainId, onSuccess }: DNSRecordFormProps) {
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [recordType, setRecordType] = useState<'A' | 'CNAME' | 'MX'>('A');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<DNSRecordInput>({
    resolver: zodResolver(dnsRecordSchema),
    defaultValues: {
      recordType: 'A',
      ttl: 3600,
    },
  });

  const handleRecordTypeChange = (type: 'A' | 'CNAME' | 'MX') => {
    setRecordType(type);
    setValue('recordType', type);
  };

  const onSubmit = async (data: DNSRecordInput) => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('/api/dns-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subdomainId, ...data }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Failed to create DNS record');
        return;
      }

      reset();
      onSuccess();
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <Alert variant="destructive">{error}</Alert>}

      <div>
        <Label htmlFor="recordType">Record Type</Label>
        <Select value={recordType} onValueChange={handleRecordTypeChange} disabled={isLoading}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A">A (IPv4 Address)</SelectItem>
            <SelectItem value="CNAME">CNAME (Canonical Name)</SelectItem>
            <SelectItem value="MX">MX (Mail Exchange)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="recordValue">
          {recordType === 'A' && 'IPv4 Address'}
          {recordType === 'CNAME' && 'Target Domain'}
          {recordType === 'MX' && 'Mail Server'}
        </Label>
        <Input
          id="recordValue"
          placeholder={
            recordType === 'A'
              ? '192.168.1.1'
              : recordType === 'CNAME'
              ? 'example.com'
              : 'mail.example.com'
          }
          {...register('recordValue')}
          disabled={isLoading}
          className="font-mono"
        />
        {errors.recordValue && (
          <p className="text-sm text-red-500 mt-1">{errors.recordValue.message}</p>
        )}
      </div>

      {recordType === 'MX' && (
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Input
            id="priority"
            type="number"
            placeholder="10"
            {...register('priority', { valueAsNumber: true })}
            disabled={isLoading}
          />
          {'priority' in errors && errors.priority && (
            <p className="text-sm text-red-500 mt-1">{errors.priority.message}</p>
          )}
        </div>
      )}

      <div>
        <Label htmlFor="ttl">TTL (seconds)</Label>
        <Input
          id="ttl"
          type="number"
          {...register('ttl', { valueAsNumber: true })}
          disabled={isLoading}
        />
        {errors.ttl && (
          <p className="text-sm text-red-500 mt-1">{errors.ttl.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating...
          </>
        ) : (
          'Add DNS Record'
        )}
      </Button>
    </form>
  );
}
