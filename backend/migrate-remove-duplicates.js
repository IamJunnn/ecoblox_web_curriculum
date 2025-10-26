const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Migration: Removing duplicate events from database...\n');

db.serialize(() => {
  // Step 1: Remove duplicate step_checked events (keep oldest)
  console.log('Step 1: Removing duplicate step_checked events...');
  db.run(`
    DELETE FROM progress_events
    WHERE id NOT IN (
      SELECT MIN(id)
      FROM progress_events
      WHERE event_type = 'step_checked'
      GROUP BY student_id, level, course_id, json_extract(data, '$.step')
    )
    AND event_type = 'step_checked'
  `, function(err) {
    if (err) {
      console.error('❌ Error removing step duplicates:', err);
    } else {
      console.log(`✅ Removed ${this.changes} duplicate step_checked events\n`);
    }
  });

  // Step 2: Remove duplicate quiz_answered events where correct=true (keep oldest)
  console.log('Step 2: Removing duplicate correct quiz_answered events...');
  db.run(`
    DELETE FROM progress_events
    WHERE id NOT IN (
      SELECT MIN(id)
      FROM progress_events
      WHERE event_type = 'quiz_answered'
        AND json_extract(data, '$.correct') = 1
      GROUP BY student_id, level, course_id
    )
    AND event_type = 'quiz_answered'
    AND json_extract(data, '$.correct') = 1
  `, function(err) {
    if (err) {
      console.error('❌ Error removing quiz duplicates:', err);
    } else {
      console.log(`✅ Removed ${this.changes} duplicate correct quiz_answered events\n`);
    }
  });

  // Step 3: Remove duplicate level_unlocked events (keep oldest)
  console.log('Step 3: Removing duplicate level_unlocked events...');
  db.run(`
    DELETE FROM progress_events
    WHERE id NOT IN (
      SELECT MIN(id)
      FROM progress_events
      WHERE event_type = 'level_unlocked'
      GROUP BY student_id, level, course_id
    )
    AND event_type = 'level_unlocked'
  `, function(err) {
    if (err) {
      console.error('❌ Error removing level_unlocked duplicates:', err);
    } else {
      console.log(`✅ Removed ${this.changes} duplicate level_unlocked events\n`);
    }
  });

  // Step 4: Remove duplicate quest_completed events (keep oldest)
  console.log('Step 4: Removing duplicate quest_completed events...');
  db.run(`
    DELETE FROM progress_events
    WHERE id NOT IN (
      SELECT MIN(id)
      FROM progress_events
      WHERE event_type = 'quest_completed'
      GROUP BY student_id, level, course_id
    )
    AND event_type = 'quest_completed'
  `, function(err) {
    if (err) {
      console.error('❌ Error removing quest_completed duplicates:', err);
    } else {
      console.log(`✅ Removed ${this.changes} duplicate quest_completed events\n`);
    }
  });

  // Step 5: Show statistics
  console.log('Step 5: Showing final statistics...');
  db.get(`
    SELECT
      COUNT(*) as total_events,
      COUNT(DISTINCT student_id) as total_students
    FROM progress_events
  `, (err, row) => {
    if (err) {
      console.error('❌ Error getting statistics:', err);
    } else {
      console.log(`\n📊 Final Statistics:`);
      console.log(`   Total events: ${row.total_events}`);
      console.log(`   Total students: ${row.total_students}`);
    }
  });

  // Step 6: Show event counts by type
  db.all(`
    SELECT
      event_type,
      COUNT(*) as count
    FROM progress_events
    GROUP BY event_type
    ORDER BY count DESC
  `, (err, rows) => {
    if (err) {
      console.error('❌ Error getting event counts:', err);
    } else {
      console.log(`\n📋 Events by type:`);
      rows.forEach(row => {
        console.log(`   ${row.event_type}: ${row.count}`);
      });
    }

    console.log('\n✅ Migration complete!');
    db.close();
  });
});
