const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/student/badge-gallery/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Find and replace the loadBadges function content
const oldCode = `      const earnedBadges = progressData.badges || []
      const courses = coursesData.courses || coursesData || []
      setAllCourses(courses)

      // Combine badge data with course info
      const badgesWithCourses: BadgeWithCourse[] = earnedBadges.map((badge: Badge) => {
        const course = courses.find((c: Course) => c.id === badge.course_id)
        return {
          ...badge,
          course: course!,
          badge_icon: course?.badge_icon || '🏆',
          badge_message: course?.badge_message || 'Badge earned!',
        }
      })

      setBadges(badgesWithCourses)`;

const newCode = `      const earnedBadges = progressData.badges || []
      const allLoadedCourses = coursesData.courses || coursesData || []
      // Filter to only show courses 1-4 (hide placeholder courses 5-30)
      const visibleCourses = allLoadedCourses.filter((course: Course) => course.course_order <= 4)
      setAllCourses(visibleCourses)

      // Combine badge data with course info (only for visible courses)
      const badgesWithCourses: BadgeWithCourse[] = earnedBadges
        .map((badge: Badge) => {
          const course = visibleCourses.find((c: Course) => c.id === badge.course_id)
          if (!course) return null // Skip badges for hidden courses
          return {
            ...badge,
            course: course!,
            badge_icon: course?.badge_icon || '🏆',
            badge_message: course?.badge_message || 'Badge earned!',
          }
        })
        .filter((badge): badge is BadgeWithCourse => badge !== null)

      setBadges(badgesWithCourses)`;

content = content.replace(oldCode, newCode);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Updated badge-gallery/page.tsx');
