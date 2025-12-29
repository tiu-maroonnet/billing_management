import React from 'react';

interface Tab {
  id: string;
  name: string;
  icon?: React.ComponentType<{ className?: string }>;
  count?: number;
  disabled?: boolean;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && onChange(tab.id)}
              disabled={tab.disabled}
              className={`
                group inline-flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${tab.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                ${
                  activeTab === tab.id
                    ? 'border-maroon-500 text-maroon-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }
              `}
            >
              {Icon && (
                <Icon
                  className={`mr-2 h-5 w-5 ${
                    activeTab === tab.id
                      ? 'text-maroon-500'
                      : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
              )}
              {tab.name}
              {tab.count !== undefined && (
                <span
                  className={`ml-2 py-0.5 px-1.5 rounded-full text-xs font-medium ${
                    activeTab === tab.id
                      ? 'bg-maroon-100 text-maroon-600'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default TabNavigation;