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

export const isStudent = (user: IAuthUser) =>
  user?.roles?.includes(appRoles.Student) ?? false;

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
