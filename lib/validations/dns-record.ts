import { z } from 'zod';

// IPv4 validation regex
const IPV4_REGEX = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/;

// Domain name validation regex
const DOMAIN_REGEX = /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;

export const aRecordSchema = z.object({
  recordType: z.literal('A'),
  recordValue: z
    .string()
    .regex(IPV4_REGEX, 'Must be a valid IPv4 address (e.g., 192.168.1.1)'),
  ttl: z.number().int().min(60).max(86400),
});

export const cnameRecordSchema = z.object({
  recordType: z.literal('CNAME'),
  recordValue: z
    .string()
    .regex(DOMAIN_REGEX, 'Must be a valid domain name (e.g., example.com)'),
  ttl: z.number().int().min(60).max(86400),
});

export const mxRecordSchema = z.object({
  recordType: z.literal('MX'),
  recordValue: z
    .string()
    .regex(DOMAIN_REGEX, 'Must be a valid mail server domain'),
  priority: z.number().int().min(0).max(65535),
  ttl: z.number().int().min(60).max(86400),
});

export const dnsRecordSchema = z.discriminatedUnion('recordType', [
  aRecordSchema,
  cnameRecordSchema,
  mxRecordSchema,
]);

export type DNSRecordInput = z.infer<typeof dnsRecordSchema>;
export type ARecordInput = z.infer<typeof aRecordSchema>;
export type CNAMERecordInput = z.infer<typeof cnameRecordSchema>;
export type MXRecordInput = z.infer<typeof mxRecordSchema>;
