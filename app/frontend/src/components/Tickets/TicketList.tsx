import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  TicketIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import TicketService, { Ticket, TicketFilter } from '../../services/ticket.service';
import { usePermissions } from '../../hooks/useAuth';
import Pagination from '../Common/Pagination';
import StatusBadge from '../Common/StatusBadge';

const TicketList: React.FC = () => {
  const router = useRouter();
  const permissions = usePermissions();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<TicketFilter>({
    status: 'all',
    priority: 'all',
    page: 1,
    per_page: 10,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [filters]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await TicketService.getTickets(filters);
      setTickets(response.data);
      setTotalPages(response.meta.last_page);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchQuery, page: 1 }));
  };

  const handleFilterChange = (key: keyof TicketFilter, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleDeleteTicket = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;
    
    try {
      await TicketService.deleteTicket(id);
      fetchTickets();
    } catch (error) {
      console.error('Failed to delete ticket:', error);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'high': return <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />;
      case 'medium': return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'low': return <ClockIcon className="h-5 w-5 text-green-500" />;
      default: return <TicketIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} days ago`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Support Tickets</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage customer support requests
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {permissions.canManageTickets && (
              <button
                onClick={() => router.push('/tickets/create')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-maroon-600 hover:bg-maroon-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                New Ticket
              </button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-4">
          <form onSubmit={handleSearch} className="flex space-x-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tickets by subject, customer, or ticket number..."
                className="pl-10 w-full border-gray-300 rounded-md focus:ring-maroon-500 focus:border-maroon-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <FunnelIcon className="h-4 w-4" />
            </button>
          </form>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md focus:ring-maroon-500 focus:border-maroon-500"
                  >
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <select
                    value={filters.priority}
                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md focus:ring-maroon-500 focus:border-maroon-500"
                  >
                    <option value="all">All Priorities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md focus:ring-maroon-500 focus:border-maroon-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="technical">Technical</option>
                    <option value="billing">Billing</option>
                    <option value="general">General</option>
                    <option value="complaint">Complaint</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Assigned To</label>
                  <select
                    value={filters.assigned_to}
                    onChange={(e) => handleFilterChange('assigned_to', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md focus:ring-maroon-500 focus:border-maroon-500"
                  >
                    <option value="">All Technicians</option>
                    {/* Populate with technicians from API */}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">Open</p>
            <p className="text-2xl font-bold text-yellow-600">
              {tickets.filter(t => t.status === 'open').length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">In Progress</p>
            <p className="text-2xl font-bold text-blue-600">
              {tickets.filter(t => t.status === 'in_progress').length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Resolved</p>
            <p className="text-2xl font-bold text-green-600">
              {tickets.filter(t => t.status === 'resolved').length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Critical</p>
            <p className="text-2xl font-bold text-red-600">
              {tickets.filter(t => t.priority === 'critical').length}
            </p>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="divide-y divide-gray-200">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-48"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center">
            <TicketIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No tickets found</p>
            {permissions.canManageTickets && (
              <button
                onClick={() => router.push('/tickets/create')}
                className="mt-4 text-maroon-600 hover:text-maroon-700 font-medium"
              >
                Create your first ticket
              </button>
            )}
          </div>
        ) : (
          tickets.map((ticket) => (
            <div key={ticket.id} className="p-6 hover:bg-gray-50">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    {getPriorityIcon(ticket.priority)}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {ticket.subject}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="text-sm text-gray-500">
                          #{ticket.ticket_number}
                        </span>
                        <span className="text-sm text-gray-500">•</span>
                        <div className="flex items-center text-sm text-gray-500">
                          <UserIcon className="h-4 w-4 mr-1" />
                          {ticket.customer?.name}
                        </div>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">
                          {getTimeAgo(ticket.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {ticket.description}
                  </p>
                  
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      {ticket.category}
                    </span>
                    {ticket.assigned_to && (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        <UserIcon className="h-3 w-3 mr-1" />
                        {ticket.technician_name}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-end space-y-3">
                  <StatusBadge status={ticket.status === 'closed' ? 'inactive' : 'active'} />
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => router.push(`/tickets/${ticket.id}`)}
                      className="text-gray-400 hover:text-gray-600"
                      title="View"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    {permissions.canManageTickets && (
                      <button
                        onClick={() => router.push(`/tickets/${ticket.id}/edit`)}
                        className="text-blue-400 hover:text-blue-600"
                        title="Edit"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                    )}
                    {permissions.canManageTickets && ticket.status !== 'closed' && (
                      <button
                        onClick={() => router.push(`/tickets/${ticket.id}/reply`)}
                        className="text-green-400 hover:text-green-600"
                        title="Reply"
                      >
                        <ChatBubbleLeftRightIcon className="h-5 w-5" />
                      </button>
                    )}
                    {permissions.canManageTickets && (
                      <button
                        onClick={() => handleDeleteTicket(ticket.id)}
                        className="text-red-400 hover:text-red-600"
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {!loading && tickets.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{(filters.page - 1) * filters.per_page + 1}</span> to{' '}
              <span className="font-medium">{Math.min(filters.page * filters.per_page, tickets.length)}</span> of{' '}
              <span className="font-medium">{totalPages * filters.per_page}</span> results
            </div>
            <Pagination
              currentPage={filters.page}
              totalPages={totalPages}
              onPageChange={(page) => handleFilterChange('page', page)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketList;