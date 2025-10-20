// ===========================
// DATABASE MIGRATION: PIN Code System
// Add pin_code column and generate PINs for existing students
// ===========================

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Starting PIN code system migration...\n');

// Generate random 4-digit PIN
function generatePIN() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Generate unique PIN (check if exists)
function generateUniquePIN(callback) {
  const pin = generatePIN();

  db.get('SELECT id FROM students WHERE pin_code = ?', [pin], (err, row) => {
    if (err) {
      callback(err, null);
    } else if (row) {
      // PIN already exists, generate another one
      generateUniquePIN(callback);
    } else {
      callback(null, pin);
    }
  });
}

db.serialize(() => {

  // ===========================
  // 1. Add pin_code column to students table
  // ===========================

  console.log('📌 Adding pin_code column...');

  db.run(`
    ALTER TABLE students
    ADD COLUMN pin_code TEXT
  `, (err) => {
    if (err) {
      if (err.message.includes('duplicate column')) {
        console.log('⚠️  Column pin_code already exists, skipping...');
      } else {
        console.error('❌ Error adding pin_code column:', err);
      }
    } else {
      console.log('✅ Added pin_code column to students table');
    }
  });

  // ===========================
  // 2. Create unique index on email and pin_code
  // ===========================

  setTimeout(() => {
    console.log('\n🔒 Creating unique index on email...');

    db.run(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_student_email
      ON students(email)
      WHERE email IS NOT NULL AND role = 'student'
    `, (err) => {
      if (err) {
        console.error('❌ Error creating index:', err);
      } else {
        console.log('✅ Created unique index on student email');
      }
    });

    // ===========================
    // 3. Generate PINs for existing students without one
    // ===========================

    setTimeout(() => {
      console.log('\n🎲 Generating PINs for existing students...\n');

      db.all(`
        SELECT id, name, email, role
        FROM students
        WHERE role = 'student' AND (pin_code IS NULL OR pin_code = '')
      `, (err, students) => {
        if (err) {
          console.error('❌ Error fetching students:', err);
          return;
        }

        if (students.length === 0) {
          console.log('✅ All students already have PINs');
          showFinalResults();
          return;
        }

        console.log(`Found ${students.length} students without PINs\n`);

        let processed = 0;

        students.forEach(student => {
          generateUniquePIN((err, pin) => {
            if (err) {
              console.error(`❌ Error generating PIN for ${student.name}:`, err);
              processed++;
              return;
            }

            db.run(
              'UPDATE students SET pin_code = ? WHERE id = ?',
              [pin, student.id],
              (err) => {
                if (err) {
                  console.error(`❌ Error updating PIN for ${student.name}:`, err);
                } else {
                  console.log(`✅ ${student.name} (${student.email || 'No email'}) → PIN: ${pin}`);
                }

                processed++;

                if (processed === students.length) {
                  setTimeout(showFinalResults, 1000);
                }
              }
            );
          });
        });
      });
    }, 500);
  }, 500);

});

// ===========================
// 4. Show final results
// ===========================

function showFinalResults() {
  console.log('\n🔍 Verifying migration...\n');

  db.all(`
    SELECT id, name, email, role, pin_code
    FROM students
    WHERE role = 'student'
    ORDER BY id
  `, (err, students) => {
    if (err) {
      console.error('❌ Error querying students:', err);
      db.close();
      return;
    }

    console.log('📋 Students with PINs:');
    console.log('─'.repeat(70));
    students.forEach(s => {
      const email = s.email || 'No email';
      const pin = s.pin_code || 'NO PIN';
      console.log(`ID: ${s.id.toString().padEnd(3)} | ${s.name.padEnd(20)} | ${email.padEnd(25)} | PIN: ${pin}`);
    });
    console.log('─'.repeat(70));

    const studentsWithPIN = students.filter(s => s.pin_code).length;
    const studentsWithoutPIN = students.filter(s => !s.pin_code).length;

    console.log(`\n✅ Migration completed successfully!`);
    console.log(`   Students with PIN: ${studentsWithPIN}`);
    console.log(`   Students without PIN: ${studentsWithoutPIN}`);

    console.log('\n📝 Next Steps:');
    console.log('   1. Restart the backend server');
    console.log('   2. Test student login with email + PIN');
    console.log('   3. Teachers can view/reset PINs in admin panel\n');

    db.close();
  });
}
