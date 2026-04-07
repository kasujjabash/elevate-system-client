import React from 'react';
import { useSelector } from 'react-redux';
import { isStudent, isHubManager, isTrainer } from '../../data/appRoles';
import { IState } from '../../data/types';
import StudentDashboard from '../student/StudentDashboard';
import AdminDashboard from './AdminDashboard';
import HubManagerDashboard from './HubManagerDashboard';
import TrainerDashboard from './TrainerDashboard';

const Dashboard = () => {
  const user = useSelector((state: IState) => state.core.user);

  if (isStudent(user)) return <StudentDashboard />;
  if (isHubManager(user)) return <HubManagerDashboard />;
  if (isTrainer(user)) return <TrainerDashboard />;

  // Super Admin, ADMIN, PRINCIPAL — full academy view
  return <AdminDashboard />;
};

export default Dashboard;
