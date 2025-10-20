// ===========================
// DATABASE MIGRATION SCRIPT
// Add courses table and update schema
// ===========================

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Starting database migration...\n');

db.serialize(() => {

  // ===========================
  // 1. Create courses table
  // ===========================

  console.log('📊 Creating courses table...');

  db.run(`
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      url TEXT NOT NULL,
      total_levels INTEGER DEFAULT 6,
      unlock_requirements TEXT,
      display_order INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating courses table:', err);
    } else {
      console.log('✅ Courses table created successfully');
    }
  });

  // ===========================
  // 2. Insert default courses
  // ===========================

  console.log('\n📚 Inserting default courses...');

  const courses = [
    {
      id: 1,
      title: 'Studio Basics',
      description: 'Game-Style Interactive Tutorial',
      url: 'versions/v9_game_style.html',
      total_levels: 6,
      unlock_requirements: null,
      display_order: 1
    },
    {
      id: 2,
      title: 'Advanced Scripting',
      description: 'Lua Programming Deep-Dive',
      url: 'versions/v10_advanced.html',
      total_levels: 8,
      unlock_requirements: JSON.stringify({
        course_id: 1,
        min_xp: 300,
        min_progress: 80
      }),
      display_order: 2
    },
    {
      id: 3,
      title: 'Multiplayer Games',
      description: 'Building Multi-Player Experiences',
      url: 'versions/v11_multiplayer.html',
      total_levels: 10,
      unlock_requirements: JSON.stringify({
        course_id: 2,
        min_xp: 600,
        min_progress: 80
      }),
      display_order: 3
    }
  ];

  const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO courses
    (id, title, description, url, total_levels, unlock_requirements, display_order)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  courses.forEach(course => {
    insertStmt.run(
      course.id,
      course.title,
      course.description,
      course.url,
      course.total_levels,
      course.unlock_requirements,
      course.display_order,
      (err) => {
        if (err) {
          console.error(`❌ Error inserting course "${course.title}":`, err);
        } else {
          console.log(`✅ Inserted: ${course.title}`);
        }
      }
    );
  });

  insertStmt.finalize();

  // ===========================
  // 3. Add course_id column to progress_events
  // ===========================

  console.log('\n🔧 Updating progress_events table...');

  db.run(`
    ALTER TABLE progress_events
    ADD COLUMN course_id INTEGER DEFAULT 1
  `, (err) => {
    if (err) {
      // Column might already exist
      if (err.message.includes('duplicate column')) {
        console.log('⚠️  Column course_id already exists, skipping...');
      } else {
        console.error('❌ Error adding course_id column:', err);
      }
    } else {
      console.log('✅ Added course_id column to progress_events');
    }
  });

  // ===========================
  // 4. Add email column to students table
  // ===========================

  console.log('\n🔧 Updating students table...');

  db.run(`
    ALTER TABLE students
    ADD COLUMN email TEXT
  `, (err) => {
    if (err) {
      // Column might already exist
      if (err.message.includes('duplicate column')) {
        console.log('⚠️  Column email already exists, skipping...');
      } else {
        console.error('❌ Error adding email column:', err);
      }
    } else {
      console.log('✅ Added email column to students');
    }
  });

  // ===========================
  // 5. Verify migration
  // ===========================

  setTimeout(() => {
    console.log('\n🔍 Verifying migration...\n');

    // Check courses table
    db.all('SELECT * FROM courses ORDER BY display_order', (err, rows) => {
      if (err) {
        console.error('❌ Error querying courses:', err);
      } else {
        console.log('📚 Courses in database:');
        rows.forEach(row => {
          console.log(`   ${row.id}. ${row.title} (${row.total_levels} levels)`);
        });
      }
    });

    // Check tables structure
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
      if (err) {
        console.error('❌ Error listing tables:', err);
      } else {
        console.log('\n📊 Database tables:');
        tables.forEach(table => {
          console.log(`   - ${table.name}`);
        });
      }

      console.log('\n✅ Migration completed successfully!\n');
      db.close();
    });
  }, 500);

});
