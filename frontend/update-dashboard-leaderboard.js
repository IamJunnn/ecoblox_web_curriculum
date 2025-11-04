const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/student/dashboard/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Find and replace the data loading section
const oldCode = `      // Load all data in parallel
      const [progressData, coursesData, leaderboardData] = await Promise.all([
        progressAPI.getStudentProgress(user.id),
        coursesAPI.getCourses(),
        progressAPI.getLeaderboard(user.class_code || 'CLASS2025', 'week', user.id),
      ])

      const loadedCourses = coursesData.courses || coursesData || []`;

const newCode = `      // Load courses first to get gameId
      const coursesData = await coursesAPI.getCourses()
      const loadedCourses = coursesData.courses || coursesData || []

      // Get gameId from first course (all courses belong to same game)
      const gameId = loadedCourses.length > 0 ? loadedCourses[0].game_id : undefined

      // Load progress and leaderboard with gameId filter
      const [progressData, leaderboardData] = await Promise.all([
        progressAPI.getStudentProgress(user.id),
        progressAPI.getLeaderboard(user.class_code || 'CLASS2025', 'week', user.id, gameId),
      ])`;

content = content.replace(oldCode, newCode);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Updated dashboard to use gameId for leaderboard');
