import { Grid } from '@material-ui/core';
import {
  Build,
  EmojiPeople,
  Grain,
  Info,
  Money,
  People,
} from '@material-ui/icons';
import { filter } from 'lodash';
import React from 'react';
import { useSelector } from 'react-redux';
import { printInteger, printMoney } from '../../utils/numberHelpers';
import { IEvent, IInterval } from '../events/types';
import Widget from './Widget';
import { AgField, aggregateValue, aggregateValues } from './utils';
import { hasAnyRole } from '../../data/appRoles';
import { appPermissions } from '../../data/constants';
import { IState } from '../../data/types';

interface IProps {
  currDataEvents: IEvent[];
  prevDataEvents: IEvent[];
  interval: IInterval | undefined;
}

const fields: AgField[] = [
  {
    path: 'metaData.tuitionFees',
    name: 'tuitionFees',
  },
  {
    path: 'metaData.noOfCertifications',
    name: 'noOfCertifications',
  },
  {
    path: 'metaData.noOfEnrollments',
    name: 'noOfEnrollments',
  },
  {
    path: 'metaData.noOfInstructors',
    name: 'noOfInstructors',
  },
  {
    path: 'metaData.totalCourseAttendance',
    name: 'totalCourseAttendance',
  },
  {
    path: 'metaData.totalClassAttendance',
    name: 'totalClassAttendance',
  },
];
const DashboardData = ({
  currDataEvents,
  prevDataEvents,
  interval,
}: IProps) => {
  const currentData = aggregateValues(currDataEvents, fields);
  const previousData = aggregateValues(prevDataEvents, fields);
  const totalCourseAttendance = aggregateValue(
    filter(currDataEvents, { categoryId: 'course' }),
    'attendance',
  );
  const totalCourseAttendancePrev = aggregateValue(
    filter(prevDataEvents, { categoryId: 'course' }),
    'attendance',
  );

  // const [babies, setBabies] = useState<number>(0);
  // const [prevBabies, setPrevBabies] = useState<number>(0);
  // const [weddings, setWeddings] = useState<number>(0);
  // const [prevWeddings, setPrevWeddings] = useState<number>(0);

  const getPercentage = (prev: number, current: number) => {
    if (prev > 0) {
      return ((current - prev) / prev) * 100;
    }
    return 0;
  };
  const user = useSelector((state: IState) => state.core.user);
  const data = [
    {
      title: 'Course Attendance',
      value: printInteger(totalCourseAttendance),
      percentage: getPercentage(
        totalCourseAttendance,
        totalCourseAttendancePrev,
      ),
      icon: Grain,
    },
    {
      title: 'Course Completions',
      value: printInteger(currentData.noOfCertifications),
      percentage: getPercentage(
        previousData.noOfCertifications,
        currentData.noOfCertifications,
      ),
      icon: Info,
    },
    {
      title: 'Active Instructors',
      value: printInteger(currentData.noOfInstructors),
      percentage: getPercentage(
        previousData.noOfInstructors,
        currentData.noOfInstructors,
      ),
      icon: Build,
    },
    {
      title: 'New Enrollments',
      value: printInteger(currentData.noOfEnrollments),
      percentage: getPercentage(
        previousData.noOfEnrollments,
        currentData.noOfEnrollments,
      ),
      icon: EmojiPeople,
    },
    {
      title: 'Total Class Attendance',
      value: printInteger(currentData.totalClassAttendance),
      percentage: getPercentage(
        previousData.totalClassAttendance,
        currentData.totalClassAttendance,
      ),
      icon: People,
    },
    {
      title: 'Tuition Revenue',
      value: printMoney(currentData.tuitionFees),
      percentage: getPercentage(
        previousData.tuitionFees,
        currentData.tuitionFees,
      ),
      icon: Money,
    },
  ];

  return (
    <>
      <Grid container spacing={2}>
        {data.map((it) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={it.title}>
            <Widget interval={interval} {...it} />
          </Grid>
        ))}
      </Grid>
      {hasAnyRole(user, [appPermissions.roleReportViewSubmissions]) && (
        <Grid item xs={12}>
          <iframe
            src="http://reports.kanzucodefoundation.org/public/dashboard/4b26ad5c-f052-4fa7-a893-d4a591c6281d#refresh=10&bordered=false&background=false"
            frameBorder="0"
            style={{
              width: '90%',
              height: '800px',
              border: 'none',
            }}
            title="Elevate Academy Dashboard"
            allowTransparency={true}
          />
        </Grid>
      )}
    </>
  );
};

export default DashboardData;
