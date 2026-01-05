# Free Subdomain Registration System - Design Specification

## 1. Project Overview

### 1.1 Purpose
A web-based platform that enables users to register and manage free subdomains across multiple domain suffixes, with DNS record management capabilities.

### 1.2 Scope
This system provides a self-service portal for subdomain registration and DNS configuration, utilizing AWS Route 53 for DNS management. The initial implementation will use mock AWS APIs for development and testing purposes.

## 2. Technical Stack

### 2.1 Core Technologies
- **Framework**: Next.js (latest stable version)
- **Language**: TypeScript
- **Database**: SQLite
- **DNS Provider**: AWS Route 53 (with mock API for initial development)
- **Deployment**: Self-contained application in current workspace

### 2.2 Architecture Pattern
- Full-stack Next.js application
- Server-side API routes for backend logic
- Client-side React components for frontend

## 3. Functional Requirements

### 3.1 Multi-Domain Support
The system SHALL support multiple parent domains (domain suffixes) for subdomain registration.

**Examples:**
- user1.domain1.com
- user1.domain2.com
- user2.domain1.com

**Constraints:**
- Each parent domain corresponds to a separate AWS Route 53 hosted zone
- Users can register subdomains under any available parent domain
- Subdomain names must be unique within each parent domain

### 3.2 DNS Record Management
The system SHALL support the following DNS record types:

| Record Type | Description | Use Case |
|------------|-------------|----------|
| A | IPv4 Address | Point subdomain to IPv4 address |
| CNAME | Canonical Name | Alias subdomain to another domain |
| MX | Mail Exchange | Configure email servers for subdomain |

**Requirements:**
- Users can create, update, and delete DNS records for their registered subdomains
- Validation of record values based on DNS standards
- Support for multiple records per subdomain (e.g., multiple MX records)

### 3.3 User Management
The system SHALL provide:
- User authentication and authorization
- Secure login mechanism
- User session management
- Role-based access control (users can only manage their own subdomains)

## 4. Data Model

### 4.1 Database Schema (SQLite)

#### Users Table
```
users:
  - id (PRIMARY KEY)
  - email (UNIQUE, NOT NULL)
  - password_hash (NOT NULL)
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)
```

#### Domains Table (Parent Domains)
```
domains:
  - id (PRIMARY KEY)
  - domain_name (UNIQUE, NOT NULL) // e.g., "domain1.com"
  - route53_zone_id (UNIQUE, NOT NULL)
  - is_active (BOOLEAN)
  - created_at (TIMESTAMP)
```

#### Subdomains Table
```
subdomains:
  - id (PRIMARY KEY)
  - user_id (FOREIGN KEY -> users.id)
  - domain_id (FOREIGN KEY -> domains.id)
  - subdomain_name (NOT NULL) // e.g., "user1"
  - full_domain (GENERATED) // e.g., "user1.domain1.com"
  - is_active (BOOLEAN)
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)
  - UNIQUE(subdomain_name, domain_id)
```

#### DNS Records Table
```
dns_records:
  - id (PRIMARY KEY)
  - subdomain_id (FOREIGN KEY -> subdomains.id)
  - record_type (ENUM: 'A', 'CNAME', 'MX')
  - record_value (NOT NULL)
  - priority (INTEGER) // For MX records
  - ttl (INTEGER, DEFAULT 3600)
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)
```

## 5. User Interface Requirements

### 5.1 Pages and Features

#### 5.1.1 Authentication Pages
- **Login Page**: Email/password authentication
- **Registration Page**: New user signup
- **Password Reset**: Password recovery flow (future enhancement)

#### 5.1.2 User Dashboard
- Overview of all registered subdomains
- Quick actions: Register new subdomain, manage existing subdomains
- Statistics: Total subdomains, active DNS records

#### 5.1.3 Subdomain Management
- **Register Subdomain**:
  - Select parent domain from available options
  - Enter desired subdomain name
  - Real-time availability check
  - Validation feedback

- **Manage Subdomain**:
  - View subdomain details
  - Add/edit/delete DNS records
  - Delete subdomain
  - View DNS propagation status

#### 5.1.4 DNS Record Management Interface
- Add new DNS record with type selection
- Form validation for each record type
- List view of existing records with edit/delete actions
- Record type-specific input fields:
  - A Record: IPv4 address input
  - CNAME: Target domain input
  - MX: Mail server address + priority

## 6. AWS Route 53 Integration

### 6.1 Zone Management
- Each parent domain (suffix) represents a separate Route 53 hosted zone
- Zone IDs are configured in the domains table
- System manages DNS records within these zones via Route 53 API

### 6.2 Mock API Implementation
For initial development phase:
- Implement mock AWS Route 53 API responses
- Simulate DNS record creation, update, and deletion
- Store "DNS records" in SQLite database
- Provide success/error responses matching AWS API format

### 6.3 Production Integration (Future)
- Replace mock API with actual AWS SDK for JavaScript
- Implement proper AWS credentials management
- Add error handling for AWS API rate limits
- Implement retry logic for transient failures

## 7. Security Requirements

### 7.1 Authentication
- Secure password hashing (bcrypt or similar)
- Session-based or JWT authentication
- HTTPS enforcement for production

### 7.2 Authorization
- Users can only access their own subdomains
- Server-side validation of all requests
- Protection against common vulnerabilities (XSS, CSRF, SQL Injection)

### 7.3 Input Validation
- Subdomain name validation (DNS-compliant)
- DNS record value validation by type
- Rate limiting for subdomain registration

## 8. Development Phases

### Phase 1: Foundation (MVP)
- [ ] Project setup (Next.js + TypeScript)
- [ ] SQLite database schema implementation
- [ ] User authentication system
- [ ] Basic UI layout and navigation

### Phase 2: Core Features
- [ ] Subdomain registration flow
- [ ] DNS record management interface
- [ ] Mock Route 53 API implementation
- [ ] User dashboard

### Phase 3: Enhancement
- [ ] Multi-domain support
- [ ] Advanced DNS record features
- [ ] User profile management
- [ ] Error handling and validation improvements

### Phase 4: Production Ready
- [ ] Actual AWS Route 53 integration
- [ ] Security hardening
- [ ] Performance optimization
- [ ] Production deployment

## 9. Technical Constraints

- Application must reside in the current workspace directory
- Initial implementation uses mock AWS APIs only
- Frontend and backend must be part of the same Next.js application
- Database must be SQLite (file-based)

## 10. Success Criteria

- Users can successfully register and authenticate
- Users can register subdomains under available parent domains
- Users can create, update, and delete A, CNAME, and MX records
- System prevents duplicate subdomain registrations
- All DNS operations are properly validated
- Mock API accurately simulates AWS Route 53 behavior
- UI is responsive and user-friendly

## 11. Future Enhancements

- Custom TTL configuration per record
- Bulk DNS record import/export
- DNS record templates
- Analytics and usage statistics
- API access for programmatic subdomain management
- Support for additional DNS record types (TXT, AAAA, SRV)
- Email notifications for DNS changes
- Domain ownership verification