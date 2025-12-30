-- Initialization Script for Maroon-NET BCMS Database
-- Run on first database creation

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create additional schemas if needed
CREATE SCHEMA IF NOT EXISTS audit;
CREATE SCHEMA IF NOT EXISTS reporting;

-- Set search path
ALTER DATABASE maroon_net_bcms SET search_path TO public, audit, reporting;

-- Create custom types
CREATE TYPE customer_type AS ENUM ('residential', 'soho', 'corporate');
CREATE TYPE service_type AS ENUM ('pppoe', 'static');
CREATE TYPE invoice_status AS ENUM ('unpaid', 'paid', 'overdue', 'partial', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed', 'cancelled');
CREATE TYPE reminder_channel AS ENUM ('email', 'whatsapp', 'sms');
CREATE TYPE user_status AS ENUM ('active', 'locked', 'suspended');

-- Create functions for audit logging
CREATE OR REPLACE FUNCTION audit.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate customer code
CREATE OR REPLACE FUNCTION generate_customer_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.customer_code := 'CUST' || to_char(NEW.created_at, 'YYMMDD') || 
                      lpad((nextval('customer_code_seq') % 10000)::text, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
  company_prefix TEXT;
  year_month TEXT;
  next_number INT;
BEGIN
  -- Get company settings
  SELECT invoice_prefix, invoice_start_number INTO company_prefix, next_number 
  FROM company LIMIT 1;
  
  IF company_prefix IS NULL THEN
    company_prefix := 'INV';
  END IF;
  
  IF next_number IS NULL THEN
    next_number := 1000;
  END IF;
  
  year_month := to_char(NEW.created_at, 'YYMM');
  
  -- Find next available number
  SELECT COALESCE(MAX(SUBSTRING(invoice_number FROM '[0-9]+$')::INT), next_number - 1) + 1
  INTO next_number
  FROM invoices
  WHERE invoice_number LIKE company_prefix || year_month || '%';
  
  NEW.invoice_number := company_prefix || year_month || lpad(next_number::text, 4, '0');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update service next billing date
CREATE OR REPLACE FUNCTION update_next_billing_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' AND OLD.status != 'active' THEN
    -- Service just activated or reactivated
    NEW.next_billing_date := date_trunc('month', NEW.start_date) + 
                            (NEW.due_day - 1) * interval '1 day';
    
    -- Adjust if due day is greater than days in month
    IF extract(day from NEW.next_billing_date) != NEW.due_day THEN
      NEW.next_billing_date := (date_trunc('month', NEW.start_date) + 
                               interval '1 month' - interval '1 day')::date;
    END IF;
    
    -- Ensure next billing date is in future
    IF NEW.next_billing_date < CURRENT_DATE THEN
      NEW.next_billing_date := date_trunc('month', CURRENT_DATE) + 
                              (NEW.due_day - 1) * interval '1 day';
      
      IF extract(day from NEW.next_billing_date) != NEW.due_day THEN
        NEW.next_billing_date := (date_trunc('month', CURRENT_DATE) + 
                                 interval '1 month' - interval '1 day')::date;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate invoice total
CREATE OR REPLACE FUNCTION calculate_invoice_total()
RETURNS TRIGGER AS $$
DECLARE
  tax_rate DECIMAL(5,2);
BEGIN
  -- Get tax rate from plan or company
  SELECT COALESCE(p.tax_rate, c.tax_rate) INTO tax_rate
  FROM plans p
  JOIN services s ON s.plan_id = p.id
  LEFT JOIN company c ON true
  WHERE s.id = NEW.service_id;
  
  IF tax_rate IS NULL THEN
    tax_rate := 0;
  END IF;
  
  -- Calculate tax
  NEW.tax := (NEW.amount * tax_rate / 100);
  
  -- Calculate total
  NEW.total := NEW.amount + NEW.tax + COALESCE(NEW.late_fee, 0) - COALESCE(NEW.discount, 0);
  
  -- Set due date if not provided
  IF NEW.due_date IS NULL THEN
    NEW.due_date := NEW.created_at + interval '7 days';
  END IF;
  
  -- Set status based on due date
  IF NEW.due_date < CURRENT_DATE AND NEW.status = 'unpaid' THEN
    NEW.status := 'overdue';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;