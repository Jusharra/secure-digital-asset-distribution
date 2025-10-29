import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Lock, Phone, Bell, Shield } from 'lucide-react';

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export function SettingsLayout({ children }: SettingsLayoutProps) {
  const location = useLocation();

  const navigation = [
    { name: 'Profile', href: '/settings/profile', icon: User },
    { name: 'Security', href: '/settings/security', icon: Lock },
    { name: 'Contact', href: '/settings/contact', icon: Phone },
    { name: 'Notifications', href: '/settings/notifications', icon: Bell },
    { name: 'Privacy', href: '/settings/privacy', icon: Shield },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
        <aside className="py-6 px-2 sm:px-6 lg:col-span-3 lg:py-0">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    isActive
                      ? 'bg-gray-50 text-indigo-600 hover:bg-white'
                      : 'text-gray-900 hover:bg-gray-50'
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-md`}
                >
                  <Icon
                    className={`${
                      isActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
                    } flex-shrink-0 -ml-1 mr-3 h-6 w-6`}
                  />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
          {children}
        </div>
      </div>
    </div>
  );
}