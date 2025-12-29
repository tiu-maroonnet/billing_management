import React from 'react';
import { useRouter } from 'next/router';
import {
  HomeIcon,
  UserGroupIcon,
  WifiIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  TicketIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  ServerIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { usePermissions } from '../../hooks/useAuth';

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const router = useRouter();
  const permissions = usePermissions();

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: HomeIcon, 
      current: router.pathname === '/dashboard',
      permission: 'dashboard.view'
    },
    { 
      name: 'Customers', 
      href: '/customers', 
      icon: UserGroupIcon, 
      current: router.pathname.startsWith('/customers'),
      permission: 'customers.view'
    },
    { 
      name: 'Services', 
      href: '/services', 
      icon: WifiIcon, 
      current: router.pathname.startsWith('/services'),
      permission: 'services.view'
    },
    { 
      name: 'Plans', 
      href: '/plans', 
      icon: DocumentTextIcon, 
      current: router.pathname.startsWith('/plans'),
      permission: 'plans.view'
    },
    { 
      name: 'Invoices', 
      href: '/invoices', 
      icon: CreditCardIcon, 
      current: router.pathname.startsWith('/invoices'),
      permission: 'invoices.view'
    },
    { 
      name: 'Payments', 
      href: '/payments', 
      icon: CurrencyDollarIcon, 
      current: router.pathname.startsWith('/payments'),
      permission: 'payments.view'
    },
    { 
      name: 'Tickets', 
      href: '/tickets', 
      icon: TicketIcon, 
      current: router.pathname.startsWith('/tickets'),
      permission: 'tickets.view'
    },
    { 
      name: 'Routers', 
      href: '/routers', 
      icon: ServerIcon, 
      current: router.pathname.startsWith('/routers'),
      permission: 'routers.view'
    },
    { 
      name: 'Reports', 
      href: '/reports', 
      icon: ChartBarIcon, 
      current: router.pathname.startsWith('/reports'),
      permission: 'reports.view'
    },
    { 
      name: 'Settings', 
      href: '/settings', 
      icon: Cog6ToothIcon, 
      current: router.pathname.startsWith('/settings'),
      permission: 'settings.view'
    },
  ];

  const filteredNavigation = navigation.filter(item => 
    permissions.hasPermission(item.permission)
  );

  return (
    <div className="flex flex-col h-full bg-maroon-800">
      {/* Close button for mobile */}
      <div className="lg:hidden flex items-center justify-between p-4">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-lg bg-maroon-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <span className="ml-3 text-white font-bold text-lg">Maroon-NET</span>
        </div>
        <button
          type="button"
          className="text-white hover:text-gray-300"
          onClick={onClose}
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Sidebar content */}
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        {/* Logo for desktop */}
        <div className="hidden lg:flex items-center flex-shrink-0 px-4">
          <div className="h-10 w-10 rounded-lg bg-maroon-600 flex items-center justify-center">
            <span className="text-white font-bold text-xl">M</span>
          </div>
          <div className="ml-3">
            <h1 className="text-white font-bold text-xl">Maroon-NET</h1>
            <p className="text-maroon-200 text-xs">BCMS v1.0</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-8 flex-1 px-2 space-y-1">
          {filteredNavigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`
                group flex items-center px-3 py-2 text-sm font-medium rounded-md
                ${item.current
                  ? 'bg-maroon-900 text-white'
                  : 'text-maroon-100 hover:bg-maroon-700 hover:text-white'
                }
              `}
              onClick={(e) => {
                if (onClose) onClose();
                if (item.href.startsWith('/')) {
                  e.preventDefault();
                  router.push(item.href);
                }
              }}
            >
              <item.icon
                className={`
                  mr-3 h-5 w-5 flex-shrink-0
                  ${item.current ? 'text-white' : 'text-maroon-300 group-hover:text-white'}
                `}
                aria-hidden="true"
              />
              {item.name}
            </a>
          ))}
        </nav>

        {/* System status */}
        <div className="mt-8 px-4">
          <div className="bg-maroon-900 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">System Status</p>
                <p className="text-xs text-maroon-200">All systems operational</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User info at bottom */}
      <div className="flex-shrink-0 flex border-t border-maroon-700 p-4">
        <div className="flex items-center">
          <div className="ml-3">
            <p className="text-sm font-medium text-white">
              {typeof window !== 'undefined' && localStorage.getItem('user_name') || 'User'}
            </p>
            <p className="text-xs text-maroon-200">
              {typeof window !== 'undefined' && localStorage.getItem('user_role') || 'Role'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;