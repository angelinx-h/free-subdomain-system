# Free Subdomain Registration System - Implementation Plan

## Overview
Build a Next.js 13+ full-stack application for free subdomain registration and DNS management using App Router, NextAuth.js, Tailwind CSS, shadcn/ui, TypeScript, SQLite (with Drizzle ORM), and mock AWS Route 53 API.

## Tech Stack Confirmed
- **Framework**: Next.js (App Router)
- **Auth**: NextAuth.js (credentials provider)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: SQLite with Drizzle ORM
- **Language**: TypeScript

## Implementation Phases

### Phase 1: Project Foundation & Setup
**Goal**: Initialize Next.js project, install dependencies, configure tooling

**Tasks**:
1. Initialize Next.js with TypeScript, Tailwind, App Router
2. Install core dependencies:
   - next-auth, bcryptjs, better-sqlite3, drizzle-orm, drizzle-kit
   - zod, react-hook-form, @hookform/resolvers
   - @types/bcryptjs, @types/better-sqlite3 (dev)
3. Initialize shadcn/ui and install components: button, card, input, label, form, table, dialog, select, badge, alert, toast, dropdown-menu, separator
4. Create `.env.local` and `.env.example` with:
   - DATABASE_URL="file:./data/subdomain.db"
   - NEXTAUTH_SECRET (generate with openssl)
   - NEXTAUTH_URL="http://localhost:3000"
   - MOCK_ROUTE53_ENABLED="true"
5. Update `.gitignore` to exclude `/data/` and `.env.local`

**Key Files**:
- `package.json` - dependency management
- `.env.local` - environment variables
- `components.json` - shadcn/ui config

---

### Phase 2: Database Schema & Setup
**Goal**: Define and initialize SQLite database with Drizzle ORM

**Tasks**:
1. Create database schema with 4 tables:
   - `users` (id, email, passwordHash, createdAt, updatedAt)
   - `domains` (id, domainName, route53ZoneId, isActive, createdAt)
   - `subdomains` (id, userId, domainId, subdomainName, fullDomain, isActive, createdAt, updatedAt)
   - `dns_records` (id, subdomainId, recordType, recordValue, priority, ttl, createdAt, updatedAt)
2. Configure Drizzle ORM with better-sqlite3 driver
3. Generate and push migrations
4. Create seed script to populate initial parent domains

**Key Files**:
- `lib/db/schema.ts` - Drizzle schema definitions
- `lib/db/index.ts` - database connection
- `lib/db/seed.ts` - seed data script
- `drizzle.config.ts` - Drizzle configuration

**Database Schema**:
```typescript
// Users: authentication
users { id, email (unique), passwordHash, createdAt, updatedAt }

// Domains: parent domains (e.g., example1.com, example2.com)
domains { id, domainName (unique), route53ZoneId (unique), isActive, createdAt }

// Subdomains: user-registered subdomains
subdomains { id, userId (FK), domainId (FK), subdomainName, fullDomain, isActive, createdAt, updatedAt }
// UNIQUE constraint on (subdomainName, domainId)

// DNS Records: A, CNAME, MX records
dns_records { id, subdomainId (FK), recordType, recordValue, priority, ttl, createdAt, updatedAt }
```

---

### Phase 3: Authentication System
**Goal**: Implement NextAuth.js with email/password authentication

**Tasks**:
1. Create password hashing utilities (bcrypt)
2. Configure NextAuth.js with credentials provider
3. Create NextAuth API route handler
4. Set up middleware for route protection
5. Create type definitions for NextAuth session
6. Build user registration API endpoint
7. Create login and registration UI pages and forms

**Key Files**:
- `lib/auth/password.ts` - password hashing utilities
- `lib/auth/authOptions.ts` - NextAuth configuration
- `lib/auth/session.ts` - session helper functions
- `lib/validations/auth.ts` - Zod validation schemas
- `app/api/auth/[...nextauth]/route.ts` - NextAuth handler
- `app/api/register/route.ts` - user registration endpoint
- `middleware.ts` - protect /dashboard and /subdomains routes
- `types/next-auth.d.ts` - TypeScript type augmentation
- `app/(auth)/layout.tsx` - minimal auth layout
- `app/(auth)/login/page.tsx` - login page
- `app/(auth)/register/page.tsx` - registration page
- `components/auth/LoginForm.tsx` - login form component
- `components/auth/RegisterForm.tsx` - registration form component

**Auth Flow**:
- User registers → hash password → save to DB
- User logs in → verify password → create JWT session
- Protected routes → middleware checks session → redirect if not authenticated

---

### Phase 4: Subdomain Registration
**Goal**: Enable users to register subdomains under available parent domains

**Tasks**:
1. Create subdomain validation schema (DNS-compliant names)
2. Build domains API to list available parent domains
3. Build subdomains API for CRUD operations
4. Create availability checker API endpoint
5. Build dashboard layout with navigation
6. Create dashboard page with statistics
7. Create subdomain registration form with real-time availability
8. Create subdomain list page

**Key Files**:
- `lib/validations/subdomain.ts` - subdomain validation with Zod
- `app/api/domains/route.ts` - GET available domains
- `app/api/subdomains/route.ts` - GET user subdomains, POST create subdomain
- `app/api/subdomains/[id]/route.ts` - GET, PATCH, DELETE specific subdomain
- `app/api/subdomains/check-availability/route.ts` - availability checker
- `app/(dashboard)/layout.tsx` - dashboard layout with navbar
- `app/(dashboard)/dashboard/page.tsx` - dashboard with stats
- `app/(dashboard)/subdomains/page.tsx` - list all subdomains
- `app/(dashboard)/subdomains/new/page.tsx` - registration form
- `components/subdomains/RegisterSubdomainForm.tsx` - form with availability check
- `components/subdomains/SubdomainList.tsx` - subdomain listing
- `components/subdomains/SubdomainCard.tsx` - individual subdomain display
- `components/layout/Navbar.tsx` - navigation component

**Features**:
- List available parent domains from DB
- Real-time subdomain availability checking (debounced)
- DNS-compliant validation (lowercase, alphanumeric, hyphens)
- Prevent duplicate registrations (unique constraint)
- Generate full domain name (subdomain + parent domain)

---

### Phase 5: DNS Record Management
**Goal**: Enable users to manage A, CNAME, and MX DNS records with mock Route 53 integration

**Tasks**:
1. Create mock AWS Route 53 client (simulates API)
2. Create DNS record validation schemas (type-specific)
3. Build DNS records API endpoints
4. Create DNS record management UI
5. Build subdomain detail page with DNS record table

**Key Files**:
- `lib/route53/types.ts` - Route 53 TypeScript types
- `lib/route53/mock-client.ts` - mock Route 53 API client
- `lib/validations/dns-record.ts` - A/CNAME/MX validation schemas
- `app/api/dns-records/route.ts` - GET list, POST create
- `app/api/dns-records/[id]/route.ts` - GET, PATCH, DELETE record
- `app/(dashboard)/subdomains/[id]/page.tsx` - subdomain detail page
- `components/dns/DNSRecordForm.tsx` - add/edit DNS record form
- `components/dns/DNSRecordList.tsx` - list of DNS records
- `components/dns/DNSRecordTable.tsx` - table display
- `components/dns/RecordTypeSelector.tsx` - record type dropdown

**DNS Record Types & Validation**:
- **A Record**: IPv4 address (regex: `^((25[0-5]|...)\.){4}$`)
- **CNAME Record**: Domain name (regex: `^([a-z0-9-]+\.)+[a-z]{2,}$`)
- **MX Record**: Mail server domain + priority (0-65535)
- All records have TTL (60-86400 seconds, default 3600)

**Mock Route 53 Flow**:
1. User creates/updates/deletes DNS record via UI
2. API validates input with Zod schema
3. API calls mock Route 53 client
4. Mock client simulates AWS API (logs, delays, returns success)
5. API saves record to SQLite database
6. UI updates with success message

---

### Phase 6: UI Polish & Shared Components
**Goal**: Create reusable components and polish user experience

**Tasks**:
1. Create shared utility components
2. Add loading states and error handling
3. Implement toast notifications
4. Add confirmation dialogs for destructive actions
5. Ensure responsive design
6. Add proper ARIA labels for accessibility

**Key Files**:
- `components/shared/LoadingSpinner.tsx` - loading indicator
- `components/shared/ErrorMessage.tsx` - error display
- `components/shared/ConfirmDialog.tsx` - confirmation modal
- `components/layout/Footer.tsx` - site footer
- `lib/utils/cn.ts` - Tailwind class merge utility
- `lib/utils/formatters.ts` - date/string formatters
- `lib/constants.ts` - app constants

**UX Enhancements**:
- Loading spinners during API calls
- Toast notifications for success/error feedback
- Confirmation dialog before deleting subdomains/records
- Form validation error highlighting
- Responsive design (mobile-first)
- Keyboard navigation support

---

## Critical File Structure

```
/Users/angelinahe/workspace/free-subdomain-system/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/page.tsx
│   │   ├── subdomains/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── register/route.ts
│   │   ├── domains/route.ts
│   │   ├── subdomains/
│   │   │   ├── route.ts
│   │   │   ├── [id]/route.ts
│   │   │   └── check-availability/route.ts
│   │   └── dns-records/
│   │       ├── route.ts
│   │       └── [id]/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/ (shadcn/ui components)
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── subdomains/
│   │   ├── RegisterSubdomainForm.tsx
│   │   ├── SubdomainList.tsx
│   │   └── SubdomainCard.tsx
│   ├── dns/
│   │   ├── DNSRecordForm.tsx
│   │   ├── DNSRecordList.tsx
│   │   └── DNSRecordTable.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   └── shared/
│       ├── LoadingSpinner.tsx
│       ├── ErrorMessage.tsx
│       └── ConfirmDialog.tsx
├── lib/
│   ├── db/
│   │   ├── schema.ts (CRITICAL)
│   │   ├── index.ts
│   │   ├── seed.ts
│   │   └── migrations/
│   ├── auth/
│   │   ├── authOptions.ts (CRITICAL)
│   │   ├── password.ts
│   │   └── session.ts
│   ├── route53/
│   │   ├── mock-client.ts (CRITICAL)
│   │   └── types.ts
│   ├── validations/
│   │   ├── auth.ts
│   │   ├── subdomain.ts
│   │   └── dns-record.ts
│   └── utils/
│       ├── cn.ts
│       └── formatters.ts
├── types/
│   ├── next-auth.d.ts
│   └── index.ts
├── data/
│   └── subdomain.db (gitignored)
├── middleware.ts
├── drizzle.config.ts
├── .env.local (gitignored)
├── .env.example
└── package.json
```

## Key Technical Decisions

1. **Drizzle ORM over Prisma**: Lighter weight, better SQLite support, SQL-like queries
2. **Route Groups**: `(auth)` and `(dashboard)` for clean URLs with separate layouts
3. **JWT Sessions**: Stateless auth, no session storage needed
4. **React Hook Form + Zod**: Type-safe validation, excellent performance
5. **Mock Route 53 First**: Development without AWS, easy migration path later

## Success Criteria

- ✅ Users can register and authenticate
- ✅ Users can register subdomains under multiple parent domains
- ✅ Real-time availability checking works
- ✅ Users can create/edit/delete A, CNAME, and MX records
- ✅ All DNS operations validated and saved to DB
- ✅ Mock Route 53 API simulates AWS behavior
- ✅ Responsive UI with loading states and error handling
- ✅ No security vulnerabilities (password hashing, authorization checks)

## Execution Order

1. Phase 1: Foundation → install deps, configure tools
2. Phase 2: Database → schema, migrations, seed data
3. Phase 3: Auth → NextAuth setup, login/register
4. Phase 4: Subdomains → registration, availability, listing
5. Phase 5: DNS → record management, mock Route 53
6. Phase 6: Polish → shared components, UX improvements

**Estimated effort**: ~15 development sessions (comprehensive MVP)

## Migration Path to Production

When ready for production AWS Route 53:
1. Install `@aws-sdk/client-route-53`
2. Create `lib/route53/real-client.ts` matching mock interface
3. Configure AWS credentials in environment
4. Update imports to use real client
5. Test in staging environment first
