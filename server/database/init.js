const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// Ensure database directory exists
const dbDir = path.join(__dirname);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'kleinpaket.db');
const db = new sqlite3.Database(dbPath);

const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          name TEXT,
          plan TEXT DEFAULT 'free' CHECK(plan IN ('free', 'premium', 'pro')),
          plan_start DATETIME,
          plan_expiry DATETIME,
          demo_mode_flag BOOLEAN DEFAULT 0,
          theme_pref TEXT DEFAULT 'light' CHECK(theme_pref IN ('light', 'dark')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Calculations table
      db.run(`
        CREATE TABLE IF NOT EXISTS calculations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          team_id INTEGER,
          input_json TEXT NOT NULL,
          output_json TEXT NOT NULL,
          eligibility_boolean BOOLEAN NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id),
          FOREIGN KEY (team_id) REFERENCES teams (id)
        )
      `);

      // Bulk sessions table
      db.run(`
        CREATE TABLE IF NOT EXISTS bulk_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          file_meta TEXT,
          total_rows INTEGER DEFAULT 0,
          processed_rows INTEGER DEFAULT 0,
          errors_summary TEXT,
          status TEXT DEFAULT 'processing' CHECK(status IN ('processing', 'completed', 'failed')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // API keys table
      db.run(`
        CREATE TABLE IF NOT EXISTS api_keys (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          key_hash TEXT NOT NULL,
          name TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          revoked_at DATETIME,
          usage_count INTEGER DEFAULT 0,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Teams table
      db.run(`
        CREATE TABLE IF NOT EXISTS teams (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          owner_user_id INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (owner_user_id) REFERENCES users (id)
        )
      `);

      // Team members table
      db.run(`
        CREATE TABLE IF NOT EXISTS team_members (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          team_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          role TEXT DEFAULT 'viewer' CHECK(role IN ('admin', 'editor', 'viewer')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (team_id) REFERENCES teams (id),
          FOREIGN KEY (user_id) REFERENCES users (id),
          UNIQUE(team_id, user_id)
        )
      `);

      // Invitations table
      db.run(`
        CREATE TABLE IF NOT EXISTS invitations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          team_id INTEGER NOT NULL,
          email TEXT NOT NULL,
          token TEXT UNIQUE NOT NULL,
          expires_at DATETIME NOT NULL,
          accepted_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (team_id) REFERENCES teams (id)
        )
      `);

      // Usage logs table
      db.run(`
        CREATE TABLE IF NOT EXISTS usage_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          api_key_id INTEGER,
          user_id INTEGER,
          endpoint TEXT NOT NULL,
          status_code INTEGER NOT NULL,
          response_time_ms INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (api_key_id) REFERENCES api_keys (id),
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Payments table (optional)
      db.run(`
        CREATE TABLE IF NOT EXISTS payments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          provider TEXT NOT NULL,
          provider_id TEXT,
          amount DECIMAL(10,2) NOT NULL,
          currency TEXT DEFAULT 'EUR',
          status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'failed', 'refunded')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Settings table
      db.run(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Password reset tokens table
      db.run(`
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          token TEXT UNIQUE NOT NULL,
          expires_at DATETIME NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Create indexes for better performance
      db.run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_calculations_user_id ON calculations(user_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_calculations_created_at ON calculations(created_at)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_usage_logs_api_key_id ON usage_logs(api_key_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs(created_at)`);

      // Insert default settings
      db.run(`
        INSERT OR IGNORE INTO settings (key, value) VALUES 
        ('demo_mode', '${process.env.DEMO_MODE === 'true' ? 'true' : 'false'}'),
        ('max_calculations_free', '3'),
        ('api_rate_limit', '100'),
        ('session_timeout', '86400')
      `);

      // Create demo admin user if in demo mode
      if (process.env.DEMO_MODE === 'true') {
        const adminPassword = 'admin123';
        const hashedPassword = bcrypt.hashSync(adminPassword, 10);
        
        db.run(`
          INSERT OR IGNORE INTO users (email, password_hash, name, plan, demo_mode_flag) 
          VALUES ('admin@kleinpaket.com', ?, 'Demo Admin', 'pro', 1)
        `, [hashedPassword], function(err) {
          if (err) {
            console.error('Error creating admin user:', err);
          } else {
            console.log('Demo admin user created: admin@kleinpaket.com / admin123');
          }
        });
      }

      // Create some demo calculations for testing
      if (process.env.DEMO_MODE === 'true') {
        const demoCalculations = [
          {
            user_id: 1,
            input_json: JSON.stringify({
              product_name: "Small Electronics Kit",
              category: "Electronics",
              buying_price: 8.50,
              selling_price: 25.00,
              destination_country: "Germany",
              length_cm: 30.0,
              width_cm: 20.0,
              height_cm: 6.0,
              weight_kg: 0.4
            }),
            output_json: JSON.stringify({
              eligibility: true,
              eligibility_message: "✅ Your product is Kleinpaket eligible! You will save 3.5 € on shipping.",
              shipping: {
                chosen: "Kleinpaket",
                cost: 4.50,
                alternatives: [
                  { type: "Standard", cost: 7.99, speed: "+2d", tag: "Reliable" },
                  { type: "Registered", cost: 9.99, speed: "+1d", tag: "Insured" }
                ]
              },
              totals: {
                shipping_cost: 4.5,
                total_cost: 18.25,
                net_profit: 6.75,
                roi_percent: 37.0
              }
            }),
            eligibility_boolean: true
          },
          {
            user_id: 1,
            input_json: JSON.stringify({
              product_name: "Large Book Set",
              category: "Books",
              buying_price: 15.00,
              selling_price: 35.00,
              destination_country: "France",
              length_cm: 40.0,
              width_cm: 30.0,
              height_cm: 10.0,
              weight_kg: 1.2
            }),
            output_json: JSON.stringify({
              eligibility: false,
              eligibility_message: "❌ Your product is NOT Kleinpaket eligible. One or more measurements exceed the allowed limits.",
              failed_conditions: [
                "Length is too long (40.0 cm > 35.3 cm)",
                "Height is too tall (10.0 cm > 8.0 cm)",
                "Weight exceeds limit (1.2 kg > 1.0 kg)"
              ],
              shipping: {
                chosen: "Standard",
                cost: 7.99,
                alternatives: [
                  { type: "Registered", cost: 9.99, speed: "+1d", tag: "Insured" },
                  { type: "Express", cost: 19.99, speed: "-2d", tag: "Fast" }
                ]
              },
              totals: {
                shipping_cost: 7.99,
                total_cost: 30.24,
                net_profit: 4.76,
                roi_percent: 15.7
              }
            }),
            eligibility_boolean: false
          }
        ];

        demoCalculations.forEach(calc => {
          db.run(`
            INSERT OR IGNORE INTO calculations (user_id, input_json, output_json, eligibility_boolean)
            VALUES (?, ?, ?, ?)
          `, [calc.user_id, calc.input_json, calc.output_json, calc.eligibility_boolean]);
        });
      }

      console.log('Database tables created successfully');
      resolve();
    });
  });
};

module.exports = { initializeDatabase, db };
