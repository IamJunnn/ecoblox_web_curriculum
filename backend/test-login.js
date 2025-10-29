const bcrypt = require('bcrypt');

async function test() {
  const password = 'password123';
  const hash = '$2b$10$YHXHfqKjFJPGKlZP8y8Mxu3Qq8jVHVHqJ3wY7cMz4sOpKXM4nXKhC';

  const match = await bcrypt.compare(password, hash);
  console.log('Password matches hash:', match);

  // Create new hash
  const newHash = await bcrypt.hash(password, 10);
  console.log('New hash:', newHash);
}

test();
