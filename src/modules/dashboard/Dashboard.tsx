import React from 'react';
import { useSelector } from 'react-redux';
import { isStudent } from '../../data/appRoles';
import { IState } from '../../data/types';
import StudentDashboard from '../student/StudentDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard = () => {
  const user = useSelector((state: IState) => state.core.user);
  if (isStudent(user)) {
    return <StudentDashboard />;
  }
  return <AdminDashboard />;
};

export default Dashboard;
