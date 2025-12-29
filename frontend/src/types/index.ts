// User Types
export interface User {
  id: number
  uuid: string
  group_id: number
  name: string
  email: string
  phone: string
  status: 'active' | 'locked' | 'inactive'
  avatar: string | null
  settings: Record<string, any>
  last_login_at: string | null
  last_login_ip: string | null
  created_at: string
  updated_at: string
  group: UserGroup
}

export interface UserGroup {
  id: number
  name: string
  slug: string
  permissions: string[]
  description: string
  is_active: boolean
}

// Customer Types
export interface Customer {
  id: number
  uuid: string
  code: string
  type: 'resident' | 'soho' | 'corporate'
  name: string
  email: string | null
  phone: string
  address: string
  id_card_number: string | null
  id_card_file: string | null
  document_file: string | null
  subscription_date: string
  birth_date: string | null
  status: 'active' | 'suspended' | 'terminated' | 'pending'
  notes: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  services?: Service[]
  invoices?: Invoice[]
}

// Service Types
export interface Service {
  id: number
  uuid: string
  customer_id: number
  plan_id: number
  router_id: number
  type: 'pppoe' | 'static' | 'hotspot'
  username: string | null
  password: string | null
  static_ip: string | null
  mac_address: string | null
  interface: string | null
  start_date: string
  due_day: number
  status: 'active' | 'suspended' | 'terminated' | 'pending'
  mikrotik_secret_id: string | null
  mikrotik_queue_id: string | null
  mikrotik_address_list_id: string | null
  provisioning_log: string | null
  last_provisioned_at: string | null
  suspended_at: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  customer?: Customer
  plan?: Plan
  router?: Router
}

// Plan Types
export interface Plan {
  id: number
  uuid: string
  name: string
  code: string
  price: number
  tax_rate: number
  rate_limit_up: string
  rate_limit_down: string
  burst_limit_up: string | null
  burst_limit_down: string | null
  burst_threshold: number
  burst_time: number
  suspension_grace_days: number
  validity_days: number
  type: 'pppoe' | 'static' | 'hotspot'
  is_active: boolean
  description: string | null
  mikrotik_profile: Record<string, any>
  created_at: string
  updated_at: string
}

// Router Types
export interface Router {
  id: number
  uuid: string
  name: string
  ip_address: string
  api_port: number
  username: string
  use_tls: boolean
  status: 'active' | 'inactive' | 'maintenance'
  location: string | null
  description: string | null
  capabilities: string[]
  max_connections: number
  current_connections: number
  last_sync: string | null
  created_at: string
  updated_at: string
}

// Invoice Types
export interface Invoice {
  id: number
  uuid: string
  invoice_number: string
  customer_id: number
  service_id: number
  period_start: string
  period_end: string
  amount: number
  tax: number
  discount: number
  total: number
  due_date: string
  status: 'unpaid' | 'paid' | 'overdue' | 'cancelled'
  payment_method: string | null
  notes: string | null
  items: InvoiceItem[]
  paid_at: string | null
  cancelled_at: string | null
  created_at: string
  updated_at: string
  customer?: Customer
  service?: Service
  payments?: Payment[]
}

export interface InvoiceItem {
  description: string
  quantity: number
  price: number
  total: number
}

// Payment Types
export interface Payment {
  id: number
  uuid: string
  invoice_id: number
  payment_number: string
  amount: number
  admin_fee: number
  method: 'cash' | 'transfer' | 'midtrans' | 'xendit' | 'manual'
  reference: string | null
  bank_name: string | null
  account_number: string | null
  account_holder: string | null
  payment_proof: string | null
  status: 'pending' | 'success' | 'failed' | 'cancelled'
  notes: string | null
  metadata: Record<string, any>
  paid_at: string | null
  verified_at: string | null
  verified_by: number | null
  created_at: string
  updated_at: string
  invoice?: Invoice
  verifier?: User
}

// Ticket Types
export interface Ticket {
  id: number
  uuid: string
  ticket_number: string
  customer_id: number
  subject: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'cancelled'
  assigned_to: number | null
  category: string
  tags: string[]
  sla_hours: number
  due_date: string | null
  resolved_at: string | null
  resolution: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  customer?: Customer
  assignee?: User
}

// Company Types
export interface Company {
  id: number
  name: string
  brand: string
  logo: string | null
  brand_logo: string | null
  address: string
  phone: string
  email: string
  npwp: string | null
  tax_rate: string
  bank_accounts: BankAccount[]
  settings: CompanySettings
  created_at: string
  updated_at: string
}

export interface BankAccount {
  bank_name: string
  account_number: string
  account_holder: string
  branch: string
  currency: string
  is_default: boolean
}

export interface CompanySettings {
  invoice_prefix: string
  payment_due_days: number
  grace_period_days: number
  auto_suspend: boolean
  auto_generate_invoice: boolean
  reminder_days: number[]
  whatsapp_enabled: boolean
  email_enabled: boolean
  timezone: string
  currency: string
  language: string
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T = any> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number
    to: number
  }
  links: {
    first: string
    last: string
    prev: string | null
    next: string | null
  }
}

// Form Types
export interface CustomerFormData {
  type: 'resident' | 'soho' | 'corporate'
  name: string
  email: string
  phone: string
  address: string
  id_card_number?: string
  subscription_date: string
  birth_date?: string
  notes?: string
}

export interface ServiceFormData {
  customer_id: number
  plan_id: number
  router_id: number
  type: 'pppoe' | 'static'
  username?: string
  password?: string
  static_ip?: string
  mac_address?: string
  interface?: string
  start_date: string
  due_day: number
}