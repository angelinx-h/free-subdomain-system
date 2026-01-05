'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { subdomainSchema, type SubdomainInput } from '@/lib/validations/subdomain';
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
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface Domain {
  id: number;
  domainName: string;
}

export function RegisterSubdomainForm() {
  const router = useRouter();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [availability, setAvailability] = useState<{
    checking: boolean;
    available: boolean | null;
  }>({ checking: false, available: null });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SubdomainInput>({
    resolver: zodResolver(subdomainSchema),
  });

  const subdomainName = watch('subdomainName');
  const domainId = watch('domainId');

  // Fetch available domains
  useEffect(() => {
    fetch('/api/domains')
      .then((res) => res.json())
      .then((data) => setDomains(data.domains))
      .catch(console.error);
  }, []);

  // Check availability when name/domain changes
  useEffect(() => {
    if (!subdomainName || !domainId) {
      setAvailability({ checking: false, available: null });
      return;
    }

    const timer = setTimeout(async () => {
      setAvailability({ checking: true, available: null });

      try {
        const response = await fetch(
          `/api/subdomains/check-availability?name=${subdomainName}&domainId=${domainId}`
        );
        const data = await response.json();
        setAvailability({ checking: false, available: data.available });
      } catch {
        setAvailability({ checking: false, available: null });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [subdomainName, domainId]);

  const onSubmit = async (data: SubdomainInput) => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('/api/subdomains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Failed to register subdomain');
        return;
      }

      router.push('/dashboard');
      router.refresh();
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
        <Label htmlFor="subdomainName">Subdomain Name</Label>
        <Input
          id="subdomainName"
          placeholder="mysubdomain"
          {...register('subdomainName')}
          disabled={isLoading}
          className="font-mono"
        />
        {errors.subdomainName && (
          <p className="text-sm text-red-500 mt-1">
            {errors.subdomainName.message}
          </p>
        )}
        {availability.checking && (
          <div className="flex items-center gap-2 mt-1">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p className="text-sm text-gray-500">Checking availability...</p>
          </div>
        )}
        {availability.available === true && (
          <Badge variant="default" className="mt-1 bg-green-500">
            Available
          </Badge>
        )}
        {availability.available === false && (
          <Badge variant="destructive" className="mt-1">
            Not available
          </Badge>
        )}
      </div>

      <div>
        <Label htmlFor="domainId">Parent Domain</Label>
        <Select
          onValueChange={(value) => setValue('domainId', parseInt(value))}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a domain" />
          </SelectTrigger>
          <SelectContent>
            {domains.map((domain) => (
              <SelectItem key={domain.id} value={domain.id.toString()}>
                .{domain.domainName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.domainId && (
          <p className="text-sm text-red-500 mt-1">{errors.domainId.message}</p>
        )}
      </div>

      {subdomainName && domainId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Full domain:</p>
          <p className="text-lg font-mono font-bold text-blue-600">
            {subdomainName}.{domains.find((d) => d.id === domainId)?.domainName}
          </p>
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || availability.available === false}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Registering...
          </>
        ) : (
          'Register Subdomain'
        )}
      </Button>
    </form>
  );
}
