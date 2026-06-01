const bcrypt = require('bcryptjs');
require('dotenv').config();
const pool = require('./db');

async function seedAdminUser() {
  let client;
  try {
    console.log('Connecting to database...');
    client = await pool.connect();

    // Check if admin user already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE username = $1',
      ['admin']
    );

    if (existingUser.rows.length > 0) {
      console.log('Admin user already exists');
      return;
    }

    // Get the first office ID
    const officeResult = await client.query('SELECT id FROM offices LIMIT 1');
    const officeId = officeResult.rows[0]?.id;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Insert admin user
    await client.query(
      'INSERT INTO users (username, email, password, full_name, role, office_id) VALUES ($1, $2, $3, $4, $5, $6)',
      ['admin', 'admin@irshad.com', hashedPassword, 'System Administrator', 'Owner', officeId]
    );

    console.log('✅ Admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Role: Owner');

  } catch (error) {
    console.error('❌ Error seeding admin user:', error.message);
    throw error;
  } finally {
    if (client) {
      await client.release();
    }
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  seedAdminUser()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seedAdminUser;
