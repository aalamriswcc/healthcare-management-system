BEGIN;

--
-- PostgreSQL database schema for the Healthcare Management System
--

--
-- Extensions
--
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--
-- Schemas
--
CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS users;
CREATE SCHEMA IF NOT EXISTS assets;
CREATE SCHEMA IF NOT EXISTS hr;
CREATE SCHEMA IF NOT EXISTS inventory;

--
-- Core Schema: Hospitals, Departments, etc.
--

CREATE TABLE core.hospitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    location TEXT,
    is_headquarters BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE core.departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID REFERENCES core.hospitals(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

--
-- Users Schema: Users, Roles, Permissions
--

CREATE TABLE users.roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL -- e.g., admin, doctor, nurse, technician, manager
);

CREATE TABLE users.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone_number VARCHAR(50),
    hospital_id UUID REFERENCES core.hospitals(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users.user_roles (
    user_id UUID REFERENCES users.users(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES users.roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

--
-- HR Schema: Employees and Licenses
--

CREATE TABLE hr.employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users.users(id) ON DELETE CASCADE,
    employee_id VARCHAR(100) UNIQUE NOT NULL,
    job_title VARCHAR(255),
    department_id UUID REFERENCES core.departments(id) ON DELETE SET NULL,
    hire_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE hr.employee_licenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES hr.employees(id) ON DELETE CASCADE,
    license_name VARCHAR(255) NOT NULL,
    license_number VARCHAR(255) NOT NULL,
    issuing_authority VARCHAR(255),
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

--
-- Assets Schema: Medical Devices and Maintenance
--

CREATE TABLE assets.medical_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    manufacturer VARCHAR(255),
    model VARCHAR(255),
    serial_number VARCHAR(255) UNIQUE NOT NULL,
    hospital_id UUID REFERENCES core.hospitals(id) ON DELETE CASCADE,
    department_id UUID REFERENCES core.departments(id) ON DELETE SET NULL,
    purchase_date DATE,
    warranty_expiry_date DATE,
    status VARCHAR(50) DEFAULT 'operational', -- operational, under_maintenance, retired
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE assets.device_maintenance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES assets.medical_devices(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(100) NOT NULL, -- preventive, corrective
    scheduled_date DATE,
    completion_date DATE,
    description TEXT,
    technician_id UUID REFERENCES hr.employees(id) ON DELETE SET NULL,
    cost NUMERIC(10, 2),
    status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

--
-- Inventory Schema: Orders and Stock
--

CREATE TABLE inventory.suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone_number VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE inventory.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    supplier_id UUID REFERENCES inventory.suppliers(id) ON DELETE SET NULL,
    unit_price NUMERIC(10, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE inventory.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID REFERENCES core.hospitals(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES inventory.suppliers(id) ON DELETE SET NULL,
    order_date DATE NOT NULL,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, shipped, delivered, cancelled
    total_amount NUMERIC(12, 2),
    created_by UUID REFERENCES users.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE inventory.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES inventory.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES inventory.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(12, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE inventory.stock (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES inventory.products(id) ON DELETE CASCADE,
    hospital_id UUID REFERENCES core.hospitals(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    last_updated_at TIMESTAMPTZ DEFAULT NOW()
);

--
-- Indexes for performance
--
CREATE INDEX ON core.departments (hospital_id);
CREATE INDEX ON users.users (hospital_id);
CREATE INDEX ON hr.employees (user_id);
CREATE INDEX ON hr.employee_licenses (employee_id);
CREATE INDEX ON assets.medical_devices (hospital_id);
CREATE INDEX ON assets.device_maintenance (device_id);
CREATE INDEX ON inventory.orders (hospital_id);
CREATE INDEX ON inventory.order_items (order_id);
CREATE INDEX ON inventory.stock (product_id, hospital_id);

COMMIT;
