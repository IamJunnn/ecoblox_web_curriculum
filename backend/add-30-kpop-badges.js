const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function add30KpopBadges() {
  console.log('🎮 Adding 30 badges to K-Pop Battery Sustainability game...\n');

  // Get the K-Pop game
  const kpopGame = await prisma.game.findFirst({
    where: { name: 'K-Pop Battery Sustainability' }
  });

  if (!kpopGame) {
    console.error('❌ K-Pop game not found!');
    process.exit(1);
  }

  console.log(`✅ Found game: ${kpopGame.name} (ID: ${kpopGame.id})\n`);

  // Check existing courses
  const existingCourses = await prisma.course.findMany({
    where: { game_id: kpopGame.id },
    orderBy: { course_order: 'asc' }
  });

  console.log(`📚 Existing courses: ${existingCourses.length}`);
  existingCourses.forEach(c => {
    console.log(`  ${c.course_order}. ${c.title} - ${c.badge_name} ${c.badge_icon}`);
  });
  console.log('');

  // All 30 courses (including the 4 existing ones)
  const allCourses = [
    // EXISTING COURSES 1-4
    {
      course_order: 1,
      title: 'Install Roblox Studio',
      description: 'Download and install Roblox Studio on your computer',
      total_steps: 5,
      badge_name: 'Starter Badge',
      badge_icon: '🎯',
      badge_message: 'Great job! You have Roblox Studio installed!',
    },
    {
      course_order: 2,
      title: 'Create Roblox Account',
      description: 'Set up your Roblox developer account',
      total_steps: 7,
      badge_name: 'Account Badge',
      badge_icon: '👤',
      badge_message: 'Awesome! You are now a Roblox developer!',
    },
    {
      course_order: 3,
      title: 'Studio Basics',
      description: 'Learn the Roblox Studio interface and basic tools',
      total_steps: 24,
      badge_name: 'Explorer Badge',
      badge_icon: '🔍',
      badge_message: 'You know your way around Roblox Studio!',
    },
    {
      course_order: 4,
      title: 'Introduction to K-Pop Battery Game',
      description: 'Play the game and understand what you will be building',
      total_steps: 4,
      badge_name: 'Game Explorer',
      badge_icon: '🎮',
      badge_message: 'Great job! You understand the K-Pop Battery Game!',
      url: 'https://www.roblox.com/games/98002235488946/Ecoblox-K-Pop-Battery-Sustainability',
    },

    // NEW COURSES 5-10: Building Mastery Track
    {
      course_order: 5,
      title: 'Building the Stage',
      description: 'Create the K-Pop concert stage structure',
      total_steps: 8,
      badge_name: 'Part Master',
      badge_icon: '🧱',
      badge_message: "You've mastered parts, unions, and negations!",
    },
    {
      course_order: 6,
      title: 'Battery Storage Design',
      description: 'Build the upcycled EV battery storage system',
      total_steps: 10,
      badge_name: 'Obstacle Creator',
      badge_icon: '🎢',
      badge_message: 'Your obstacles are creative and challenging!',
    },
    {
      course_order: 7,
      title: 'Concert Venue Layout',
      description: 'Design the complete concert venue with terrain',
      total_steps: 12,
      badge_name: 'Terrain Sculptor',
      badge_icon: '🏔️',
      badge_message: 'You can shape amazing landscapes!',
    },
    {
      course_order: 8,
      title: 'Organizing with Models',
      description: 'Use models to organize your concert equipment',
      total_steps: 6,
      badge_name: 'Model Architect',
      badge_icon: '🏛️',
      badge_message: "You're a pro at organizing models!",
    },
    {
      course_order: 9,
      title: 'Custom Stage Props',
      description: 'Import custom 3D meshes for stage decorations',
      total_steps: 8,
      badge_name: 'Mesh Importer',
      badge_icon: '📦',
      badge_message: 'You can import custom 3D meshes!',
    },
    {
      course_order: 10,
      title: 'Stage Decorations',
      description: 'Add details to make your concert venue amazing',
      total_steps: 10,
      badge_name: 'Detail Designer',
      badge_icon: '✨',
      badge_message: 'Your builds look polished and professional!',
    },

    // NEW COURSES 11-18: Scripting Track
    {
      course_order: 11,
      title: 'First Concert Script',
      description: 'Write your first Lua script for the concert',
      total_steps: 6,
      badge_name: 'Script Starter',
      badge_icon: '📝',
      badge_message: 'You wrote your first Lua script!',
    },
    {
      course_order: 12,
      title: 'Battery Power Variables',
      description: 'Use variables to track battery power levels',
      total_steps: 8,
      badge_name: 'Variable Wizard',
      badge_icon: '🔢',
      badge_message: 'You understand variables and data types!',
    },
    {
      course_order: 13,
      title: 'Concert Functions',
      description: 'Create reusable functions for concert mechanics',
      total_steps: 10,
      badge_name: 'Function Master',
      badge_icon: '⚙️',
      badge_message: 'You can create and use functions!',
    },
    {
      course_order: 14,
      title: 'Button Events',
      description: 'Handle player interactions with battery controls',
      total_steps: 8,
      badge_name: 'Event Handler',
      badge_icon: '🎯',
      badge_message: "You've mastered game events!",
    },
    {
      course_order: 15,
      title: 'Power Loop System',
      description: 'Use loops to manage battery charging cycles',
      total_steps: 10,
      badge_name: 'Loop Expert',
      badge_icon: '🔄',
      badge_message: 'You know how to use loops efficiently!',
    },
    {
      course_order: 16,
      title: 'Battery Logic',
      description: 'Write conditional logic for battery management',
      total_steps: 12,
      badge_name: 'Conditional Coder',
      badge_icon: '🔀',
      badge_message: 'You can write conditional logic!',
    },
    {
      course_order: 17,
      title: 'Dancer Controls',
      description: 'Script player character movement and dancing',
      total_steps: 10,
      badge_name: 'Player Pro',
      badge_icon: '👤',
      badge_message: 'You can manipulate player characters!',
    },
    {
      course_order: 18,
      title: 'Debugging Concert Code',
      description: 'Find and fix bugs in your concert scripts',
      total_steps: 8,
      badge_name: 'Debug Detective',
      badge_icon: '🔍',
      badge_message: "You're great at finding and fixing bugs!",
    },

    // NEW COURSES 19-24: Game Mechanics Track
    {
      course_order: 19,
      title: 'Battery Checkpoints',
      description: 'Create checkpoint system for battery collection',
      total_steps: 10,
      badge_name: 'Checkpoint Champion',
      badge_icon: '🚩',
      badge_message: 'You built a checkpoint system!',
    },
    {
      course_order: 20,
      title: 'Concert Timer',
      description: 'Add countdown timer for concert performances',
      total_steps: 8,
      badge_name: 'Timer Technician',
      badge_icon: '⏱️',
      badge_message: 'You created timer mechanics!',
    },
    {
      course_order: 21,
      title: 'Energy Management',
      description: 'Implement battery energy and health systems',
      total_steps: 12,
      badge_name: 'Lives Manager',
      badge_icon: '❤️',
      badge_message: 'You implemented health systems!',
    },
    {
      course_order: 22,
      title: 'Sustainability Leaderboard',
      description: 'Create leaderboard for most eco-friendly players',
      total_steps: 10,
      badge_name: 'Leaderboard Maker',
      badge_icon: '📊',
      badge_message: 'You built a competitive leaderboard!',
    },
    {
      course_order: 23,
      title: 'K-Pop Music System',
      description: 'Add K-Pop songs and sound effects to your game',
      total_steps: 8,
      badge_name: 'Sound Engineer',
      badge_icon: '🎵',
      badge_message: 'Your game sounds amazing!',
    },
    {
      course_order: 24,
      title: 'Concert UI Design',
      description: 'Create user interface for battery and concert info',
      total_steps: 12,
      badge_name: 'UI Designer',
      badge_icon: '🖼️',
      badge_message: 'You created a beautiful user interface!',
    },

    // NEW COURSES 25-30: Polish & Publishing Track
    {
      course_order: 25,
      title: 'Stage Lighting Effects',
      description: 'Add dramatic lighting to your concert stage',
      total_steps: 10,
      badge_name: 'Lighting Artist',
      badge_icon: '💡',
      badge_message: 'Your lighting creates the perfect mood!',
    },
    {
      course_order: 26,
      title: 'Dance Animations',
      description: 'Create K-Pop dance animations for characters',
      total_steps: 12,
      badge_name: 'Animation Creator',
      badge_icon: '🎬',
      badge_message: 'You brought your game to life with animations!',
    },
    {
      course_order: 27,
      title: 'Game Testing & Balance',
      description: 'Playtest and balance your concert game mechanics',
      total_steps: 8,
      badge_name: 'Game Balancer',
      badge_icon: '⚖️',
      badge_message: 'Your game is perfectly balanced and fun!',
    },
    {
      course_order: 28,
      title: 'Publishing Your Concert',
      description: 'Publish your K-Pop Battery game to Roblox',
      total_steps: 6,
      badge_name: 'Publisher',
      badge_icon: '🚀',
      badge_message: 'You published your game to Roblox!',
    },
    {
      course_order: 29,
      title: 'Marketing Your Game',
      description: 'Create thumbnails and descriptions to attract players',
      total_steps: 8,
      badge_name: 'Marketer',
      badge_icon: '📢',
      badge_message: 'Your game looks amazing in the catalog!',
    },
    {
      course_order: 30,
      title: 'K-Pop Master Achievement',
      description: 'Complete all courses and become a K-Pop game master',
      total_steps: 5,
      badge_name: 'K-Pop Legend',
      badge_icon: '🏆',
      badge_message: 'You completed the entire K-Pop Battery course!',
    },
  ];

  // Find courses that need to be created (courses 5-30)
  const coursesToCreate = allCourses.filter(c => c.course_order > 4);

  console.log(`➕ Creating ${coursesToCreate.length} new courses (5-30)...\n`);

  let createdCount = 0;
  for (const courseData of coursesToCreate) {
    try {
      const course = await prisma.course.create({
        data: {
          game_id: kpopGame.id,
          course_order: courseData.course_order,
          title: courseData.title,
          description: courseData.description,
          total_steps: courseData.total_steps,
          badge_name: courseData.badge_name,
          badge_icon: courseData.badge_icon,
          badge_message: courseData.badge_message,
          requires_course: courseData.course_order > 1 ? existingCourses.find(c => c.course_order === courseData.course_order - 1)?.id || null : null,
          url: courseData.url || null,
          display_order: courseData.course_order,
        },
      });
      console.log(`✅ ${course.course_order}. ${course.title} - ${course.badge_name} ${course.badge_icon}`);
      createdCount++;
    } catch (error) {
      console.error(`❌ Failed to create course ${courseData.course_order}: ${error.message}`);
    }
  }

  console.log(`\n✨ Successfully created ${createdCount} new courses!`);

  // Verify total count
  const finalCourses = await prisma.course.findMany({
    where: { game_id: kpopGame.id },
    orderBy: { course_order: 'asc' }
  });

  console.log(`\n📊 Total courses in K-Pop game: ${finalCourses.length}/30`);

  await prisma.$disconnect();
}

add30KpopBadges()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  });
