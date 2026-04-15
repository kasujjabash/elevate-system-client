import React, { Suspense, Component, ErrorInfo, ReactNode } from 'react';
import { Link, Route, Switch } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { appPermissions, localRoutes } from '../data/constants';
import Layout from '../components/layout/Layout';
import { IState } from '../data/types';
import { hasAnyRole, isStudent } from '../data/appRoles';
import Loading from '../components/Loading';
import MembersCalendar from './groups/members/MembersCalendar';
import StudentCalendar from './student/StudentCalendar';
const MyAssessments = React.lazy(() => import('./student/MyAssessments'));
import ReportList from './reports/ReportList';
import ReportSubmissions from './reports/ReportSubmissionsList';
import ReportSubmissionDetail from './reports/ReportSubmissionDetail';
import ReportSubmissionForm from './reports/ReportSubmissionForm';
// const Events= React.lazy(() => import( "./events/EventsList"));
// const GroupReports = React.lazy(() => import("./events/GroupEvents"));

const UserControl = React.lazy(() => import('./admin/users/UserControl'));

const Dashboard = React.lazy(() => import('./dashboard/Dashboard'));
const Contacts = React.lazy(() => import('./contacts/Contacts'));
const AdminStudentDetails = React.lazy(
  () => import('./contacts/details/AdminStudentDetails'),
);

const Settings = React.lazy(() => import('./settings/Settings'));
const Groups = React.lazy(() => import('./groups/GroupTabView'));
const GroupDetails = React.lazy(() => import('./groups/Details'));

const MembersEditor = React.lazy(
  () => import('./groups/members/MembersEditor'),
);
const UpdatePasswordConfirmation = React.lazy(
  () => import('./login/UpdatePasswordConfirmation'),
);
const EventDetails = React.lazy(() => import('./events/details/EventDetails'));
const EventReports = React.lazy(() => import('./events/EventReports'));
const Help = React.lazy(() => import('./help/Help'));
const ManageHelp = React.lazy(
  () => import('./admin/manageHelp/HelpFileDisplay'),
);

const MailChat = React.lazy(() => import('./messaging/MailChat'));
const ReportFields = React.lazy(
  () => import('./admin/reports/reportCategories'),
);

const GroupCategories = React.lazy(
  () => import('./admin/groupCategories/groupCategories'),
);

const EventActivitiesForm = React.lazy(
  () => import('./events/details/EventActivitiesForm'),
);

const CourseCatalog = React.lazy(() => import('./student/CourseCatalog'));
const MyCourses = React.lazy(() => import('./student/MyCourses'));
const CoursePlayer = React.lazy(() => import('./student/CoursePlayer'));
const MyClasses = React.lazy(() => import('./student/MyClasses'));
const MyProfile = React.lazy(() => import('./student/MyProfile'));
const MyAssignments = React.lazy(() => import('./student/Assignments'));
const MyProgress = React.lazy(() => import('./student/Progress'));
const EventCategories = React.lazy(
  () => import('./admin/eventsCategories/EventCategories'),
);
const Exams = React.lazy(() => import('./admin/exams/Exams'));
const TeacherAssignments = React.lazy(
  () => import('./admin/assignments/TeacherAssignments'),
);
const AdminCourses = React.lazy(() => import('./admin/courses/AdminCourses'));
const TrainerCourses = React.lazy(() => import('./trainer/TrainerCourses'));
const TrainerStudents = React.lazy(() => import('./trainer/TrainerStudents'));
const TrainerLectures = React.lazy(() => import('./trainer/TrainerLectures'));
const TrainerResources = React.lazy(() => import('./trainer/TrainerResources'));
const TrainerAnalytics = React.lazy(() => import('./trainer/TrainerAnalytics'));
const TrainerAnnouncements = React.lazy(
  () => import('./trainer/TrainerAnnouncements'),
);
const AdminAnnouncements = React.lazy(
  () => import('./admin/announcements/AdminAnnouncements'),
);
const Hubs = React.lazy(() => import('./admin/hubs/Hubs'));
const AdminAttendance = React.lazy(
  () => import('./admin/attendance/AdminAttendance'),
);
const AdminTimetable = React.lazy(
  () => import('./admin/timetable/AdminTimetable'),
);
const HubManagerReports = React.lazy(() => import('./hub/HubManagerReports'));
const CheckIn = React.lazy(() => import('./student/CheckIn'));
const AttendanceCode = React.lazy(() => import('./student/AttendanceCode'));
const MyRequests = React.lazy(() => import('./student/MyRequests'));
const Workshops = React.lazy(() => import('./student/Workshops'));
const AdminWorkshops = React.lazy(
  () => import('./admin/workshops/AdminWorkshops'),
);
const MyTimetable = React.lazy(() => import('./student/MyTimetable'));
const CourseChat = React.lazy(() => import('./chat/CourseChat'));
const StudentCourses = React.lazy(() => import('./student/StudentCourses'));

const Testing = () => (
  <Layout>
    <MembersEditor group={{ id: 1 }} done={() => undefined} />
  </Layout>
);

const NoMatch = () => (
  <Layout>
    <h2>Oops nothing here!!</h2>
    <Link to="/">Take me home</Link>
  </Layout>
);

class AppErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App error:', error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, fontFamily: 'monospace' }}>
          <h2 style={{ color: '#fe3a6a' }}>Something went wrong</h2>
          <pre style={{ color: '#333', whiteSpace: 'pre-wrap', fontSize: 13 }}>
            {(this.state.error as unknown as Error).message}
          </pre>
          <button onClick={() => this.setState({ error: null })}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const ContentSwitch = () => {
  const user = useSelector((state: IState) => state.core.user);
  return (
    <AppErrorBoundary>
      <Suspense fallback={<Loading />}>
        <Switch>
          <Route path={localRoutes.chat} component={MailChat} />

          <Route path={localRoutes.attendanceCheckin} component={CheckIn} />
          <Route
            exact
            path={localRoutes.attendanceCode}
            component={AttendanceCode}
          />

          <Route exact={true} path="/" component={Dashboard} />
          <Route path={localRoutes.dashboard} component={Dashboard} />

          <Route path={localRoutes.catalog} component={CourseCatalog} />
          <Route path={localRoutes.coursePlayer} component={CoursePlayer} />
          <Route path={localRoutes.myCourses} component={MyCourses} />
          <Route path={localRoutes.myClasses} component={MyClasses} />
          <Route path={localRoutes.myProfile} component={MyProfile} />
          <Route path={localRoutes.myAssignments} component={MyAssignments} />
          <Route path={localRoutes.myProgress} component={MyProgress} />
          <Route path={localRoutes.myAssessments} component={MyAssessments} />
          <Route path={localRoutes.myRequests} component={MyRequests} />
          <Route path={localRoutes.workshops} component={Workshops} />
          <Route path={localRoutes.adminWorkshops} component={AdminWorkshops} />
          <Route path={localRoutes.myTimetable} component={MyTimetable} />
          <Route path={localRoutes.chatsInquiries} component={CourseChat} />
          <Route path={localRoutes.studentCourses} component={StudentCourses} />

          <Route
            path={localRoutes.calendar}
            component={isStudent(user) ? StudentCalendar : MembersCalendar}
          />

          <Route
            path={localRoutes.studentsDetails}
            component={AdminStudentDetails}
          />
          {hasAnyRole(user, [
            appPermissions.roleStudentEdit,
            appPermissions.roleStudentView,
          ]) && <Route path={localRoutes.students} component={Contacts} />}

          {hasAnyRole(user, [
            appPermissions.roleUserEdit,
            appPermissions.roleUserView,
          ]) && <Route path={localRoutes.users} component={UserControl} />}

          {hasAnyRole(user, [
            appPermissions.roleCourseEdit,
            appPermissions.roleCourseView,
          ]) && (
            <Route path={localRoutes.coursesDetails} component={GroupDetails} />
          )}

          {hasAnyRole(user, [
            appPermissions.roleCourseEdit,
            appPermissions.roleCourseView,
          ]) && <Route path={localRoutes.courses} component={Groups} />}

          {hasAnyRole(user, [
            appPermissions.roleClassView,
            appPermissions.roleClassEdit,
          ]) && (
            <Route path={localRoutes.classDetails} component={EventDetails} />
          )}

          {hasAnyRole(user, [
            appPermissions.roleClassView,
            appPermissions.roleClassEdit,
          ]) && <Route path={localRoutes.classes} component={EventReports} />}

          {hasAnyRole(user, [appPermissions.roleReportView]) && (
            <Route
              path={localRoutes.reportSubmit}
              component={ReportSubmissionForm}
            />
          )}

          {hasAnyRole(user, [appPermissions.roleReportViewSubmissions]) && (
            <Route
              path={localRoutes.reportSubmissionDetails}
              component={ReportSubmissionDetail}
            />
          )}

          {hasAnyRole(user, [appPermissions.roleReportViewSubmissions]) && (
            <Route
              path={localRoutes.reportSubmissions}
              component={ReportSubmissions}
            />
          )}

          {hasAnyRole(user, [appPermissions.roleReportView]) && (
            <Route path={localRoutes.reports} component={ReportList} />
          )}

          <Route path={localRoutes.manageHelp} component={ManageHelp} />

          <Route path={localRoutes.settings} component={Settings} />
          <Route
            path={localRoutes.courseCategories}
            component={GroupCategories}
          />
          <Route path={localRoutes.reportCategories} component={ReportFields} />

          <Route
            path={localRoutes.classActivities}
            component={EventActivitiesForm}
          />

          <Route
            path={localRoutes.classCategories}
            component={EventCategories}
          />

          <Route path={localRoutes.exams} component={Exams} />
          <Route
            path={localRoutes.teacherAssignments}
            component={TeacherAssignments}
          />
          <Route path={localRoutes.adminCourses} component={AdminCourses} />
          <Route path={localRoutes.trainerCourses} component={TrainerCourses} />
          <Route
            path={localRoutes.trainerStudents}
            component={TrainerStudents}
          />
          <Route
            path={localRoutes.trainerLectures}
            component={TrainerLectures}
          />
          <Route
            path={localRoutes.trainerResources}
            component={TrainerResources}
          />
          <Route
            path={localRoutes.trainerAnalytics}
            component={TrainerAnalytics}
          />
          <Route
            path={localRoutes.trainerAnnouncements}
            component={TrainerAnnouncements}
          />
          <Route
            path={localRoutes.adminAnnouncements}
            component={AdminAnnouncements}
          />
          <Route path={localRoutes.hubs} component={Hubs} />
          <Route path={localRoutes.hubReports} component={HubManagerReports} />
          <Route path={localRoutes.attendance} component={AdminAttendance} />
          <Route path={localRoutes.timetable} component={AdminTimetable} />

          <Route path={localRoutes.test} component={Testing} />
          <Route
            path={localRoutes.updatePassword}
            component={UpdatePasswordConfirmation}
          />
          <Route path={localRoutes.help} component={Help} />
          <Route component={NoMatch} />
        </Switch>
      </Suspense>
    </AppErrorBoundary>
  );
};

export default ContentSwitch;
