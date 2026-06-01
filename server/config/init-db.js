const fs = require('fs');
const path = require('path');
require('dotenv').config();
const pool = require('./db');

async function initializeDatabase() {
  let client;
  try {
    console.log('Connecting to database...');
    client = await pool.connect();
    
    console.log('Dropping all existing tables...');
    const tables = ['activity_logs', 'notifications', 'reports', 'asset_assignments', 'inventory_items', 'inventory_categories', 'employee_stationary', 'employee_account_access', 'employee_assets', 'employee_authority', 'employee_work', 'employees', 'users', 'offices'];
    
    for (const table of tables) {
      try {
        await client.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
      } catch (err) {
        // Ignore errors
      }
    }
    
    console.log('Dropping function...');
    try {
      await client.query('DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE');
    } catch (err) {
      // Ignore errors
    }
    
    console.log('Reading schema file...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Remove DROP statements from schema since we already dropped everything
    const cleanedSchema = schema
      .split('\n')
      .filter(line => !line.trim().toUpperCase().startsWith('DROP'))
      .join('\n');
    
    console.log('Executing schema...');
    await client.query(cleanedSchema);
    
    console.log('✅ Database initialized successfully!');
    console.log('✅ All tables created!');
    console.log('✅ Default data inserted!');
    
    // Verify tables were created
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\n📋 Created tables:');
    tablesResult.rows.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    console.error('Full error:', error);
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
  initializeDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = initializeDatabase;
