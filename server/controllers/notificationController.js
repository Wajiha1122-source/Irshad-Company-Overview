const pool = require('../config/db');

// Get All Notifications
const getAllNotifications = async (req, res) => {
  try {
    const { user_id, is_read } = req.query;
    let query = 'SELECT * FROM notifications';
    const params = [];
    const conditions = [];
    
    if (user_id) {
      conditions.push(`user_id = $${params.length + 1}`);
      params.push(user_id);
    }
    
    if (is_read !== undefined) {
      conditions.push(`is_read = $${params.length + 1}`);
      params.push(is_read === 'true');
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    res.json({ notifications: result.rows });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Unread Notifications Count
const getUnreadCount = async (req, res) => {
  try {
    const { user_id } = req.query;
    
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = FALSE',
      [user_id]
    );
    
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark Notification as Read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json({ message: 'Notification marked as read', notification: result.rows[0] });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark All as Read
const markAllAsRead = async (req, res) => {
  try {
    const { user_id } = req.body;
    
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = $1',
      [user_id]
    );
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create Notification
const createNotification = async (req, res) => {
  try {
    const { user_id, title, message, type } = req.body;
    
    const result = await pool.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4) RETURNING *',
      [user_id, title, message, type || 'info']
    );
    
    res.status(201).json({ message: 'Notification created successfully', notification: result.rows[0] });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete Notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM notifications WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  createNotification,
  deleteNotification
};
