# Elevate Academy Platform

Elevate Academy is an ALX-style digital skills education platform. It manages students, instructors, courses, classes, hubs, and reports — with a fully role-based experience so every user sees only what is relevant to them.

---

## Table of Contents

1. [Platform Vision](#platform-vision)
2. [Tech Stack](#tech-stack)
3. [Roles & Permissions](#roles--permissions)
4. [Role-Based UI — What Each Role Sees](#role-based-ui--what-each-role-sees)
5. [Current State of the Client](#current-state-of-the-client)
6. [What Needs to Be Built — Client](#what-needs-to-be-built--client)
7. [What Needs to Be Built — Server](#what-needs-to-be-built--server)
8. [API Contract Reference](#api-contract-reference)
9. [Data Models](#data-models)
10. [Project Setup](#project-setup)
11. [Environment Variables](#environment-variables)
12. [Folder Structure](#folder-structure)
13. [Contributing](#contributing)

---

## Platform Vision

Elevate Academy is built around three core user experiences:

- **Students** — browse available courses, enroll, attend classes, track their own progress, and submit assignments.
- **Instructors** — manage their classes, mark attendance, upload learning materials, and grade submissions.
- **Admins / Back-office** — manage all users, courses, hubs, reports, categories, and platform settings.

The entire navigation and feature set is driven by the user's **role and permissions**. A student never sees the admin panel. An instructor only sees what they teach.

---

## Tech Stack

### Client (this repo)

| Tool | Version | Purpose |
|------|---------|---------|
| React | 16.x | UI framework |
| TypeScript | 3.9 | Type safety |
| Redux + Thunk | 4.x | Global state |
| Material UI | 4.x | Component library |
| React Router | 5.x | Client-side routing |
| Formik + Yup | 2.x | Forms & validation |
| Axios / Superagent | — | HTTP requests |
| React Toastify | 5.x | Notifications |

### Server (separate repo)

Recommended stack (to be confirmed with the server team):

| Tool | Purpose |
|------|---------|
| Node.js + Express OR NestJS | REST API |
| PostgreSQL | Primary database |
| TypeORM OR Prisma | ORM |
| JWT | Authentication tokens |
| Bcrypt | Password hashing |
| Multer | File / avatar uploads |
| Nodemailer | Password reset emails |

---

## Roles & Permissions

### Roles (who you are)

| Role | Constant | Description |
|------|----------|-------------|
| Super | `SUPER` | Full platform access, no restrictions |
| Admin | `ADMIN` | Full access to all school operations |
| Principal | `PRINCIPAL` | School leadership, oversight |
| School Admin | `SCHOOL_ADMIN` | Manages a specific school/hub |
| Student Manager | `STUDENT_MANAGER` | Manages student records |
| Course Manager | `COURSE_MANAGER` | Manages course catalog |
| Instructor | `INSTRUCTOR` | Teaches courses/classes |
| Hub Manager | `HUB_MANAGER` | Manages a physical hub location |
| Student | `STUDENT` | Enrolled learner |
| User | `USER` | Basic authenticated user |

### Permissions (what you can do)

| Permission | Constant | Granted To |
|-----------|----------|-----------|
| Dashboard | `DASHBOARD` | All logged-in users |
| View Students | `STUDENT_VIEW` | Admin, StudentManager, Instructor |
| Edit Students | `STUDENT_EDIT` | Admin, StudentManager |
| View Courses | `COURSE_VIEW` | All staff + Students (read-only) |
| Edit Courses | `COURSE_EDIT` | Admin, CourseManager |
| View Classes | `CLASS_VIEW` | All staff + enrolled Students |
| Edit Classes | `CLASS_EDIT` | Admin, Instructor |
| View Users | `USER_VIEW` | Admin, Principal |
| Edit Users | `USER_EDIT` | Admin, Super |
| Edit Roles | `ROLE_EDIT` | Super, Admin |
| View Reports | `REPORT_VIEW` | Admin, Instructor, StudentManager |
| View Submissions | `REPORT_VIEW_SUBMISSIONS` | Admin, Principal |
| Manage Help | `MANAGE_HELP` | Admin, Super |
| View Hubs | `HUB_VIEW` | Admin, HubManager |
| Edit Hubs | `HUB_EDIT` | Admin, HubManager |

---

## Role-Based UI — What Each Role Sees

### Student

```
Navigation:
  - Dashboard        (my progress, upcoming classes)
  - My Courses       (enrolled courses + available courses to browse)
  - My Classes       (schedule, attendance record)
  - Assignments      (submit work, view grades)
  - My Profile       (edit personal info, avatar)
  - Help
```

### Instructor

```
Navigation:
  - Dashboard        (classes today, pending attendance)
  - My Classes       (list of classes they teach)
  - Attendance       (mark attendance per class)
  - Assignments      (view submissions, grade work)
  - Students         (view enrolled students)
  - Reports          (submit class reports)
  - Help
```

### School Admin / Course Manager / Student Manager

```
Navigation:
  - Dashboard
  - Students         (full CRUD)
  - Courses          (full CRUD, enroll students)
  - Classes          (schedule, manage)
  - Reports          (view all, submissions)
  - Admin
      - Manage Users
      - Course Categories
      - Class Categories
      - Class Fields
      - Hub Management
      - Manage Help
      - Settings
```

### Admin / Super / Principal

```
Navigation:
  - Everything above, plus:
  - Full user & role management
  - Platform-wide analytics
  - All report submissions
```

---

## Current State of the Client

### What is Built and Working

| Feature | Status | Notes |
|---------|--------|-------|
| Login / Logout | Working | Temp mock login: `admin@era92elevate.org` / `elevate` |
| Register | Working | Needs server connection |
| Forgot / Reset Password | Working | Needs server email config |
| Role-based routing | Working | `ContentSwitch.tsx` guards routes by permission |
| Dashboard (admin view) | Working | Shows metrics widgets + embedded analytics |
| Students (CRUD) | Working | List, details, search, upload |
| Courses | Working | List, details, enrollment |
| Classes | Working | Details, activities, attendance |
| Reports | Working | List, submit, view submissions |
| Admin panel | Working | Users, categories, hubs, help |
| Global loader | Working | `LoaderDialog` |
| Toast notifications | Working | `react-toastify` |
| Chat / Messaging | Partial | Module exists, nav link commented out |
| Calendar | Partial | Module exists, nav link commented out |
| Help | Partial | Module exists, nav link commented out |
| Student Profile page | Not started | Route defined, no component |
| Student portal view | Not started | Students currently see admin UI |
| Assignments module | Not started | No module exists yet |
| Notifications | Not started | — |
| Progress tracking | Not started | — |

### Known Issues / Tech Debt

- The login has a **hardcoded mock user** (`admin@era92elevate.org / elevate`) for development. Remove this before production.
- Students currently see the same admin UI as staff. A dedicated student-facing portal needs to be built.
- Several nav items are commented out in `NavMenu.tsx` — Calendar, Chat, Help, Profile.
- `IState` in `types.ts` uses `any` for contacts — needs proper typing.
- React 16 + MUI v4 are outdated. Plan a migration to React 18 + MUI v5 after core features are stable.

---

## What Needs to Be Built — Client

### Priority 1 — Student Portal (Core)

- [ ] **Student Dashboard** — personalized view with enrolled courses, upcoming classes, progress bars
- [ ] **Course Catalog** — browse all available courses, filter by category/hub, enroll button
- [ ] **My Courses page** — courses the student is enrolled in, completion status
- [ ] **My Classes page** — class schedule, attendance history per student
- [ ] **Assignments module** — submit work (file upload or text), view feedback and grade
- [ ] **Student Profile page** — view/edit own personal info, avatar, contact details
- [ ] **Progress Tracker** — visual progress per course (% complete, classes attended)

### Priority 2 — Instructor Portal

- [ ] **Instructor Dashboard** — classes today, pending grading, attendance summary
- [ ] **Mark Attendance UI** — per-class attendance form (present/absent/late per student)
- [ ] **Grade Submissions** — view student assignment submissions, enter grade + feedback
- [ ] **Class Materials** — upload PDFs, videos, links per class session

### Priority 3 — Improvements to Existing Features

- [ ] **Role-based NavMenu** — switch nav completely based on role (student vs staff vs admin)
- [ ] **Re-enable Calendar** — uncomment nav link, connect to class schedule
- [ ] **Re-enable Chat** — uncomment nav link, complete messaging module
- [ ] **Re-enable Help** — uncomment nav link
- [ ] **Notifications bell** — in-app notifications for enrollment confirmations, class reminders, grade released
- [ ] **Announcements** — admin broadcasts a message to all students or a cohort
- [ ] **Cohort management** — group students by intake batch (e.g. "Cohort 2024-A")

### Priority 4 — Polish

- [ ] Remove hardcoded mock login
- [ ] Add proper TypeScript types to `IState` (remove `any`)
- [ ] Add loading skeletons instead of spinners
- [ ] Mobile-responsive improvements
- [ ] Empty state illustrations (no courses enrolled yet, etc.)

---

## What Needs to Be Built — Server

### Authentication & Users

- [ ] `POST /api/auth/login` — email + password, returns `{ token, user }` with roles + permissions array
- [ ] `POST /api/auth/forgot-password` — sends reset email
- [ ] `POST /api/auth/reset-password` — validates token, updates password
- [ ] `GET /api/auth/profile` — returns current user from token
- [ ] `POST /api/register` — student self-registration
- [ ] `GET /api/users` — list users (admin only)
- [ ] `POST /api/users` — create user
- [ ] `PUT /api/users/:id` — update user
- [ ] `DELETE /api/users/:id` — deactivate user
- [ ] `GET /api/user-roles` — list available roles
- [ ] `PUT /api/user-roles/:userId` — assign roles to user

### Students

- [ ] `GET /api/students` — list students (search, filter, paginate)
- [ ] `POST /api/students` — create student profile
- [ ] `GET /api/students/:id` — student details
- [ ] `PUT /api/students/:id` — update student
- [ ] `DELETE /api/students/:id` — soft delete
- [ ] `POST /api/students/import` — bulk upload via CSV
- [ ] `GET /api/students/people/combo` — dropdown list of students
- [ ] `GET /api/students/people` — list with basic info
- [ ] `POST /api/students/student/avatar` — upload avatar image
- [ ] Sub-resources: `/emails`, `/phones`, `/addresses`, `/identifications`, `/requests`

### Courses

- [ ] `GET /api/courses/course` — list courses
- [ ] `POST /api/courses/course` — create course
- [ ] `GET /api/courses/course/:id` — course details
- [ ] `PUT /api/courses/course/:id` — update course
- [ ] `DELETE /api/courses/course/:id` — delete course
- [ ] `GET /api/courses/combo` — dropdown list
- [ ] `GET /api/courses/category` — list course categories
- [ ] `POST /api/courses/category` — create category
- [ ] `GET /api/courses/enrollment` — list enrollments
- [ ] `POST /api/courses/enrollment` — enroll a student in a course
- [ ] `DELETE /api/courses/enrollment/:id` — unenroll
- [ ] `GET /api/courses/request` — enrollment requests
- [ ] `POST /api/courses/request` — student requests to join a course
- [ ] `GET /api/courses/coursereports` — course report data
- [ ] `GET /api/courses/reportfrequency` — report frequency settings
- [ ] `GET /api/courses/coursescombo` — categories combo

### Classes (Sessions)

- [ ] `GET /api/classes/class` — list classes
- [ ] `POST /api/classes/class` — create class session
- [ ] `GET /api/classes/class/:id` — class details
- [ ] `PUT /api/classes/class/:id` — update class
- [ ] `DELETE /api/classes/class/:id` — delete class
- [ ] `GET /api/classes/attendance` — list attendance records
- [ ] `POST /api/classes/attendance` — mark attendance
- [ ] `PUT /api/classes/attendance/:id` — update attendance record
- [ ] `GET /api/classes/activities` — class activities list
- [ ] `POST /api/classes/activities` — add activity to class
- [ ] `GET /api/classes/member` — member class activities
- [ ] `GET /api/classes/registration` — class registrations
- [ ] `POST /api/classes/registration` — register student for class
- [ ] `GET /api/classes/category` — class categories
- [ ] `POST /api/classes/category` — create class category
- [ ] `GET /api/classes/fields` — custom class fields
- [ ] `GET /api/classes/metrics/raw` — raw metrics for dashboard
- [ ] `POST /api/classes/dayoff` — mark a day off (no class)

### Reports

- [ ] `GET /api/reports` — list report templates
- [ ] `POST /api/reports` — create report template
- [ ] `GET /api/reports/:id` — report details
- [ ] `PUT /api/reports/:id` — update report
- [ ] `POST /api/reports/submit` — submit a report response
- [ ] `GET /api/reports/submit` — list submissions
- [ ] `GET /api/reports/category` — report categories

### Assignments (New — to be built)

- [ ] `GET /api/assignments` — list assignments per course/class
- [ ] `POST /api/assignments` — create assignment (instructor/admin)
- [ ] `PUT /api/assignments/:id` — update assignment
- [ ] `DELETE /api/assignments/:id` — delete assignment
- [ ] `GET /api/assignments/:id/submissions` — list student submissions
- [ ] `POST /api/assignments/:id/submissions` — student submits work
- [ ] `PUT /api/assignments/:id/submissions/:submissionId` — grade + feedback

### Notifications (New — to be built)

- [ ] `GET /api/notifications` — get notifications for current user
- [ ] `POST /api/notifications` — create notification (admin broadcast)
- [ ] `PUT /api/notifications/:id/read` — mark as read
- [ ] `POST /api/notifications/broadcast` — send to all students or a cohort

### Hubs

- [ ] `GET /api/hubs` — list hubs
- [ ] `POST /api/hubs` — create hub
- [ ] `PUT /api/hubs/:id` — update hub
- [ ] `DELETE /api/hubs/:id` — delete hub

### Help

- [ ] `GET /api/help` — list help articles
- [ ] `POST /api/help` — create help article
- [ ] `PUT /api/help/:id` — update help article
- [ ] `DELETE /api/help/:id` — delete help article

### Chat (Partially built)

- [ ] `GET /api/chat/email` — list messages
- [ ] `POST /api/chat/email` — send message

---

## API Contract Reference

### Authentication Flow

```
Client                          Server
  |                               |
  | POST /api/auth/login          |
  | { username, password }        |
  |------------------------------>|
  |                               |
  |  { token, user }              |
  |  user = {                     |
  |    id, contactId, avatar,     |
  |    username, email, fullName, |
  |    roles: ['ADMIN'],          |
  |    permissions: [             |
  |      'DASHBOARD',             |
  |      'STUDENT_VIEW', ...      |
  |    ]                          |
  |  }                            |
  |<------------------------------|
  |                               |
  | Store token in localStorage   |
  | Attach to all requests:       |
  | Authorization: Bearer <token> |
```

### Standard Response Format

All API responses should follow this shape:

```json
// Success - list
{
  "data": [...],
  "total": 100,
  "skip": 0,
  "limit": 20
}

// Success - single
{
  "id": "uuid",
  "...fields": "..."
}

// Error
{
  "message": "Human readable error",
  "statusCode": 400
}
```

### Pagination Query Params (all list endpoints)

```
GET /api/students?skip=0&limit=20&query=john
```

---

## Data Models

### User / Auth User

```typescript
{
  id: string;
  contactId: string;        // links to student profile if role=STUDENT
  avatar: string;           // URL
  username: string;         // email used to login
  email: string;
  fullName: string;
  roles: string[];          // e.g. ['STUDENT']
  permissions: string[];    // e.g. ['DASHBOARD', 'COURSE_VIEW']
}
```

### Student

```typescript
{
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  hubId: string;
  avatar: string;
  cohort?: string;
  enrollments: Enrollment[];
  createdAt: Date;
}
```

### Course

```typescript
{
  id: string;
  name: string;
  description: string;
  categoryId: string;
  hubId: string;
  instructorId: string;
  duration: string;         // e.g. "12 weeks"
  startDate: Date;
  endDate: Date;
  isPublished: boolean;     // visible to students for enrollment
  thumbnailUrl?: string;
  createdAt: Date;
}
```

### Class (Session)

```typescript
{
  id: string;
  courseId: string;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  instructorId: string;
  hubId: string;
  categoryId: string;
  metaData: {
    tuitionFees: number;
    noOfCertifications: number;
    noOfEnrollments: number;
    noOfInstructors: number;
    totalCourseAttendance: number;
    totalClassAttendance: number;
  };
}
```

### Enrollment

```typescript
{
  id: string;
  studentId: string;
  courseId: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  enrolledAt: Date;
  completedAt?: Date;
}
```

### Assignment

```typescript
{
  id: string;
  courseId: string;
  classId?: string;
  title: string;
  description: string;
  dueDate: Date;
  maxScore: number;
  attachmentUrl?: string;
  createdAt: Date;
}
```

### Assignment Submission

```typescript
{
  id: string;
  assignmentId: string;
  studentId: string;
  content?: string;         // text submission
  fileUrl?: string;         // file submission
  submittedAt: Date;
  score?: number;
  feedback?: string;
  gradedAt?: Date;
  gradedBy?: string;        // instructorId
}
```

### Notification

```typescript
{
  id: string;
  userId: string;           // recipient
  title: string;
  body: string;
  type: 'enrollment' | 'grade' | 'announcement' | 'reminder';
  isRead: boolean;
  createdAt: Date;
}
```

---

## Project Setup

### Client

```bash
# 1. Clone
git clone <client-repo-url>
cd elevate-client

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.sample .env
# Edit .env — set REACT_APP_API_URL to point to your server

# 4. Start dev server
npm start
# Runs on http://localhost:3000
```

### Server (when ready)

```bash
# Clone the server repo
git clone <server-repo-url>
cd elevate-server

# Install dependencies
npm install

# Configure environment
cp .env.sample .env
# Set DB credentials, JWT_SECRET, mail config, etc.

# Run database migrations
npm run migration:run

# Start dev server
npm run dev
# Runs on http://localhost:4002 (matches client default)
```

### Demo Login (development only — no server needed)

```
Email:    admin@era92elevate.org
Password: elevate
```

This bypasses the server and logs in with a full admin account. **Remove before production.**

---

## Environment Variables

### Client `.env`

```env
REACT_APP_API_URL=http://localhost:4002
REACT_APP_ENVIRONMENT=local
```

### Server `.env` (reference for server team)

```env
PORT=4002
DATABASE_URL=postgresql://user:password@localhost:5432/elevate_db
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# Email (for password reset)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=noreply@yourdomain.com
MAIL_PASS=your-email-password

# File uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10mb

NODE_ENV=development
```

---

## Folder Structure

### Client

```
src/
  App.tsx                    # Root — auth guard, router setup
  data/
    appRoles.ts              # Role constants + permission helpers (hasAnyRole, isStudent, etc.)
    constants.ts             # localRoutes, remoteRoutes, appPermissions, apiBaseUrl
    types.ts                 # TypeScript interfaces (IAuthUser, IState, etc.)
    coreReducer.ts           # Auth state (login, logout, loading)
    coreActions.ts           # handleLogin, handleLogout actions
    store.ts                 # Redux store
    hooks/
      useCrud.ts             # Generic CRUD hook
      useDelete.ts           # Delete with confirmation
  modules/
    ContentSwitch.tsx        # All protected routes, guarded by permissions
    dashboard/               # Dashboard page + widgets
    login/                   # Login, Register, ForgotPassword, ResetPassword
    contacts/                # Student list + detail pages
    groups/                  # Courses (groups = courses internally)
    events/                  # Classes (events = classes internally)
    reports/                 # Reports list, submit, submissions
    admin/                   # Users, categories, hubs, help management
    settings/                # Platform settings
    messaging/               # Chat module (partially built)
    help/                    # Help articles
  components/
    layout/
      Layout.tsx             # App shell (sidebar + top bar)
      NavMenu.tsx            # Role-filtered sidebar navigation
    inputs/                  # All form input components
    forms/                   # Form wrappers
```

> **Note:** Internally, the codebase uses `groups` for Courses and `events` for Classes. This is legacy naming from the original project. When reading the code, mentally map: `group = course`, `event = class session`.

---

## Contributing

### Branch naming

```
feature/short-description
fix/short-description
chore/short-description
```

### Commit format (Conventional Commits)

```
feat: add student course enrollment page
fix: correct attendance marking for past classes
chore: update environment variable docs
```

### Adding a new module

1. Create folder under `src/modules/your-module/`
2. Add route constant to `localRoutes` in `constants.ts`
3. Add API route to `remoteRoutes` in `constants.ts`
4. Add permission to `appPermissions` if needed
5. Add lazy import + `<Route>` in `ContentSwitch.tsx` guarded by permission
6. Add nav item to `NavMenu.tsx` with `requiredRoles`

### Adding a new role or permission

1. Add permission constant to `appPermissions` in `constants.ts`
2. Update `permissionsList` (automatic via `Object.values`)
3. Guard routes in `ContentSwitch.tsx` with `hasAnyRole(user, [newPermission])`
4. Guard nav items in `NavMenu.tsx` with `requiredRoles: [newPermission]`
5. Update the server to assign the permission to the appropriate roles

---

## Roadmap

### Phase 1 — Foundation (In Progress)
- [x] Auth (login, register, password reset)
- [x] Student management
- [x] Course management
- [x] Class management
- [x] Reports
- [x] Admin panel
- [ ] Connect client fully to live server (remove mock login)

### Phase 2 — Student Portal
- [ ] Student-facing dashboard (personalized)
- [ ] Course catalog + self-enrollment
- [ ] My classes + attendance history
- [ ] Student profile page
- [ ] Progress tracker

### Phase 3 — Learning Features
- [ ] Assignments (create, submit, grade)
- [ ] Class materials (upload/view resources per class)
- [ ] Cohort management

### Phase 4 — Engagement
- [ ] In-app notifications
- [ ] Announcements / broadcasts
- [ ] Re-enable Chat module
- [ ] Re-enable Calendar

### Phase 5 — Polish & Scale
- [ ] Migrate to React 18 + MUI v5
- [ ] Mobile-responsive redesign
- [ ] Unit + integration tests
- [ ] CI/CD pipeline
