# Gym Management System

A modern gym management system MVP built with **Next.js, TypeScript, Tailwind CSS, and Supabase**.

Designed for gym owners, managers, trainers, and members to manage memberships, attendance, payments, trainers, and workout plans from one platform.

---

## 🚀 Overview

The system replaces manual registers, spreadsheets, and disconnected attendance records with a simple web-based gym management platform.

### Core workflow

```text
Member
   ↓
Membership
   ↓
Attendance
   ↓
Payment
   ↓
Trainer
   ↓
Workout Plan
```

The system is also designed with future biometric attendance hardware integration in mind, including devices such as:

**ZKTeco SenseFace 7A Plus**

> The current MVP does not claim direct/live ZKTeco integration unless the device integration has been implemented and tested.

---

## ✨ Features

### Admin / Gym Manager

- Dashboard overview
- Member management
- Trainer management
- Membership management
- Attendance monitoring
- Payment records
- Expiring membership tracking
- Recent activity
- Gym statistics

### Trainer

- Trainer dashboard
- Assigned members
- Member activity
- Workout plans
- Training notes
- Relevant membership and attendance information

### Member

- Member dashboard
- Membership status
- Membership expiry
- Attendance history
- Personal QR code
- Workout plans
- Profile information

### Attendance

The MVP supports a simple attendance workflow:

```
Member
   ↓
QR / Check-in
   ↓
Validate Membership
   ↓
Create Attendance Record
   ↓
Update Dashboard
```

Future hardware workflow:

```
Face / Fingerprint Device
          ↓
     Device Event
          ↓
   Integration Layer
          ↓
     Gym System
          ↓
   Attendance Record
```

---

# 🎨 Design

The application uses a modern **fitness SaaS** visual style.

### Design goals

- Clean
- Premium
- Minimal
- Mobile responsive
- Easy to understand
- Fast to operate
- Consistent between landing page and dashboard

### Color direction

```
Dark Charcoal
+
Lime / Electric Green
+
White
+
Soft Gray
```

The landing page should feel like a commercial SaaS product rather than an internal admin panel.

---

# 🛠 Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide React

### Backend / Database

- Supabase
- PostgreSQL
- Supabase Auth
- Row Level Security (RLS)

### Hosting

- Vercel

### Development

- Node.js
- npm

---

# 🏗 Architecture

```
                    ┌──────────────────┐
                    │   Public Website │
                    │        /         │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │     Next.js      │
                    │   App Router     │
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
          Admin UI       Trainer UI      Member UI
              │              │              │
              └──────────────┼──────────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │    Supabase      │
                    │                  │
                    │ Auth             │
                    │ PostgreSQL       │
                    │ RLS              │
                    └────────┬─────────┘
                             │
                             ▼
                    Attendance System
                             │
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
                  QR Code       Future Hardware
                                  Integration
```

---

# 📁 Project Structure

```
.
├── app/
│   ├── page.tsx
│   │
│   ├── login/
│   │   └── page.tsx
│   │
│   ├── dashboard/
│   │   └── page.tsx
│   │
│   ├── members/
│   │   └── page.tsx
│   │
│   ├── trainers/
│   │   └── page.tsx
│   │
│   ├── attendance/
│   │   └── page.tsx
│   │
│   ├── memberships/
│   │   └── page.tsx
│   │
│   └── payments/
│       └── page.tsx
│
├── components/
│   ├── ui/
│   ├── landing/
│   ├── dashboard/
│   ├── members/
│   ├── trainers/
│   ├── attendance/
│   └── shared/
│
├── lib/
│   ├── supabase/
│   ├── auth/
│   └── utils/
│
├── supabase/
│   ├── migrations/
│   └── seed/
│
├── public/
│
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

> The exact structure may change as development continues.

---

# 🗄 Database

Supabase PostgreSQL is used as the primary database.

### Core entities

```
users
   │
   ├── profiles
   ├── members
   └── trainers

members
   │
   ├── memberships
   ├── attendance
   ├── payments
   └── workout_plans

trainers
   │
   └── trainer_members

attendance
   │
   └── attendance_events
```

### Suggested tables

```
profiles
members
trainers
membership_plans
memberships
attendance
attendance_events
payments
workout_plans
workout_exercises
trainer_members
```

---

# 🔐 Authentication

Authentication is handled through **Supabase Auth**.

Supported application roles:

```
ADMIN
TRAINER
MEMBER
```

### Admin

```
ADMIN
 ├── Manage members
 ├── Manage trainers
 ├── Manage memberships
 ├── View attendance
 └── View payments
```

### Trainer

```
TRAINER
 ├── View assigned members
 ├── Manage workout plans
 └── View relevant member activity
```

### Member

```
MEMBER
 ├── View own profile
 ├── View membership
 ├── View attendance
 └── View workout plans
```

Access should be enforced through database-level **Row Level Security**, not only frontend route protection.

---

# 🔑 Environment Variables

Create a local:

```
.env.local
```

Example:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key

# Server only.
# NEVER expose this through NEXT_PUBLIC_ variables.
SUPABASE_SECRET_KEY=your-secret-key

SUPABASE_ALLOW_DEMO_SEED=false

DEMO_ADMIN_EMAIL=
DEMO_ADMIN_PASSWORD=

DEMO_TRAINER_EMAIL=
DEMO_TRAINER_PASSWORD=

DEMO_MEMBER_EMAIL=
DEMO_MEMBER_PASSWORD=
```

### Important

Never commit `.env.local`.

Make sure it is included in `.gitignore`.

---

# 💻 Getting Started

## 1\. Clone the repository

```
git clone YOUR_REPOSITORY_URL
cd YOUR_PROJECT_NAME
```

## 2\. Install dependencies

```
npm install
```

## 3\. Configure environment variables

Create:

```
.env.local
```

Add your Supabase credentials.

Use `.env.example` as a reference.

## 4\. Start the development server

```
npm run dev
```

Open:

```
http://localhost:3000
```

---

# 🗃 Supabase Setup

Create a Supabase project and configure:

- Authentication
- PostgreSQL database
- Row Level Security
- Database migrations

If the project contains:

```
supabase/migrations/
```

apply the migrations to the Supabase project.

---

# 🌱 Demo Seed

If demo seeding is implemented, configure:

```
SUPABASE_ALLOW_DEMO_SEED=true
```

Then provide:

```
DEMO_ADMIN_EMAIL=
DEMO_ADMIN_PASSWORD=

DEMO_TRAINER_EMAIL=
DEMO_TRAINER_PASSWORD=

DEMO_MEMBER_EMAIL=
DEMO_MEMBER_PASSWORD=
```

Then run:

```
npm run seed:auth
```

For production:

```
SUPABASE_ALLOW_DEMO_SEED=false
```

---

# 📱 Attendance

The MVP prioritizes a reliable attendance workflow before attempting direct hardware integration.

## QR Attendance

```
Member opens QR
       ↓
System reads member ID
       ↓
Check member exists
       ↓
Check membership status
       ↓
Check membership expiry
       ↓
Create attendance record
       ↓
Show success
```

Example:

```
✓ Check-in successful

Rahim Ahmed

Membership:
Active

Time:
08:42 AM
```

---

# 🧬 Future Biometric Integration

Target hardware:

**ZKTeco SenseFace 7A Plus**

The long-term architecture should avoid connecting the browser directly to the physical device.

Instead:

```
ZKTeco Device
       ↓
Device API / SDK / Protocol
       ↓
Integration Service
       ↓
Attendance Event
       ↓
Supabase
       ↓
Gym Dashboard
```

The exact integration method depends on the API, SDK, protocol, or management software available for the deployed ZKTeco device.

The MVP therefore keeps attendance logic independent from the hardware.

---

# 🔌 Attendance Event Model

A future device event could conceptually look like:

```
{
  "device_id": "GYM-ENTRY-01",
  "external_user_id": "10023",
  "event_type": "check_in",
  "occurred_at": "2026-01-01T08:42:00Z"
}
```

The integration layer would resolve:

```
external_user_id
        ↓
member
        ↓
membership
        ↓
attendance
```

The database should not be tightly coupled to one hardware vendor.

---

# 🧠 Attendance Architecture

Attendance should be treated as an **event**, regardless of how it was created.

Possible sources:

```
QR Code
   │
Manual Check-in
   │
Biometric Device
   │
Mobile App
   │
External API
   │
   ▼
Attendance Event
```

This makes future hardware integration easier.

---

# 📊 Dashboard

The dashboard should provide:

```
┌─────────────────────────────────────────┐
│ Good morning                            │
│                                         │
│ ┌────────┐ ┌────────┐ ┌────────┐        │
│ │ Members│ │Checkins│ │Revenue │        │
│ │ 1,248  │ │  187   │ │ ৳84,500│        │
│ └────────┘ └────────┘ └────────┘        │
│                                         │
│ Attendance                              │
│ ───────────────────────────────         │
│                                         │
│ Recent Activity                         │
│                                         │
└─────────────────────────────────────────┘
```

The dashboard should prioritize information gym staff need during normal operation.

---

# 🎨 UI Principles

The UI should feel:

- Modern
- Fast
- Clean
- Professional
- Easy to scan
- Consistent

Avoid:

- Excessive shadows
- Excessive gradients
- Too many colors
- Tiny text
- Overloaded dashboards
- Unnecessary animations

Use consistent:

- Spacing
- Typography
- Buttons
- Cards
- Tables
- Badges
- Forms
- Dialogs

---

# 🌐 Landing Page

The public landing page should communicate:

> **Run your gym. Not the paperwork.**

Primary sections:

```
Hero
   ↓
Features
   ↓
Attendance
   ↓
Device Integration
   ↓
Dashboard Preview
   ↓
Member Experience
   ↓
Trainer Experience
   ↓
How It Works
   ↓
CTA
   ↓
Footer
```

The landing page should use actual product UI previews wherever possible.

---

# 📱 Responsive Design

The application must support:

- Mobile
- Tablet
- Desktop
- Large Desktop

Important mobile screens:

- Login
- Dashboard
- Members
- Attendance
- Member Profile
- Workout

Mobile layouts should be intentionally designed rather than simply shrinking the desktop UI.

---

# 🧪 Testing

Before committing changes:

```
npm run lint
```

Run the production build:

```
npm run build
```

Start the application:

```
npm run dev
```

Test:

- Login
- Logout
- Role permissions
- Member creation
- Membership creation
- Attendance
- Payment records
- Trainer assignment
- Workout plans
- Mobile UI
- Desktop UI

---

# 🚀 Deployment

Recommended deployment:

**Vercel**

Production architecture:

```
User
 ↓
Vercel
 ↓
Next.js
 ↓
Supabase
 ├── Auth
 └── PostgreSQL
```

Environment variables must be configured in the Vercel project settings.

Never upload `.env.local`.

---

# 🔒 Security

Important rules:

- Never expose Supabase secret keys to the browser.
- Never prefix secret keys with `NEXT_PUBLIC_`.
- Enable Row Level Security.
- Validate permissions server-side.
- Never trust role information supplied by the client.
- Validate attendance requests.
- Validate membership status server-side.
- Never commit passwords or API keys.
- Do not expose server credentials in client components.

---

# 📌 MVP Scope

## Included

- Authentication
- Role-based access
- Admin dashboard
- Member management
- Trainer management
- Membership management
- Attendance
- Payments
- Workout plans
- QR-based attendance
- Responsive UI
- Public landing page

## Future

- Live ZKTeco integration
- Biometric attendance synchronization
- Automated payment gateways
- SMS notifications
- WhatsApp notifications
- Advanced analytics
- Multi-branch gyms
- Native mobile applications
- Automated membership renewal
- Advanced trainer scheduling

---

# 🗺 Roadmap

## Phase 1 — MVP

- [x] Project setup
- [x] Landing page
- [x] Authentication
- [x] Database
- [x] Admin dashboard
- [ ] Members
- [ ] Memberships
- [ ] Attendance
- [ ] Trainers
- [ ] Payments
- [ ] Workout plans

## Phase 2 — Gym Operations

- [ ] Advanced attendance
- [ ] Reports
- [ ] Notifications
- [ ] Member self-service
- [ ] Trainer management improvements

## Phase 3 — Hardware

- [ ] ZKTeco integration research
- [ ] Device event ingestion
- [ ] Device-to-member mapping
- [ ] Automated attendance synchronization
- [ ] Device monitoring

## Phase 4 — Production

- [ ] Multi-gym support
- [ ] Subscription billing
- [ ] Advanced permissions
- [ ] Audit logs
- [ ] Backups
- [ ] Monitoring

---

# 🤖 AI Development Guidelines

This repository may be developed using AI coding agents.

Before changing code, the agent should:

1. Inspect the existing project.
2. Understand the database schema.
3. Check existing components.
4. Reuse existing UI components.
5. Avoid unnecessary dependencies.
6. Avoid rewriting working functionality.
7. Follow existing TypeScript conventions.
8. Keep Supabase access server-safe.
9. Respect Row Level Security.
10. Keep hardware integration separated from attendance business logic.

### Development workflow

```
Understand
    ↓
Design
    ↓
Implement
    ↓
Test
    ↓
Build
    ↓
Verify
```

Do not blindly modify unrelated parts of the application.

---

# 📄 License

This project is currently a private MVP.

License and commercial usage terms will be added when the project is ready for release.

---

# 📊 Project Status

**Status:** MVP Development

**Stack:**

```
Next.js
TypeScript
Tailwind CSS
shadcn/ui
Supabase
PostgreSQL
Vercel
```

### Current priority

> Build a small but properly working gym management system with a polished UI and clean architecture that can later support physical attendance hardware.
