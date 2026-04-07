export const AUTH_TOKEN_KEY = '__elevate__academy__token';
export const AUTH_USER_KEY = '__elevate__academy__user';

export const appPermissions = {
  roleDashboard: 'DASHBOARD',
  roleStudentView: 'STUDENT_VIEW',
  roleStudentEdit: 'STUDENT_EDIT',

  roleUserView: 'USER_VIEW',
  roleUserEdit: 'USER_EDIT',

  roleEdit: 'ROLE_EDIT',

  roleCourseView: 'COURSE_VIEW',
  roleCourseEdit: 'COURSE_EDIT',

  roleHubView: 'HUB_VIEW',
  roleHubEdit: 'HUB_EDIT',

  roleClassView: 'CLASS_VIEW',
  roleClassEdit: 'CLASS_EDIT',

  // Legacy/backward compatibility permissions
  roleEventEdit: 'CLASS_EDIT', // Maps to class edit for events
  roleEventView: 'CLASS_VIEW', // Maps to class view for events
  roleGroupEdit: 'COURSE_EDIT', // Maps to course edit for groups
  roleGroupView: 'COURSE_VIEW', // Maps to course view for groups
  roleSmallGroupView: 'COURSE_VIEW', // Maps to course view for small groups
  roleCrmEdit: 'STUDENT_EDIT', // Maps to student edit for CRM
  roleCrmView: 'STUDENT_VIEW', // Maps to student view for CRM

  roleReportView: 'REPORT_VIEW',
  roleReportViewSubmissions: 'REPORT_VIEW_SUBMISSIONS',

  manageHelp: 'MANAGE_HELP',
};

// Deduplicated platform permissions for the role editor dropdown
export const permissionsList = [
  'DASHBOARD',
  'USER_VIEW',
  'USER_EDIT',
  'ROLE_EDIT',
  'STUDENT_VIEW',
  'STUDENT_EDIT',
  'COURSE_VIEW',
  'COURSE_EDIT',
  'CLASS_VIEW',
  'CLASS_EDIT',
  'HUB_VIEW',
  'HUB_EDIT',
  'ANNOUNCEMENT',
];

// Platform roles — used in role assignment dropdowns
export const platformRoles = [
  'SUPER_ADMIN',
  'ADMIN',
  'HUB_MANAGER',
  'TRAINER',
  'STUDENT',
];

export const courseCategories = {
  graphicDesign: 'graphic-design',
  websiteDevelopment: 'website-development',
  filmPhotography: 'film-photography',
  alxCourse: 'alx-course',
  // Legacy keys kept for backward compatibility
  webDevelopment: 'web-development',
  videoProduction: 'video-production',
  uiUxDesign: 'ui-ux-design',
  workshop: 'workshop',
};

export const hubLocations = {
  katanga: 'katanga',
  kosovo: 'kosovo',
  jinja: 'jinja',
  namayemba: 'namayemba',
  lyantode: 'lyantode',
};

export const redux = {
  doLogin: 'DO_LOGIN',
  doLogout: 'DO_LOGOUT',
  doSearch: 'DO_SEARCH',
};

export const localRoutes = {
  dashboard: '/dashboard',
  students: '/people/students',
  profile: '/people/students/me',
  studentsDetails: '/people/students/:studentId',
  courses: '/people/courses',
  coursesDetails: '/people/courses/:courseId',

  courseReports: '/courses',

  classes: '/classes',
  classDetails: '/classes/:classId',
  classActivities: '/classes/:activitiesId',

  reports: '/reports',
  reportsDetails: '/reports/:reportId',
  reportSubmit: '/reports/:reportId/submit',
  reportSubmissions: '/reports/:reportId/submissions',
  reportSubmissionDetails: '/reports/:reportId/submissions/:reportSubmissionId',

  users: '/admin/users',
  usersGroups: '/admin/user-groups',
  tags: '/admin/tags',
  settings: '/admin/settings',
  test: '/test',

  updatePassword: '/update-password',
  resetPassword: '/reset-password/:token',
  forgotPassword: '/forgot-password',
  help: '/help',
  login: '/login',
  register: '/register',
  home: '/',
  manageHelp: '/admin/manageHelp',
  chat: '/chat/email',

  calendar: '/calendar',
  reportCategories: '/admin/report-categories',
  courseCategories: '/admin/course-categories',
  classCategories: '/admin/class-categories',
  hubs: '/admin/hubs',

  // Student portal
  catalog: '/catalog',
  myCourses: '/my-courses',
  coursePlayer: '/my-courses/:courseId',
  myClasses: '/my-classes',
  myProfile: '/my-profile',
  myAssignments: '/my-assignments',
  myProgress: '/my-progress',

  // Student portal — new screens
  myAssessments: '/my-assessments',
  myRequests: '/my-requests',
  workshops: '/workshops',
  myTimetable: '/my-timetable',
  chatsInquiries: '/chats',
  studentCourses: '/student-courses',

  // Attendance
  attendance: '/admin/attendance',
  attendanceSession: '/admin/attendance/:sessionId',
  attendanceCheckin: '/attend/:token',
  attendanceCode: '/attend',

  // Admin — exams & assignments
  exams: '/admin/exams',
  examDetails: '/admin/exams/:examId',
  teacherAssignments: '/admin/assignments',
  teacherAssignmentDetails: '/admin/assignments/:assignmentId',
  timetable: '/admin/timetable',
  adminCourses: '/admin/courses',
  trainerCourses: '/trainer/courses',
  trainerStudents: '/trainer/students',
  trainerLectures: '/trainer/lectures',
  trainerResources: '/trainer/resources',
  trainerAnalytics: '/trainer/analytics',
  adminAnnouncements: '/admin/announcements',
};

export const apiBaseUrl =
  process.env.REACT_APP_API_URL || 'http://localhost:4002';

export const remoteRoutes = {
  authServer: apiBaseUrl,

  login: `${apiBaseUrl}/api/auth/login`,
  profile: `${apiBaseUrl}/api/auth/profile`,
  register: `${apiBaseUrl}/api/register`,
  forgotPassword: `${apiBaseUrl}/api/auth/forgot-password`,
  resetPassword: `${apiBaseUrl}/api/auth/reset-password`,
  students: `${apiBaseUrl}/api/students`,
  studentSchedule: `${apiBaseUrl}/api/students/me/schedule`,
  studentSearch: `${apiBaseUrl}/api/student/search`,
  studentById: `${apiBaseUrl}/api/students/id`,
  studentsPeople: `${apiBaseUrl}/api/students/people`,
  studentsPeopleCombo: `${apiBaseUrl}/api/students/people/combo`,

  studentsPeopleSample: `${apiBaseUrl}/api/students/import`,
  studentsPeopleUpload: `${apiBaseUrl}/api/students/import`,
  studentsHub: `${apiBaseUrl}/api/student/hub`,
  studentsEmail: `${apiBaseUrl}/api/students/emails`,
  tags: `${apiBaseUrl}/api/tags`,
  users: `${apiBaseUrl}/api/users`,
  userGroups: `${apiBaseUrl}/api/user-groups`,
  roles: `${apiBaseUrl}/api/user-roles`,
  studentsPhone: `${apiBaseUrl}/api/students/phones`,
  studentsAddress: `${apiBaseUrl}/api/students/addresses`,
  studentsIdentification: `${apiBaseUrl}/api/students/identifications`,
  studentsRequests: `${apiBaseUrl}/api/students/requests`,

  courses: `${apiBaseUrl}/api/courses/course`,
  coursesCombo: `${apiBaseUrl}/api/courses/combo`,
  coursesCategories: `${apiBaseUrl}/api/courses/category`,
  coursesEnrollment: `${apiBaseUrl}/api/courses/enrollment`,
  coursesRequest: `${apiBaseUrl}/api/courses/request`,
  courseReports: `${apiBaseUrl}/api/courses/coursereports`,
  courseReportFrequency: `${apiBaseUrl}/api/courses/reportfrequency`,
  courseCategoriesCombo: `${apiBaseUrl}/api/courses/coursescombo`,

  // Legacy mappings for backward compatibility
  groupsCombo: `${apiBaseUrl}/api/courses/combo`,
  groupsMembership: `${apiBaseUrl}/api/courses/enrollment`,
  groupsRequest: `${apiBaseUrl}/api/courses/request`,
  memberEventActivities: `${apiBaseUrl}/api/classes/member`,
  events: `${apiBaseUrl}/api/classes/class`,
  contactsPeopleCombo: `${apiBaseUrl}/api/students/people/combo`,

  // Additional legacy mappings
  eventsCategories: `${apiBaseUrl}/api/classes/category`,
  groupsCategories: `${apiBaseUrl}/api/courses/category`,
  eventsField: `${apiBaseUrl}/api/classes/fields`,
  contacts: `${apiBaseUrl}/api/students`,
  eventsActivity: `${apiBaseUrl}/api/classes/activities`,
  eventsAttendance: `${apiBaseUrl}/api/classes/attendance`,
  eventsRegistration: `${apiBaseUrl}/api/classes/registration`,
  groupReportFrequency: `${apiBaseUrl}/api/courses/reportfrequency`,
  groupCategoriesCombo: `${apiBaseUrl}/api/courses/coursescombo`,
  groups: `${apiBaseUrl}/api/courses/course`,
  contactsPeopleUpload: `${apiBaseUrl}/api/students/import`,
  contactsPeopleSample: `${apiBaseUrl}/api/students/import`,
  contactsAddress: `${apiBaseUrl}/api/students/addresses`,
  contactsEmail: `${apiBaseUrl}/api/students/emails`,
  contactsIdentification: `${apiBaseUrl}/api/students/identifications`,
  contactsPeople: `${apiBaseUrl}/api/students/people`,
  crmPeople: `${apiBaseUrl}/api/crm/people`,
  contactsPhone: `${apiBaseUrl}/api/students/phones`,
  eventsMetricsRaw: `${apiBaseUrl}/api/classes/metrics/raw`,

  classes: `${apiBaseUrl}/api/classes/class`,
  classesMetricsRaw: `${apiBaseUrl}/api/classes/metrics/raw`,
  classesCategories: `${apiBaseUrl}/api/classes/category`,
  classesAttendance: `${apiBaseUrl}/api/classes/attendance`,
  classesField: `${apiBaseUrl}/api/classes/fields`,
  classesActivity: `${apiBaseUrl}/api/classes/activities`,
  memberClassActivities: `${apiBaseUrl}/api/classes/member`,
  dayOff: `${apiBaseUrl}/api/classes/dayoff`,

  reports: `${apiBaseUrl}/api/reports`,
  // reportsSubmit is dynamic: use `${remoteRoutes.reports}/${reportId}/submissions`
  reportsCategories: `${apiBaseUrl}/api/reports/category`,

  studentsAvatar: `${apiBaseUrl}/api/students/student/avatar`,
  chat: `${apiBaseUrl}/api/chat/email`,
  classesRegistration: `${apiBaseUrl}/api/classes/registration`,
  help: `${apiBaseUrl}/api/help`,
  hubs: `${apiBaseUrl}/api/hubs`,
  myCourses: `${apiBaseUrl}/api/students/me/courses`,
  mySchedule: `${apiBaseUrl}/api/students/me/schedule`,
  coursesBase: `${apiBaseUrl}/api/courses`,
  courseInstructors: `${apiBaseUrl}/api/courses/instructors`,

  // Course weeks (used to calculate week unlock dates per student)
  courseWeeks: `${apiBaseUrl}/api/courses/weeks`,

  // Enrollment requests (admin)
  enrollmentPending: `${apiBaseUrl}/api/courses/enrollment/pending`,
  enrollmentApprove: `${apiBaseUrl}/api/courses/enrollment`,

  // Assignments (teacher side)
  assignments: `${apiBaseUrl}/api/assignments`,
  assignmentSubmissions: `${apiBaseUrl}/api/assignments/submissions`,
  assignmentFiles: `${apiBaseUrl}/api/assignments/files`,
  assignmentGrades: `${apiBaseUrl}/api/assignments/grades`,

  // Announcements & Calendar Events
  announcements: `${apiBaseUrl}/api/announcements`,
  calendarEvents: `${apiBaseUrl}/api/announcements/events`,

  // Exams
  exams: `${apiBaseUrl}/api/exams`,
  examResults: `${apiBaseUrl}/api/exams/results`,
  examSchedule: `${apiBaseUrl}/api/exams/schedule`,

  // Attendance
  attendanceSessions: `${apiBaseUrl}/api/attendance/sessions`,
  attendanceCheckin: `${apiBaseUrl}/api/attendance/checkin`,
  attendanceSession: `${apiBaseUrl}/api/attendance/session`,
  // GET /api/attendance/student-summary?contactId=X&days=7
  // Returns: [{ date: "2026-03-20", count: 1 }, ...] — one entry per day, last N days
  studentAttendanceSummary: `${apiBaseUrl}/api/attendance/student-summary`,
  // GET /api/attendance/student-history?contactId=X
  // Returns: [{ sessionId, sessionLabel, date, checkedInAt, course: { title }, method }]
  studentAttendanceHistory: `${apiBaseUrl}/api/attendance/student-history`,

  // Dashboard metrics
  dashboardStats: `${apiBaseUrl}/api/dashboard/stats`,
  dashboardReportStats: `${apiBaseUrl}/api/dashboard/report-stats`,
  hubStats: `${apiBaseUrl}/api/dashboard/hub-stats`,
  trainerStats: `${apiBaseUrl}/api/dashboard/trainer-stats`,
  courseResources: `${apiBaseUrl}/api/courses`, // append /:id/resources
  timetable: `${apiBaseUrl}/api/timetable`,

  // Course-scoped chat
  chatRooms: `${apiBaseUrl}/api/chat/rooms`,
  chatContacts: `${apiBaseUrl}/api/chat/contacts`,

  // File uploads
  uploads: `${apiBaseUrl}/api/uploads`,
  uploadsAvatar: `${apiBaseUrl}/api/uploads/avatar`,
};
