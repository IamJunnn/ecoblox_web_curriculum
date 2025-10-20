// ===========================
// DATABASE MIGRATION: Role-Based System
// Add role and password_hash columns
// ===========================

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Starting role-based system migration...\n');

// Simple password hashing function (using SHA256)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

db.serialize(() => {

  // ===========================
  // 1. Add role column to students table
  // ===========================

  console.log('👤 Adding role column...');

  db.run(`
    ALTER TABLE students
    ADD COLUMN role TEXT DEFAULT 'student'
  `, (err) => {
    if (err) {
      if (err.message.includes('duplicate column')) {
        console.log('⚠️  Column role already exists, skipping...');
      } else {
        console.error('❌ Error adding role column:', err);
      }
    } else {
      console.log('✅ Added role column to students table');
    }
  });

  // ===========================
  // 2. Add password_hash column to students table
  // ===========================

  console.log('\n🔒 Adding password_hash column...');

  db.run(`
    ALTER TABLE students
    ADD COLUMN password_hash TEXT
  `, (err) => {
    if (err) {
      if (err.message.includes('duplicate column')) {
        console.log('⚠️  Column password_hash already exists, skipping...');
      } else {
        console.error('❌ Error adding password_hash column:', err);
      }
    } else {
      console.log('✅ Added password_hash column to students table');
    }
  });

  // ===========================
  // 3. Update existing students to have 'student' role
  // ===========================

  setTimeout(() => {
    console.log('\n📝 Updating existing students to student role...');

    db.run(`
      UPDATE students
      SET role = 'student'
      WHERE role IS NULL OR role = ''
    `, (err) => {
      if (err) {
        console.error('❌ Error updating existing students:', err);
      } else {
        console.log('✅ Updated existing students to student role');
      }
    });

    // ===========================
    // 4. Create default teacher account
    // ===========================

    console.log('\n👨‍🏫 Creating default teacher account...');

    const teacherPassword = hashPassword('teacher123');

    db.run(`
      INSERT OR IGNORE INTO students
      (name, email, class_code, role, password_hash, created_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [
      'Teacher Demo',
      'teacher@robloxacademy.com',
      'ALL',  // Teachers can access all classes
      'teacher',
      teacherPassword
    ], (err) => {
      if (err) {
        console.error('❌ Error creating teacher account:', err);
      } else {
        console.log('✅ Created teacher account: teacher@robloxacademy.com');
        console.log('   Password: teacher123');
      }
    });

    // ===========================
    // 5. Create default admin account
    // ===========================

    console.log('\n⚙️  Creating default admin account...');

    const adminPassword = hashPassword('admin123');

    db.run(`
      INSERT OR IGNORE INTO students
      (name, email, class_code, role, password_hash, created_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [
      'Admin User',
      'admin@robloxacademy.com',
      'SYSTEM',
      'admin',
      adminPassword
    ], (err) => {
      if (err) {
        console.error('❌ Error creating admin account:', err);
      } else {
        console.log('✅ Created admin account: admin@robloxacademy.com');
        console.log('   Password: admin123');
      }
    });

    // ===========================
    // 6. Verify migration
    // ===========================

    setTimeout(() => {
      console.log('\n🔍 Verifying migration...\n');

      // Check students by role
      db.all(`
        SELECT role, COUNT(*) as count
        FROM students
        GROUP BY role
      `, (err, rows) => {
        if (err) {
          console.error('❌ Error querying roles:', err);
        } else {
          console.log('📊 Users by role:');
          rows.forEach(row => {
            console.log(`   ${row.role}: ${row.count}`);
          });
        }
      });

      // Check teacher and admin accounts
      db.all(`
        SELECT id, name, email, role
        FROM students
        WHERE role IN ('teacher', 'admin')
      `, (err, rows) => {
        if (err) {
          console.error('❌ Error querying teacher/admin accounts:', err);
        } else {
          console.log('\n👥 Teacher/Admin accounts:');
          rows.forEach(row => {
            console.log(`   ${row.role}: ${row.name} (${row.email})`);
          });
        }

        console.log('\n✅ Migration completed successfully!\n');
        console.log('🔐 Default Credentials:');
        console.log('   Teacher: teacher@robloxacademy.com / teacher123');
        console.log('   Admin: admin@robloxacademy.com / admin123');
        console.log('\n⚠️  IMPORTANT: Change these passwords in production!\n');

        db.close();
      });
    }, 1000);

  }, 500);

});
