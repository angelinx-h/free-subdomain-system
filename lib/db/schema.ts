import { sqliteTable, text, integer, unique } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Users table
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Domains table (parent domains)
export const domains = sqliteTable('domains', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  domainName: text('domain_name').notNull().unique(),
  route53ZoneId: text('route53_zone_id').notNull().unique(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Subdomains table
export const subdomains = sqliteTable('subdomains', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  domainId: integer('domain_id')
    .notNull()
    .references(() => domains.id, { onDelete: 'cascade' }),
  subdomainName: text('subdomain_name').notNull(),
  fullDomain: text('full_domain').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
}, (table) => ({
  uniqueSubdomainPerDomain: unique().on(table.subdomainName, table.domainId),
}));

// DNS Records table
export const dnsRecords = sqliteTable('dns_records', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  subdomainId: integer('subdomain_id')
    .notNull()
    .references(() => subdomains.id, { onDelete: 'cascade' }),
  recordType: text('record_type', { enum: ['A', 'CNAME', 'MX'] }).notNull(),
  recordValue: text('record_value').notNull(),
  priority: integer('priority'), // For MX records only
  ttl: integer('ttl').notNull().default(3600),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Type exports for TypeScript inference
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Domain = typeof domains.$inferSelect;
export type NewDomain = typeof domains.$inferInsert;
export type Subdomain = typeof subdomains.$inferSelect;
export type NewSubdomain = typeof subdomains.$inferInsert;
export type DNSRecord = typeof dnsRecords.$inferSelect;
export type NewDNSRecord = typeof dnsRecords.$inferInsert;
