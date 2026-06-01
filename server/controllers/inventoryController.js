const pool = require('../config/db');

// Get All Inventory Categories
const getAllCategories = async (req, res) => {
  try {
    const { type } = req.query;
    let query = 'SELECT * FROM inventory_categories';
    const params = [];
    
    if (type) {
      query += ' WHERE type = $1';
      params.push(type);
    }
    
    query += ' ORDER BY type, name';
    
    const result = await pool.query(query, params);
    res.json({ categories: result.rows });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get All Inventory Items
const getAllInventoryItems = async (req, res) => {
  try {
    const { office_id, category_id, type } = req.query;
    let query = `
      SELECT i.*, c.name as category_name, c.type as category_type, o.name as office_name 
      FROM inventory_items i 
      LEFT JOIN inventory_categories c ON i.category_id = c.id 
      LEFT JOIN offices o ON i.office_id = o.id
    `;
    const params = [];
    const conditions = [];
    
    if (office_id) {
      conditions.push(`i.office_id = $${params.length + 1}`);
      params.push(office_id);
    }
    
    if (category_id) {
      conditions.push(`i.category_id = $${params.length + 1}`);
      params.push(category_id);
    }
    
    if (type) {
      conditions.push(`c.type = $${params.length + 1}`);
      params.push(type);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY i.created_at DESC';
    
    const result = await pool.query(query, params);
    res.json({ items: result.rows });
  } catch (error) {
    console.error('Get inventory items error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Inventory Totals
const getInventoryTotals = async (req, res) => {
  try {
    const { office_id, category_id } = req.query;
    
    let query = `
      SELECT 
        c.type,
        c.name as category_name,
        COALESCE(SUM(i.quantity), 0) as total_quantity,
        o.name as office_name,
        o.id as office_id
      FROM inventory_categories c
      CROSS JOIN offices o
      LEFT JOIN inventory_items i ON c.id = i.category_id AND o.id = i.office_id
    `;
    const params = [];
    const conditions = [];
    
    if (office_id) {
      conditions.push(`o.id = $${params.length + 1}`);
      params.push(office_id);
    }
    
    if (category_id) {
      conditions.push(`c.id = $${params.length + 1}`);
      params.push(category_id);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' GROUP BY c.type, c.name, o.name, o.id ORDER BY c.type, c.name, o.name';
    
    const result = await pool.query(query, params);
    
    // Calculate grand totals
    let grandTotalQuery = `
      SELECT 
        c.type,
        COALESCE(SUM(i.quantity), 0) as total
      FROM inventory_categories c
      LEFT JOIN inventory_items i ON c.id = i.category_id
    `;
    const grandParams = [];
    const grandConditions = [];
    
    if (office_id) {
      grandConditions.push(`i.office_id = $${grandParams.length + 1}`);
      grandParams.push(office_id);
    }
    
    if (grandConditions.length > 0) {
      grandTotalQuery += ' WHERE ' + grandConditions.join(' AND ');
    } else {
      grandTotalQuery += ' WHERE 1=1';
    }
    
    grandTotalQuery += ' GROUP BY c.type ORDER BY c.type';
    
    const grandResult = await pool.query(grandTotalQuery, grandParams);
    
    res.json({ 
      totals: result.rows,
      grand_totals: grandResult.rows
    });
  } catch (error) {
    console.error('Get inventory totals error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create Inventory Item
const createInventoryItem = async (req, res) => {
  try {
    const { name, category_id, office_id, quantity, notes } = req.body;
    
    const result = await pool.query(
      'INSERT INTO inventory_items (name, category_id, office_id, quantity, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, category_id, office_id, quantity || 0, notes]
    );
    
    res.status(201).json({ message: 'Inventory item created successfully', item: result.rows[0] });
  } catch (error) {
    console.error('Create inventory item error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update Inventory Item
const updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category_id, office_id, quantity, notes } = req.body;
    
    const result = await pool.query(
      'UPDATE inventory_items SET name = $1, category_id = $2, office_id = $3, quantity = $4, notes = $5 WHERE id = $6 RETURNING *',
      [name, category_id, office_id, quantity, notes, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    res.json({ message: 'Inventory item updated successfully', item: result.rows[0] });
  } catch (error) {
    console.error('Update inventory item error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete Inventory Item
const deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM inventory_items WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    console.error('Delete inventory item error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update Quantity
const updateQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    
    const result = await pool.query(
      'UPDATE inventory_items SET quantity = $1 WHERE id = $2 RETURNING *',
      [quantity, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    res.json({ message: 'Quantity updated successfully', item: result.rows[0] });
  } catch (error) {
    console.error('Update quantity error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllCategories,
  getAllInventoryItems,
  getInventoryTotals,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  updateQuantity
};
