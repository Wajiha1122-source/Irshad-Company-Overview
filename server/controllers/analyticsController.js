const pool = require('../config/db');

// Get Dashboard Statistics
const getDashboardStats = async (req, res) => {
  try {
    const { office_id } = req.query;
    
    // Employee stats
    let employeeQuery = 'SELECT COUNT(*) as count FROM employees';
    const employeeParams = [];
    if (office_id) {
      employeeQuery += ' WHERE office_id = $1';
      employeeParams.push(office_id);
    }
    const employeeResult = await pool.query(employeeQuery, employeeParams);
    
    // Inventory stats by type
    let inventoryQuery = `
      SELECT c.type, COALESCE(SUM(i.quantity), 0) as total
      FROM inventory_categories c
      LEFT JOIN inventory_items i ON c.id = i.category_id
    `;
    const inventoryParams = [];
    if (office_id) {
      inventoryQuery += ' LEFT JOIN offices o ON i.office_id = o.id WHERE i.office_id = $1';
      inventoryParams.push(office_id);
    }
    inventoryQuery += ' GROUP BY c.type ORDER BY c.type';
    const inventoryResult = await pool.query(inventoryQuery, inventoryParams);
    
    // Asset assignment stats
    let assetQuery = 'SELECT status, COUNT(*) as count FROM asset_assignments';
    const assetParams = [];
    if (office_id) {
      assetQuery += ' WHERE office_id = $1';
      assetParams.push(office_id);
    }
    assetQuery += ' GROUP BY status';
    const assetResult = await pool.query(assetQuery, assetParams);
    
    // Office stats (if no specific office)
    let officeStats = [];
    if (!office_id) {
      const officeResult = await pool.query(`
        SELECT 
          o.id,
          o.name,
          (SELECT COUNT(*) FROM employees WHERE office_id = o.id) as employee_count,
          (SELECT COALESCE(SUM(i.quantity), 0) FROM inventory_items i WHERE i.office_id = o.id) as inventory_count,
          (SELECT COUNT(*) FROM asset_assignments WHERE office_id = o.id) as asset_count
        FROM offices o
      `);
      officeStats = officeResult.rows;
    }
    
    res.json({
      employees: parseInt(employeeResult.rows[0]?.count || 0),
      inventory: inventoryResult.rows,
      assets: assetResult.rows,
      offices: officeStats
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Employee Statistics
const getEmployeeStats = async (req, res) => {
  try {
    const { office_id } = req.query;
    
    // Total employees
    let totalQuery = 'SELECT COUNT(*) as count FROM employees';
    const totalParams = [];
    if (office_id) {
      totalQuery += ' WHERE office_id = $1';
      totalParams.push(office_id);
    }
    const totalResult = await pool.query(totalQuery, totalParams);
    
    // Employees by office
    const officeResult = await pool.query(`
      SELECT o.name as office_name, COUNT(e.id) as count
      FROM offices o
      LEFT JOIN employees e ON o.id = e.office_id
      GROUP BY o.id, o.name
      ORDER BY count DESC
    `);
    
    // Employees by status
    let statusQuery = 'SELECT status, COUNT(*) as count FROM employees';
    const statusParams = [];
    if (office_id) {
      statusQuery += ' WHERE office_id = $1';
      statusParams.push(office_id);
    }
    statusQuery += ' GROUP BY status';
    const statusResult = await pool.query(statusQuery, statusParams);
    
    // Employees by authority
    const authorityResult = await pool.query(`
      SELECT ea.authority_level, COUNT(DISTINCT ea.employee_id) as count
      FROM employee_authority ea
      GROUP BY ea.authority_level
      ORDER BY count DESC
    `);
    
    res.json({
      total: parseInt(totalResult.rows[0]?.count || 0),
      by_office: officeResult.rows,
      by_status: statusResult.rows,
      by_authority: authorityResult.rows
    });
  } catch (error) {
    console.error('Get employee stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Inventory Statistics
const getInventoryStats = async (req, res) => {
  try {
    const { office_id } = req.query;
    
    // Total by category type
    const typeResult = await pool.query(`
      SELECT c.type, COALESCE(SUM(i.quantity), 0) as total
      FROM inventory_categories c
      LEFT JOIN inventory_items i ON c.id = i.category_id
      GROUP BY c.type
      ORDER BY total DESC
    `);
    
    // Top items by quantity
    let topQuery = `
      SELECT i.name, c.type, i.quantity, o.name as office_name
      FROM inventory_items i
      LEFT JOIN inventory_categories c ON i.category_id = c.id
      LEFT JOIN offices o ON i.office_id = o.id
    `;
    const topParams = [];
    if (office_id) {
      topQuery += ' WHERE i.office_id = $1';
      topParams.push(office_id);
    }
    topQuery += ' ORDER BY i.quantity DESC LIMIT 10';
    const topResult = await pool.query(topQuery, topParams);
    
    // Low stock items (quantity < 10)
    let lowStockQuery = `
      SELECT i.name, c.type, i.quantity, o.name as office_name
      FROM inventory_items i
      LEFT JOIN inventory_categories c ON i.category_id = c.id
      LEFT JOIN offices o ON i.office_id = o.id
      WHERE i.quantity < 10
    `;
    const lowStockParams = [];
    if (office_id) {
      lowStockQuery += ' AND i.office_id = $1';
      lowStockParams.push(office_id);
    }
    lowStockQuery += ' ORDER BY i.quantity ASC';
    const lowStockResult = await pool.query(lowStockQuery, lowStockParams);
    
    res.json({
      by_type: typeResult.rows,
      top_items: topResult.rows,
      low_stock: lowStockResult.rows
    });
  } catch (error) {
    console.error('Get inventory stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Office Statistics
const getOfficeStats = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        o.id,
        o.name,
        o.location,
        (SELECT COUNT(*) FROM employees WHERE office_id = o.id) as employee_count,
        (SELECT COALESCE(SUM(i.quantity), 0) FROM inventory_items i WHERE i.office_id = o.id) as inventory_count,
        (SELECT COUNT(*) FROM asset_assignments WHERE office_id = o.id AND status = 'Assigned') as assigned_assets,
        (SELECT COUNT(*) FROM asset_assignments WHERE office_id = o.id AND status = 'Available') as available_assets
      FROM offices o
      ORDER BY o.id
    `);
    
    res.json({ offices: result.rows });
  } catch (error) {
    console.error('Get office stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getEmployeeStats,
  getInventoryStats,
  getOfficeStats
};
