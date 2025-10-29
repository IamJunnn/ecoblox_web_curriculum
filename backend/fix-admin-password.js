const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

async function fixAdminPassword() {
  const db = new sqlite3.Database('./database.db');

  // Generate new hash
  const password = 'password123';
  const hash = await bcrypt.hash(password, 10);

  console.log('Generated hash:', hash);
  console.log('Hash length:', hash.length);

  // Update admin password
  db.run(
    'UPDATE students SET password_hash = ?, is_verified = 1 WHERE email = ?',
    [hash, 'admin@robloxacademy.com'],
    function(err) {
      if (err) {
        console.error('Error updating password:', err);
      } else {
        console.log('✓ Admin password updated successfully');

        // Verify the update
        db.get(
          'SELECT email, role, is_verified, password_hash FROM students WHERE email = ?',
          ['admin@robloxacademy.com'],
          (err, row) => {
            if (row) {
              console.log('\nAdmin account:');
              console.log('Email:', row.email);
              console.log('Role:', row.role);
              console.log('Verified:', row.is_verified);
              console.log('Hash length:', row.password_hash?.length);

              // Test the password
              bcrypt.compare(password, row.password_hash).then(match => {
                console.log('Password verification:', match ? '✓ PASS' : '✗ FAIL');
                db.close();
              });
            }
          }
        );
      }
    }
  );
}

fixAdminPassword();
