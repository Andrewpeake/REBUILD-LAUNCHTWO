const Database = require('../database/database');

async function initDatabase() {
  console.log('Initializing analytics database...');
  
  try {
    const db = new Database();
    await db.init();
    console.log('✅ Database initialized successfully!');
    console.log('📊 Database location: analytics/database/analytics.db');
    console.log('🚀 You can now start the analytics server with: npm start');
    
    // Test database connection
    const testQuery = await db.get('SELECT COUNT(*) as count FROM sqlite_master WHERE type="table"');
    console.log(`📋 Created ${testQuery.count} tables`);
    
    db.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initDatabase();

