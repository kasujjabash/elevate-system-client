# Elevate Academy — Client

era92 Elevate is a digital skills education platform built for learners across multiple hub locations. It delivers a fully role-based experience — students, instructors, and admins each see a tailored interface.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Roles & Permissions](#roles--permissions)
3. [Student Portal — Screens](#student-portal--screens)
4. [Staff Portal — Screens](#staff-portal--screens)
5. [Current Status](#current-status)
6. [API Endpoints Used](#api-endpoints-used)
7. [Project Setup](#project-setup)
8. [Environment Variables](#environment-variables)
9. [Folder Structure](#folder-structure)
10. [Deployment](#deployment)
11. [Contributing](#contributing)

---

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| React | 16.x | UI framework |
| TypeScript | 3.9 | Type safety |
| Redux + Thunk | 4.x | Global state (auth, user) |
| Material UI | 4.x | Component library |
| React Router | 5.x | Client-side routing |
| Formik + Yup | 2.x | Forms & validation |
| date-fns | 2.x | Date formatting |
| chart.js v2 + react-chartjs-2 v2 | — | Attendance bar chart |
| React Toastify | 5.x | Toast notifications |

**Server:** NestJS + PostgreSQL (separate repo), running on port `4002` locally.

---

## Roles & Permissions

### Roles

| Role | Description |
|------|-------------|
| `SUPER` | Full platform access |
| `ADMIN` | Full school operations |
| `PRINCIPAL` | School leadership |
| `SCHOOL_ADMIN` | Hub-level admin |
| `STUDENT_MANAGER` | Manages student records |
| `COURSE_MANAGER` | Manages course catalog |
| `INSTRUCTOR` | Teaches courses/classes |
| `HUB_MANAGER` | Manages a hub location |
| `STUDENT` | Enrolled learner |

The `isStudent(user)` helper in `appRoles.ts` is used throughout the app to switch between student and staff experiences.

---

## Student Portal — Screens

All student routes are accessible under the white sidebar navigation. The sidebar shows the era92 elevate logo and the following items:

| Nav Item | Route | Component | Description |
|----------|-------|-----------|-------------|
| Home | `/dashboard` | `StudentDashboard` | Reminders banner, My Modules scroll, 7-day attendance chart, calendar widget, Today's Class |
| My Modules | `/my-courses` | `MyCourses` | Programme header, search, modules grouped by month in a 4-col grid |
| Courses | `/student-courses` | `StudentCourses` | All programmes with expandable module lists, enrolment status |
| Live Classes | `/my-classes` | `MyClasses` | Upcoming class cards (avatar, code, date/time/topic, Ongoing/Attend buttons), All Class Time Table section |
| My Timetable | `/my-timetable` | `MyTimetable` | Weekly grid (Mon–Sun × 8AM–6PM), event blocks, "Events This Week" sidebar |
| Assessments | `/my-assessments` | `MyAssessments` | Results table with tabs, GPA/CGPA display, Export to PDF button, pagination |
| Chats / Inquiries | `/chats` | `ChatsInquiries` | Thread list + chat panel, submit new inquiry form, status chips |
| Requests & Applications | `/my-requests` | `MyRequests` | Placeholder — requests list |
| Workshops & Podcasts | `/workshops` | `Workshops` | Placeholder — coming soon |

**Settings** (pinned at bottom) → `/settings` — Change Password, Notifications toggles, Account details
**Logout** (pinned at bottom) → dispatches `handleLogout()`

---

## Staff Portal — Screens

Staff see a separate set of routes under the same white sidebar design:

| Nav Item | Route | Description |
|----------|-------|-------------|
| Dashboard | `/dashboard` | Admin metrics widgets |
| Students | `/students` | Full student CRUD, search, upload |
| Courses | `/people/courses` | Course list and details |
| Announcements | `/admin/announcements` | Broadcast messages |
| Reports | `/reports` | Report templates and submissions |
| Attendance | `/admin/attendance` | Attendance sessions and records |
| Exams | `/admin/exams` | Exam management |
| Assignments | `/admin/assignments` | Assignment creation and grading |
| Admin (collapsible) | — | Users, Categories, Hubs, Help |
| Help | `/help` | Help articles |

---

## Current Status

### Completed

| Feature | Notes |
|---------|-------|
| Login screen | Split 50/50 layout — form left, graduation photo right. Fields outlined, button `#90A1B9` |
| Register screen | Same split layout. Plain text fields (no Google Maps). Submit button `#90A1B9` via ThemeProvider |
| White sidebar | Both student and staff use the same white sidebar design with coral active state |
| Student Dashboard | Reminders banner, My Modules dark cards, 7-day attendance bar chart, calendar, Today's Class |
| My Modules | Programme card, search, month-grouped module grid (clean cards — icon + name + code) |
| Courses & Modules | Expandable programme cards showing all modules with colour-coded cards |
| Live Classes | Class cards with coral avatar, Live badge, checkmark details, Ongoing/Attend buttons |
| My Timetable | Weekly schedule grid with event blocks and sidebar event list |
| Assessments | Results table with tabs, GPA/CGPA, pagination, breadcrumb |
| Chats / Inquiries | Two-panel inquiry system — thread list + conversation view |
| Settings | Profile card, Change Password (XForm), Notifications toggles, Account details |
| Course Catalog | Browse all courses, enroll button, enrolled/pending status |
| Course Player | Video/content player per course |

### Pending / Placeholders

| Feature | Notes |
|---------|-------|
| Requests & Applications | Placeholder screen — needs backend + UI |
| Workshops & Podcasts | Placeholder screen — content TBD |
| Chat messages sub-route | `/api/students/requests/:id/messages` — verify backend exists |
| Notifications bell | UI hook exists in Layout, no data wired |
| My Timetable — real data | Falls back gracefully when no sessions; depends on `/api/timetable` |

---

## API Endpoints Used

### Auth
| Method | Endpoint | Used By |
|--------|----------|---------|
| POST | `/api/auth/login` | Login |
| POST | `/api/register` | Register |
| GET | `/api/auth/profile` | MyProfile |
| PUT | `/api/users` | Settings — change password |

### Students
| Method | Endpoint | Used By |
|--------|----------|---------|
| GET | `/api/students/me/courses` | Dashboard, My Modules, Course Catalog |
| GET | `/api/students/requests` | Chats / Inquiries |
| POST | `/api/students/requests` | Chats — new inquiry |
| GET | `/api/students/requests/:id/messages` | Chats — conversation |
| POST | `/api/students/requests/:id/messages` | Chats — reply |

### Courses
| Method | Endpoint | Used By |
|--------|----------|---------|
| GET | `/api/courses/course` | Course Catalog, Courses page |
| POST | `/api/courses/:id/enroll` | Course Catalog — enroll button |
| GET | `/api/courses/enrollment` | Progress |

### Classes
| Method | Endpoint | Used By |
|--------|----------|---------|
| GET | `/api/classes/class` | Live Classes, Timetable, Dashboard |
| GET | `/api/classes/attendance` | Progress |

### Timetable & Attendance
| Method | Endpoint | Used By |
|--------|----------|---------|
| GET | `/api/timetable` | My Timetable, Dashboard |
| GET | `/api/attendance/sessions` | Dashboard attendance chart |

### Exams
| Method | Endpoint | Used By |
|--------|----------|---------|
| GET | `/api/exams/results` | Assessments — results table |

---

## Project Setup

```bash
# 1. Clone
git clone <client-repo-url>
cd elevate-client

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.sample .env
# Edit .env — set REACT_APP_API_URL to your backend URL

# 4. Start dev server
npm start
# Runs on http://localhost:3000
```

**Backend** runs on `http://localhost:4002` by default (NestJS).

---

## Environment Variables

### `.env` (local development)

```env
PORT=3000
REACT_APP_API_URL=http://localhost:4002
REACT_APP_ENVIRONMENT=local
REACT_APP_SCHOOL_NAME=Elevate Academy
```

### `.env.production` (before deploying)

```env
PORT=3000
REACT_APP_API_URL=https://your-backend-name.onrender.com
REACT_APP_ENVIRONMENT=production
REACT_APP_SCHOOL_NAME=Elevate Academy
```

> Set `REACT_APP_API_URL` in Netlify → Site Settings → Environment Variables to match your Render backend URL.

---

## Folder Structure

```
src/
  App.tsx                      # Root — auth guard, router setup
  data/
    appRoles.ts                # isStudent(), hasAnyRole(), role constants
    constants.ts               # localRoutes, remoteRoutes, appPermissions
    types.ts                   # IAuthUser, IState interfaces
    coreReducer.ts             # Auth state
    coreActions.ts             # handleLogin, handleLogout
  modules/
    ContentSwitch.tsx          # All routes, guarded by role/permission
    login/
      Login.tsx                # 50/50 split login screen
      Register.tsx             # 50/50 split register screen (ThemeProvider scoped)
      RegisterForm.tsx         # Registration fields
      loginStyles.ts           # Shared styles for login/register
    student/
      StudentDashboard.tsx     # Student home page
      MyCourses.tsx            # My Modules (enrolled)
      StudentCourses.tsx       # All courses & modules browser
      MyClasses.tsx            # Live classes
      MyTimetable.tsx          # Weekly timetable grid
      MyAssessments.tsx        # Exam results
      ChatsInquiries.tsx       # Inquiry thread system
      MyRequests.tsx           # Requests (placeholder)
      Workshops.tsx            # Workshops (placeholder)
      CourseCatalog.tsx        # Browse & enroll in courses
      CoursePlayer.tsx         # Course content player
    dashboard/                 # Staff dashboard
    contacts/                  # Student management (staff)
    groups/                    # Course management (staff)
    events/                    # Class management (staff)
    reports/                   # Reports
    admin/                     # Admin panel (users, categories, hubs)
    settings/
      Settings.tsx             # Change password, notifications, account
    messaging/                 # Chat (staff email)
    help/                      # Help articles
  components/
    layout/
      Layout.tsx               # App shell — AppBar + sidebar drawer
      NavMenu.tsx              # Role-based sidebar (student vs staff)
      styles.ts                # Drawer/nav styles
    inputs/                    # XTextInput, XSelectInput, XRadioInput, etc.
    forms/
      XForm.tsx                # Formik wrapper with Submit button
  assets/
    images/
      elevate-logo.png         # era92 elevate logo
      home-image.png           # Graduation photo (login/register right panel)
    figma/                     # Figma design screenshots (reference)
  theme/
    palette.ts                 # Brand colours (coral #fe3a6a, orange #fe8c45)
    index.ts                   # MUI theme config
  utils/
    ajax.ts                    # get, post, put, search helpers (attaches JWT)
    Toast.ts                   # Toast wrapper
  public/
    _redirects                 # Netlify SPA redirect rule
```

> **Legacy naming:** internally `groups` = Courses and `events` = Classes. This is preserved for backward compatibility with the backend API.

---

## Deployment

### Netlify (frontend)

1. Connect the repo to Netlify
2. Build command: `npm run build`
3. Publish directory: `build`
4. Add environment variable: `REACT_APP_API_URL` = your Render backend URL
5. The `public/_redirects` file handles React Router (`/* /index.html 200`)

### Render (backend)

1. Deploy the NestJS backend repo to Render
2. Copy the service URL (e.g. `https://elevate-api.onrender.com`)
3. Paste it as `REACT_APP_API_URL` in both `.env.production` and Netlify env vars

---

## Contributing

### Branch naming
```
feature/short-description
fix/short-description
chore/short-description
```

### Commit format
```
feat: add student timetable weekly grid
fix: correct register form submit button colour
chore: update README with current screen inventory
```

### Adding a new student screen

1. Create `src/modules/student/MyNewScreen.tsx`
2. Add route to `localRoutes` in `constants.ts`
3. Add API route to `remoteRoutes` in `constants.ts` if needed
4. Add lazy import + `<Route>` in `ContentSwitch.tsx`
5. Add nav item to `studentRoutes` array in `NavMenu.tsx`
