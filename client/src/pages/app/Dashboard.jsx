import { useAuth } from '../../context/useAuth';
import AdminDashboard from './dashboard/AdminDashboard';
import EmployeeDashboard from './dashboard/EmployeeDashboard';

const Dashboard = () => {
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminDashboard /> : <EmployeeDashboard />;
};

export default Dashboard;
