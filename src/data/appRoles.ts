import { IAuthUser } from './types';

export const appRoles = {
  Super: 'SUPER',
  Admin: 'ADMIN',
  Principal: 'PRINCIPAL',
  SchoolAdmin: 'SCHOOL_ADMIN',
  StudentManager: 'STUDENT_MANAGER',
  CourseManager: 'COURSE_MANAGER',
  Instructor: 'INSTRUCTOR',
  HubManager: 'HUB_MANAGER',

  User: 'USER',
  Student: 'STUDENT',
};

export const principalRoles = [appRoles.Admin, appRoles.Principal];
export const schoolRoles = [
  appRoles.SchoolAdmin,
  appRoles.StudentManager,
  appRoles.CourseManager,
  appRoles.Instructor,
  appRoles.HubManager,
];
export const backOfficeRoles = [
  ...principalRoles,
  appRoles.SchoolAdmin,
  appRoles.StudentManager,
  appRoles.CourseManager,
];
export const principalAssignRoles = [
  ...backOfficeRoles,
  appRoles.User,
  appRoles.Instructor,
];
export const schoolAssignRoles = [
  ...schoolRoles,
  appRoles.User,
  appRoles.Student,
];

export const isStudent = (user: IAuthUser): boolean => {
  if (!user) return false;
  const roles = user.roles || [];
  // Positive match: role name contains "student"
  if (roles.some((r) => r.toLowerCase().includes('student'))) return true;
  // Staff roles — if the user has any of these, they are definitely not a student
  const staffKeywords = [
    'admin',
    'principal',
    'trainer',
    'instructor',
    'manager',
    'super',
  ];
  if (roles.some((r) => staffKeywords.some((k) => r.toLowerCase().includes(k))))
    return false;
  // No staff permissions → treat as student (handles accounts created without explicit role)
  const staffPerms = [
    'STUDENT_EDIT',
    'USER_VIEW',
    'USER_EDIT',
    'ROLE_EDIT',
    'GROUP_EDIT',
  ];
  const perms = user.permissions || [];
  if (perms.some((p) => staffPerms.includes(p))) return false;
  return true;
};

export const hasRole = (user: IAuthUser, appPermission: string): boolean => {
  // Non-student users (admin/trainer) can see all staff nav items.
  // Real data security is enforced by the server.
  if (!isStudent(user)) {
    return true;
  }
  const { permissions = [] } = user || {};
  return permissions?.indexOf(appPermission) > -1;
};

export const hasAnyRole = (
  user: IAuthUser,
  appPermissions: string[],
): boolean => appPermissions.filter(Boolean).some((it) => hasRole(user, it));

export const isPrincipalUser = (user: IAuthUser) =>
  hasAnyRole(user, [...principalRoles, appRoles.Super]);

export const isBackOfficeUser = (user: IAuthUser) =>
  hasAnyRole(user, [...backOfficeRoles, appRoles.Super]);

export const isSchoolAdmin = (user: IAuthUser) =>
  hasAnyRole(user, [appRoles.SchoolAdmin]);

export const isInstructor = (user: IAuthUser) =>
  hasAnyRole(user, [appRoles.Instructor]);
