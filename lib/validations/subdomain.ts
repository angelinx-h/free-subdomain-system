import { z } from 'zod';

const SUBDOMAIN_REGEX = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;

export const subdomainSchema = z.object({
  subdomainName: z
    .string()
    .min(1, 'Subdomain name is required')
    .max(63, 'Subdomain name must be 63 characters or less')
    .regex(
      SUBDOMAIN_REGEX,
      'Subdomain must contain only lowercase letters, numbers, and hyphens. ' +
      'Cannot start or end with a hyphen.'
    ),
  domainId: z.number().int().positive('Please select a parent domain'),
});

export type SubdomainInput = z.infer<typeof subdomainSchema>;
