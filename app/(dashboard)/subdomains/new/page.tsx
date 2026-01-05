import { Metadata } from 'next';
import { RegisterSubdomainForm } from '@/components/subdomains/RegisterSubdomainForm';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Register Subdomain',
  description: 'Register a new subdomain',
};

export default function NewSubdomainPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Register New Subdomain</CardTitle>
          <p className="text-sm text-gray-600">
            Choose a unique subdomain name and parent domain to get started.
          </p>
        </CardHeader>
        <CardContent>
          <RegisterSubdomainForm />
        </CardContent>
      </Card>
    </div>
  );
}
