import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  Home,
  Package,
  Users,
  ShoppingCart,
  Settings,
  Key,
  BarChart,
  Upload,
  Truck,
  Store,
  FileText,
  Gift,
  UserCircle,
  LogOut
} from 'lucide-react';

interface DashboardSidebarProps {
  userRole: 'admin' | 'creator' | 'retailer' | 'courier' | 'consumer';
}

export function DashboardSidebar({ userRole }: DashboardSidebarProps) {
  const location = useLocation();
  const { signOut } = useAuth();

  const getNavLinks = () => {
    switch (userRole) {
      case 'admin':
        return [
          { to: '/admin/dashboard', icon: <Home size={20} />, label: 'Dashboard' },
          { to: '/admin/distribution', icon: <BarChart size={20} />, label: 'Distribution' },
          { to: '/admin/cards', icon: <Package size={20} />, label: 'Cards' },
          { to: '/admin/key-management', icon: <Key size={20} />, label: 'Key Management' }
        ];
      case 'creator':
        return [
          { to: '/creator/dashboard', icon: <Home size={20} />, label: 'Dashboard' },
          { to: '/creator/assets', icon: <Package size={20} />, label: 'My Assets' },
          { to: '/creator/upload', icon: <Upload size={20} />, label: 'Upload' },
          { to: '/creator/distribution', icon: <BarChart size={20} />, label: 'Distribution' }
        ];
      case 'consumer':
        return [
          { to: '/consumer/dashboard', icon: <Home size={20} />, label: 'Dashboard' },
          { to: '/consumer/assets', icon: <Package size={20} />, label: 'My Assets' },
          { to: '/consumer/purchases', icon: <ShoppingCart size={20} />, label: 'Purchases' },
          { to: '/consumer/earnings', icon: <Gift size={20} />, label: 'Earnings' },
          { to: '/consumer/referrals', icon: <Users size={20} />, label: 'Referrals' }
        ];
      case 'retailer':
        return [
          { to: '/retailer/dashboard', icon: <Home size={20} />, label: 'Dashboard' },
          { to: '/retailer/batches', icon: <Package size={20} />, label: 'My Batches' },
          { to: '/retailer/activate', icon: <Key size={20} />, label: 'Activate Cards' },
          { to: '/retailer/bids', icon: <Store size={20} />, label: 'Available Bids' }
        ];
      case 'courier':
        return [
          { to: '/courier/dashboard', icon: <Home size={20} />, label: 'Dashboard' },
          { to: '/courier/deliveries', icon: <Truck size={20} />, label: 'Deliveries' }
        ];
      default:
        return [];
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="w-64 bg-white h-screen border-r border-gray-200 flex flex-col">
      <div className="p-4">
        <Link to="/" className="flex items-center space-x-2">
          <FileText className="h-8 w-8 text-indigo-600" />
          <span className="text-xl font-semibold text-gray-900">Digital Assets</span>
        </Link>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {getNavLinks().map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                  isActive(link.to)
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <ul className="space-y-2">
          <li>
            <Link
              to="/settings/profile"
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                isActive('/settings/profile')
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <UserCircle size={20} />
              <span>Profile</span>
            </Link>
          </li>
          <li>
            <Link
              to="/settings"
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                isActive('/settings')
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Settings size={20} />
              <span>Settings</span>
            </Link>
          </li>
          <li>
            <button
              onClick={signOut}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 text-gray-700 hover:bg-gray-100 w-full"
            >
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}