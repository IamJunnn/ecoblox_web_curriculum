import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProgressEvent, EventType } from '../../progress/entities/progress-event.entity';
import { Repository } from 'typeorm';

async function fixCourseCompletion() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const progressRepository = app.get<Repository<ProgressEvent>>(
    getRepositoryToken(ProgressEvent),
  );

  console.log('🔧 Starting course completion fix...');

  // Find all quest_completed events that don't have a corresponding course_completed event
  const questCompletedEvents = await progressRepository.find({
    where: { event_type: EventType.QUEST_COMPLETED },
  });

  console.log(`  Found ${questCompletedEvents.length} quest_completed events`);

  let addedCount = 0;

  for (const questEvent of questCompletedEvents) {
    // Check if there's already a course_completed event for this student and course
    const existingCourseCompleted = await progressRepository.findOne({
      where: {
        student_id: questEvent.student_id,
        course_id: questEvent.course_id,
        event_type: EventType.COURSE_COMPLETED,
      },
    });

    if (!existingCourseCompleted) {
      // Create a course_completed event
      const courseCompletedEvent = progressRepository.create({
        student_id: questEvent.student_id,
        course_id: questEvent.course_id,
        event_type: EventType.COURSE_COMPLETED,
        level: 1,
        data: JSON.stringify({
          migrated: true,
          original_quest_timestamp: questEvent.timestamp
        }),
        timestamp: questEvent.timestamp, // Use the same timestamp as quest completion
      });

      await progressRepository.save(courseCompletedEvent);
      console.log(`  ✅ Added course_completed for student ${questEvent.student_id}, course ${questEvent.course_id}`);
      addedCount++;
    }
  }

  console.log(`\n🎉 Migration complete! Added ${addedCount} course_completed events.`);

  await app.close();
}

fixCourseCompletion().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
