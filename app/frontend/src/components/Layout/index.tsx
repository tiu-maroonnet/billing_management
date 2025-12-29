import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { 
  Bars3Icon, 
  XMarkIcon, 
  BellIcon, 
  UserCircleIcon,
  ChevronDownIcon 
} from '@heroicons/react/24/outline';
import { useAuth, usePermissions } from '../../hooks/useAuth';
import Sidebar from './Sidebar';
import Breadcrumb from './Breadcrumb';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = 'Maroon-NET BCMS',
  description = 'Billing & Customer Management System for PT. Trira Inti Utama'
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { user, logout } = useAuth();
  const permissions = usePermissions();
  const router = useRouter();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuOpen && !(event.target as Element).closest('.user-menu')) {
        setUserMenuOpen(false);
      }
      if (notificationsOpen && !(event.target as Element).closest('.notifications-menu')) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [userMenuOpen, notificationsOpen]);

  // Mock notifications data
  const notifications = [
    { id: 1, title: 'New payment received', message: 'Payment for INV-2024-001', time: '5 min ago', read: false },
    { id: 2, title: 'Service suspended', message: 'Customer ID 123 suspended', time: '1 hour ago', read: false },
    { id: 3, title: 'New ticket created', message: 'Technical issue reported', time: '2 hours ago', read: true },
  ];

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      <Head>
        <title>{title} | Maroon-NET BCMS</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Sidebar for mobile */}
        <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex w-64 max-w-xs">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64">
          <Sidebar />
        </div>

        {/* Main content */}
        <div className="lg:pl-64">
          {/* Top navigation */}
          <div className="sticky top-0 z-10 bg-white shadow-sm">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 justify-between">
                {/* Left section - Mobile menu button */}
                <div className="flex items-center">
                  <button
                    type="button"
                    className="lg:hidden -ml-2 mr-2 p-2 text-gray-400 hover:text-gray-500"
                    onClick={() => setSidebarOpen(true)}
                  >
                    <span className="sr-only">Open sidebar</span>
                    <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                  </button>

                  {/* Breadcrumb */}
                  <Breadcrumb />
                </div>

                {/* Right section - User menu and notifications */}
                <div className="flex items-center space-x-4">
                  {/* Notifications */}
                  <div className="relative notifications-menu">
                    <button
                      type="button"
                      className="p-2 text-gray-400 hover:text-gray-500 relative"
                      onClick={() => setNotificationsOpen(!notificationsOpen)}
                    >
                      <BellIcon className="h-6 w-6" aria-hidden="true" />
                      {unreadNotifications > 0 && (
                        <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
                      )}
                    </button>

                    {notificationsOpen && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                        <div className="p-4 border-b">
                          <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`px-4 py-3 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                            >
                              <div className="flex items-start">
                                <div className="ml-3 flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {notification.title}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {notification.time}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="border-t p-2">
                          <button className="w-full text-center text-sm text-maroon-600 hover:text-maroon-700 font-medium py-2">
                            View all notifications
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User menu */}
                  <div className="relative user-menu">
                    <button
                      type="button"
                      className="flex items-center space-x-3 text-sm rounded-full focus:outline-none"
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                    >
                      <div className="flex items-center">
                        <UserCircleIcon className="h-8 w-8 text-gray-400" />
                        <div className="ml-3 text-left hidden md:block">
                          <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                          <p className="text-xs text-gray-500">{user?.group.name}</p>
                        </div>
                        <ChevronDownIcon className="ml-2 h-5 w-5 text-gray-400" />
                      </div>
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                        <div className="py-1">
                          <div className="px-4 py-2 border-b">
                            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                          </div>
                          
                          <a
                            href="/profile"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Your Profile
                          </a>
                          <a
                            href="/settings"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Settings
                          </a>
                          
                          {permissions.isAdmin && (
                            <a
                              href="/admin"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t"
                            >
                              Admin Panel
                            </a>
                          )}

                          <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t"
                          >
                            Sign out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main content area */}
          <main className="py-6">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default Layout;