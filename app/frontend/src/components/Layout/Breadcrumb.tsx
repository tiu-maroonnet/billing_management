import React from 'react';
import { useRouter } from 'next/router';
import { HomeIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const Breadcrumb: React.FC = () => {
  const router = useRouter();
  const pathnames = router.pathname.split('/').filter(x => x);

  const getBreadcrumbName = (path: string): string => {
    const names: { [key: string]: string } = {
      dashboard: 'Dashboard',
      customers: 'Customers',
      services: 'Services',
      plans: 'Plans',
      invoices: 'Invoices',
      payments: 'Payments',
      tickets: 'Tickets',
      routers: 'Routers',
      reports: 'Reports',
      settings: 'Settings',
      create: 'Create',
      edit: 'Edit',
      view: 'View',
    };
    return names[path] || path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <a href="/dashboard" className="text-gray-400 hover:text-gray-500">
            <HomeIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
            <span className="sr-only">Home</span>
          </a>
        </li>
        
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;

          return (
            <li key={to}>
              <div className="flex items-center">
                <ChevronRightIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                {isLast ? (
                  <span className="ml-2 text-sm font-medium text-gray-500">
                    {getBreadcrumbName(value)}
                  </span>
                ) : (
                  <a
                    href={to}
                    className="ml-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    {getBreadcrumbName(value)}
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;