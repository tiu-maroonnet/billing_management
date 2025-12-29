import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Wifi, 
  FileText, 
  CreditCard, 
  Ticket, 
  Settings, 
  Router,
  Package,
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['*'] },
  { path: '/customers', label: 'Pelanggan', icon: Users, roles: ['supervisor', 'administrator', 'finance', 'support', 'technician'] },
  { path: '/services', label: 'Layanan', icon: Wifi, roles: ['technician', 'supervisor', 'administrator'] },
  { path: '/billing/invoices', label: 'Tagihan', icon: FileText, roles: ['finance', 'supervisor', 'administrator', 'teller'] },
  { path: '/billing/payments', label: 'Pembayaran', icon: CreditCard, roles: ['finance', 'supervisor', 'administrator', 'teller'] },
  { path: '/tickets', label: 'Tiket', icon: Ticket, roles: ['support', 'supervisor', 'administrator', 'technician'] },
  { path: '/routers', label: 'Router', icon: Router, roles: ['technician', 'supervisor', 'administrator'] },
  { path: '/settings/plans', label: 'Paket', icon: Package, roles: ['supervisor', 'administrator'] },
  { path: '/settings/company', label: 'Perusahaan', icon: Settings, roles: ['administrator'] },
  { path: '/settings/users', label: 'Pengguna', icon: User, roles: ['supervisor', 'administrator'] },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuthStore()

  const hasAccess = (roles: string[]) => {
    if (!user) return false
    if (roles.includes('*')) return true
    return roles.includes(user.group.slug)
  }

  const filteredMenu = menuItems.filter(item => hasAccess(item.roles))

  return (
    <aside className={`bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-maroon rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">M</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">Maroon-NET</span>
              </div>
            )}
            {collapsed && (
              <div className="w-8 h-8 bg-maroon rounded-lg flex items-center justify-center mx-auto">
                <span className="text-white font-bold">M</span>
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
          {filteredMenu.map((item) => {
            const isActive = pathname.startsWith(item.path)
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start'} p-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-maroon text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                title={collapsed ? item.label : ''}
              >
                <item.icon size={20} />
                {!collapsed && <span className="ml-3">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          {!collapsed && user && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-maroon rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user.group.name}
                </p>
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
          {collapsed && user && (
            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 bg-maroon rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}