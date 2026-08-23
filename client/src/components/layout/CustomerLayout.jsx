import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const CustomerLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <nav className="bg-white border-b border-ink-100 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <span className="font-bold text-brand-500">RoadSathi</span>
          <div className="flex items-center gap-4 text-sm">
            <Link
              to="/customer"
              className={location.pathname === '/customer' ? 'text-brand-500 font-medium' : 'text-ink-500'}
            >
              Get Help
            </Link>
            <Link
              to="/customer/history"
              className={location.pathname.includes('history') ? 'text-brand-500 font-medium' : 'text-ink-500'}
            >
              History
            </Link>
            <button onClick={handleLogout} className="text-ink-500 hover:text-danger">
              Logout
            </button>
          </div>
        </div>
      </nav>
      <Outlet />
    </div>
  );
};

export default CustomerLayout;