-- Irshad & Company Internswal Overview Management System
-- Database Schema for PostgreSQL

-- Drop existing tables (for development)
DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS asset_assignments;
DROP TABLE IF EXISTS inventory_items;
DROP TABLE IF EXISTS inventory_categories;
DROP TABLE IF EXISTS employee_stationary;
DROP TABLE IF EXISTS employee_account_access;
DROP TABLE IF EXISTS employee_assets;
DROP TABLE IF EXISTS employee_authority;
DROP TABLE IF EXISTS employee_work;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS offices;

-- Drop function if exists
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop triggers if they exist
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_offices_updated_at ON offices;
DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
DROP TRIGGER IF EXISTS update_employee_work_updated_at ON employee_work;
DROP TRIGGER IF EXISTS update_employee_assets_updated_at ON employee_assets;
DROP TRIGGER IF EXISTS update_employee_account_access_updated_at ON employee_account_access;
DROP TRIGGER IF EXISTS update_employee_stationary_updated_at ON employee_stationary;
DROP TRIGGER IF EXISTS update_inventory_items_updated_at ON inventory_items;
DROP TRIGGER IF EXISTS update_asset_assignments_updated_at ON asset_assignments;

-- Offices Table (must be created first as it's referenced by other tables)
CREATE TABLE offices (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users Table (Authentication)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Owner', 'Manager', 'Employee')),
    office_id INTEGER REFERENCES offices(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employees Table
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    picture TEXT,
    designation VARCHAR(255),
    phone_number VARCHAR(20),
    email VARCHAR(255),
    joining_date DATE,
    office_id INTEGER REFERENCES offices(id) NOT NULL,
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employee Work Information
CREATE TABLE employee_work (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
    work_type VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employee Authority
CREATE TABLE employee_authority (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
    authority_level VARCHAR(50) NOT NULL CHECK (authority_level IN ('Owner', 'Manager', 'Supervisor', 'Employee', 'Intern')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employee Device Access
CREATE TABLE employee_assets (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
    device_type VARCHAR(255) NOT NULL,
    device_name VARCHAR(255),
    assigned_date DATE,
    return_date DATE,
    status VARCHAR(50) DEFAULT 'Assigned' CHECK (status IN ('Assigned', 'Returned', 'Lost')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employee Company Account Access
CREATE TABLE employee_account_access (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
    account_type VARCHAR(255) NOT NULL,
    access_level VARCHAR(50) NOT NULL CHECK (access_level IN ('View', 'Edit', 'Admin')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employee Stationary Allocation
CREATE TABLE employee_stationary (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
    stationary_item VARCHAR(255) NOT NULL,
    quantity INTEGER DEFAULT 1,
    assigned_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Categories
CREATE TABLE inventory_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    type VARCHAR(100) NOT NULL CHECK (type IN ('Stationary', 'Devices', 'Appliances', 'Furniture', 'Cleaning')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Items
CREATE TABLE inventory_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id INTEGER REFERENCES inventory_categories(id),
    office_id INTEGER REFERENCES offices(id) NOT NULL,
    quantity INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Asset Assignments
CREATE TABLE asset_assignments (
    id SERIAL PRIMARY KEY,
    asset_code VARCHAR(100) UNIQUE NOT NULL,
    asset_name VARCHAR(255) NOT NULL,
    office_id INTEGER REFERENCES offices(id) NOT NULL,
    assigned_employee_id INTEGER REFERENCES employees(id),
    assignment_date DATE,
    return_date DATE,
    status VARCHAR(50) DEFAULT 'Available' CHECK (status IN ('Available', 'Assigned', 'Under Repair', 'Lost')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reports
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    report_type VARCHAR(100) NOT NULL,
    report_name VARCHAR(255) NOT NULL,
    generated_by INTEGER REFERENCES users(id),
    office_id INTEGER REFERENCES offices(id),
    data JSONB,
    file_path TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity Logs
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    module VARCHAR(100) NOT NULL,
    previous_value TEXT,
    new_value TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_employees_office_id ON employees(office_id);
CREATE INDEX idx_inventory_items_office_id ON inventory_items(office_id);
CREATE INDEX idx_inventory_items_category_id ON inventory_items(category_id);
CREATE INDEX idx_asset_assignments_office_id ON asset_assignments(office_id);
CREATE INDEX idx_asset_assignments_employee_id ON asset_assignments(assigned_employee_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_timestamp ON activity_logs(timestamp);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Insert default offices
INSERT INTO offices (name, location) VALUES 
('Irshad & Company Office', 'Main Office'),
('IT Office', 'IT Department'),
('FJ Office', 'FJ Department');

-- Insert default inventory categories for Stationary
INSERT INTO inventory_categories (name, type) VALUES 
('Staplers', 'Stationary'),
('Chitpads', 'Stationary'),
('Diaries', 'Stationary'),
('Punching Machines', 'Stationary'),
('Ball Points', 'Stationary'),
('Pencils', 'Stationary'),
('Envelopes A4', 'Stationary'),
('Envelopes Khaaki', 'Stationary'),
('Scissors', 'Stationary'),
('Markers', 'Stationary'),
('Rubber Bands', 'Stationary'),
('Stamps', 'Stationary'),
('Highlighters', 'Stationary'),
('Card Files', 'Stationary'),
('A4 Pages', 'Stationary'),
('White Files', 'Stationary'),
('Calculators', 'Stationary'),
('Tissue Boxes', 'Stationary');

-- Insert default inventory categories for Devices
INSERT INTO inventory_categories (name, type) VALUES 
('Laptops', 'Devices'),
('Mobile Phones', 'Devices'),
('Cameras', 'Devices'),
('Printers', 'Devices'),
('Wifi Routers', 'Devices'),
('Biometric Machines', 'Devices'),
('PTCL Phones', 'Devices'),
('Barcode Scanners', 'Devices'),
('Bill Printers', 'Devices'),
('Illustrator Tablets', 'Devices'),
('Tripods', 'Devices'),
('Mouse', 'Devices'),
('Projectors', 'Devices'),
('Keyboards', 'Devices'),
('LED Screens', 'Devices');

-- Insert default inventory categories for Appliances
INSERT INTO inventory_categories (name, type) VALUES 
('Fans', 'Appliances'),
('AC', 'Appliances'),
('LED Bulbs', 'Appliances'),
('Bulbs', 'Appliances'),
('High Volt Lights', 'Appliances'),
('Dispensers', 'Appliances');

-- Insert default inventory categories for Furniture
INSERT INTO inventory_categories (name, type) VALUES 
('Chairs', 'Furniture'),
('Tables', 'Furniture'),
('Sofas', 'Furniture'),
('Dustbins', 'Furniture'),
('Revolving Chairs', 'Furniture'),
('White Boards', 'Furniture');

-- Insert default inventory categories for Cleaning
INSERT INTO inventory_categories (name, type) VALUES 
('Mops', 'Cleaning'),
('Brooms', 'Cleaning'),
('Detergents', 'Cleaning'),
('Phenyl', 'Cleaning'),
('Trash Bags', 'Cleaning'),
('Cleaning Cloths', 'Cleaning'),
('Glass Cleaner', 'Cleaning');

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offices_updated_at BEFORE UPDATE ON offices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employee_work_updated_at BEFORE UPDATE ON employee_work
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employee_assets_updated_at BEFORE UPDATE ON employee_assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employee_account_access_updated_at BEFORE UPDATE ON employee_account_access
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employee_stationary_updated_at BEFORE UPDATE ON employee_stationary
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asset_assignments_updated_at BEFORE UPDATE ON asset_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
