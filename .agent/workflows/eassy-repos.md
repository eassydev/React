---
description: Eassy project repository structure and admin panel change workflows
---

# Eassy Project Overview

This workspace contains two interconnected repositories for the Eassy platform - a service booking and provider management system.

## Repositories

### 1. BackendNew (Node.js API Server)

**Location:** `/home/pradeep/Work/projects/eassy/BackendNew`
**Name:** `admin-api` (v1.1.0)

#### Tech Stack
- **Runtime:** Node.js v14+
- **Framework:** Express.js v4.21.1
- **Database:** MySQL v8.0 with Sequelize ORM v6.37.4
- **Authentication:** JWT (jsonwebtoken)
- **File Storage:** AWS S3
- **Notifications:** Firebase Admin, Nodemailer
- **Payments:** Razorpay

#### Key Directories
| Directory | Purpose |
|-----------|---------|
| `controllers/` | 77 controller files |
| `models/` | 121+ database models |
| `routes/` | 68 route files |
| `routes/admin/` | Admin-specific routes |
| `version/` | Versioned APIs (v1.0.0, v1.1.0) |
| `integrations/` | External integrations (Paperbit, Acefone, etc.) |
| `middleware/` | Auth, validation middleware |
| `services/` | Business logic services |
| `cron/` | Scheduled jobs |
| `migrations/` | Database migrations |

#### Running Commands
```bash
# Development
npm run dev

# Production
npm start

# Setup database
npm run setup-db
```

#### API Documentation
- Main docs: `http://localhost:5001/api-docs`
- v1.0.0 docs: `http://localhost:5001/api-docs/v1.0.0`
- Integrations docs: `http://localhost:5001/api-docs/integrations`

#### Key Models
- **Users:** `userModel.js`, `userSessionModel.js`
- **Providers:** `providerModel.js`, `sphubModel.js`
- **Bookings:** `bookingModel.js`, `bookingItemModel.js`
- **B2B:** `B2BCustomer.js`, `B2BBooking.js`, `B2BInvoice.js`
- **Services:** `categoryModel.js`, `subCategoryModel.js`, `rateCardModel.js`
- **Payments:** `walletTransectionModel.js`, `promocodesModel.js`

---

### 2. React (Next.js Admin Panel)

**Location:** `/home/pradeep/Work/projects/eassy/React`
**Name:** `app-core-admin` (v1.0.0)

#### Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS v3
- **UI Components:** Radix UI, shadcn/ui
- **Forms:** React Hook Form + Zod
- **Tables:** TanStack React Table
- **Charts:** Recharts
- **HTTP Client:** Axios

#### Key Directories
| Directory | Purpose |
|-----------|---------|
| `src/app/admin/` | 56+ admin page sections |
| `src/components/` | Reusable UI components |
| `src/contexts/` | React contexts |
| `src/hooks/` | Custom hooks |
| `src/lib/` | Utilities and API helpers |
| `src/navigation/` | Navigation config |

#### Admin Panel Sections (56+ pages)
**Core Entities:**
- `user/` - User management
- `provider/` - Provider management
- `booking/` - Booking management
- `admin/` - Admin user management

**B2B Module:**
- `b2b/` - B2B customer, bookings, invoices, quotations

**Service Configuration:**
- `category/` - Categories
- `sub-category/` - Subcategories
- `rate-card/` - Rate cards
- `package/` - Service packages
- `segment/` - Service segments

**Providers & Operations:**
- `sp-hubs/` - Service provider hubs
- `sp-payout/` - SP payout management
- `staff/` - Staff management
- `checklist/` - Operational checklists

**Marketing & Promotions:**
- `banner/` - Banner management
- `promocode/` - Promocode management
- `campaign/` - Campaigns
- `bogo/` - BOGO offers
- `wallet-offer/` - Wallet offers
- `vip-plan/` - VIP plans

**Content:**
- `blog/` - Blog posts
- `faq/` - FAQs
- `pages/` - CMS pages
- `seo-content/` - SEO content
- `notification/` - Notifications
- `notification-type/` - Notification types

**Configuration:**
- `country/` - Countries
- `state/` - States
- `city/` - Cities
- `hub/` - Hubs
- `hub-pincode/` - Hub pincodes
- `gst/` - GST rates
- `bank/` - Banks
- `setting/` - App settings

**Learning & Training:**
- `course/` - Courses
- `course-quiz/` - Course quizzes
- `video/` - Videos
- `video-learning/` - Video learning

**Other:**
- `analytics/` - Analytics dashboard
- `transactions/` - Transaction logs
- `donation/` - Donations
- `onboarding/` - Provider onboarding
- `permission/` - Permissions
- `role/` - Roles

#### Running Commands
```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start

# Lint
npm run lint
npm run lint:fix

# Format
npm run format
```

---

## Making Admin Panel Changes

### Step 1: Identify the Feature Area
1. Find the relevant admin section in `React/src/app/admin/[section]/`
2. Check the corresponding backend route in `BackendNew/routes/admin/`
3. Locate the model in `BackendNew/models/`

### Step 2: Backend API Changes (BackendNew)

1. **Add/modify model** in `models/` directory
2. **Update associations** in `models/associations.js`
3. **Create/modify controller** in `controllers/` or `routes/admin/`
4. **Add routes** in `routes/admin/[feature]Routes.js`
5. **Run database migration** if schema changes needed

### Step 3: Frontend Changes (React)

1. **Update page components** in `src/app/admin/[section]/`
   - `page.tsx` - List page
   - `new/` or `create/` - Create form
   - `[id]/` or `edit/` - Edit form
2. **Add API calls** using existing patterns with Axios
3. **Update navigation** if adding new sections in `src/navigation/`

### Step 4: Test Changes

```bash
# Backend (terminal 1)
// turbo
cd /home/pradeep/Work/projects/eassy/BackendNew && npm run dev

# Frontend (terminal 2)
// turbo
cd /home/pradeep/Work/projects/eassy/React && npm run dev
```

Access admin panel at: `http://localhost:3000/admin`

---

## API Communication

**Backend Base URL:** `http://localhost:5001/api/`
**Admin API:** `http://localhost:5001/api/admin/`
**Customer API:** `http://localhost:5001/api/v1.0.0/` or `http://localhost:5001/api/customer/v1.0.0/`

---

## Common Patterns

### Adding a New Admin Section

1. Create backend route file: `BackendNew/routes/admin/[feature]Routes.js`
2. Register route in `BackendNew/routes/adminRoutes.js`
3. Create frontend pages:
   - `React/src/app/admin/[feature]/page.tsx` (list)
   - `React/src/app/admin/[feature]/new/page.tsx` (create)
   - `React/src/app/admin/[feature]/[id]/page.tsx` (edit/view)
4. Add navigation entry in `React/src/navigation/`

### Modifying Existing Features

1. Check existing controller logic in backend
2. Update API response/request as needed
3. Update frontend components to match API changes
4. Test both list and form views

---

## Environment Configuration

### Backend (.env)
Copy from `.env.example` and configure:
- `DB_*` - MySQL connection
- `JWT_SECRET` - Auth token secret
- `AWS_*` - S3 storage
- `RAZORPAY_*` - Payment gateway
- `FIREBASE_*` - Push notifications

### Frontend
Configure API base URL in environment/config files to point to backend.

###Git rules:

Since multiple people are working on the same repo, make sure to pull origin  / main before making changes and pushing code to git

### deploy to server

connect to server:ssh -i /home/pradeep/.ssh/eassy_life_openssh ubuntu@13.202.69.66
Deployment script: sudo /home/ubuntu/deploy_backend_new.sh

