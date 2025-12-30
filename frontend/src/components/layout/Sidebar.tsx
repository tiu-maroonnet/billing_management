// frontend/src/components/layout/Sidebar.tsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  WifiIcon,
  DocumentTextIcon,
  CreditCardIcon,
  TicketIcon,
  ChartBarIcon,
  CogIcon,
  UserGroupIcon,
  BellIcon,
  LogoutIcon,
} from '@heroicons/react/outline';
import { useAuth } from '../../hooks/useAuth';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Pelanggan', href: '/customers', icon: UsersIcon },
    { name: 'Layanan', href: '/services', icon: WifiIcon },
    { name: 'Tagihan', href: '/invoices', icon: DocumentTextIcon },
    { name: 'Pembayaran', href: '/payments', icon: CreditCardIcon },
    { name: 'Tiket', href: '/tickets', icon: TicketIcon },
    { name: 'Laporan', href: '/reports', icon: ChartBarIcon },
    { name: 'Pengaturan', href: '/settings', icon: CogIcon },
    { name: 'Manajemen User', href: '/users', icon: UserGroupIcon },
    { name: 'Notifikasi', href: '/notifications', icon: BellIcon },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-maroon-800">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 flex-shrink-0 px-4 bg-maroon-900">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center">
              <span className="text-maroon-800 font-bold text-sm">MN</span>
            </div>
            <span className="ml-3 text-white font-bold text-lg">Maroon-NET</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md
                    ${isActive(item.href)
                      ? 'bg-maroon-900 text-white'
                      : 'text-maroon-100 hover:bg-maroon-700 hover:text-white'
                    }
                  `}
                >
                  <Icon
                    className={`
                      mr-3 flex-shrink-0 h-6 w-6
                      ${isActive(item.href) ? 'text-white' : 'text-maroon-300'}
                    `}
                    aria-hidden="true"
                  />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User profile */}
        <div className="flex-shrink-0 flex border-t border-maroon-700 p-4">
          <div className="flex items-center">
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs font-medium text-maroon-200">{user?.email}</p>
              <p className="text-xs text-maroon-300">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="ml-auto flex-shrink-0 p-1 text-maroon-200 hover:text-white"
          >
            <LogoutIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;