const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/progress/progress.service.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Update the getLeaderboard function signature and student query
const oldCode = `  // Get leaderboard for a class
  async getLeaderboard(classCode: string, period: string = 'all', studentId?: number) {
    // Get students in this class
    const students = await this.prisma.user.findMany({
      where: {
        role: 'student',
        class_codes: {
          contains: classCode,
        },
      },
    });`;

const newCode = `  // Get leaderboard for a class
  async getLeaderboard(classCode: string, period: string = 'all', studentId?: number, gameId?: number) {
    // Get students enrolled in the same game
    let students;

    if (gameId) {
      // Filter by game enrollment
      const enrollments = await this.prisma.gameEnrollment.findMany({
        where: {
          game_id: gameId,
          is_active: true,
        },
        include: {
          user: true,
        },
      });

      students = enrollments
        .filter(e => e.user.role === 'student')
        .map(e => e.user);
    } else {
      // Fallback: Get students in this class
      students = await this.prisma.user.findMany({
        where: {
          role: 'student',
          class_codes: {
            contains: classCode,
          },
        },
      });
    }`;

content = content.replace(oldCode, newCode);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Updated progress.service.ts');
