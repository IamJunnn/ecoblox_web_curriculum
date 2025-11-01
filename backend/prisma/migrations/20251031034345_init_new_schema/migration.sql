-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "pin_code" TEXT,
    "role" TEXT NOT NULL DEFAULT 'student',
    "parent_email" TEXT,
    "parent_name" TEXT,
    "created_by_teacher_id" INTEGER,
    "class_codes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_active" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invitation_token" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "games" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "courses" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "game_id" INTEGER NOT NULL,
    "course_order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "total_steps" INTEGER NOT NULL,
    "badge_name" TEXT NOT NULL,
    "badge_icon" TEXT,
    "badge_message" TEXT,
    "requires_course" INTEGER,
    "url" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "courses_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "progress_events" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "event_type" TEXT NOT NULL,
    "step_number" INTEGER,
    "data" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "progress_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "progress_events_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "student_badges" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "badge_name" TEXT NOT NULL,
    "game_id" INTEGER NOT NULL,
    "earned_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "parent_notified" BOOLEAN NOT NULL DEFAULT false,
    "notified_at" DATETIME,
    CONSTRAINT "student_badges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "student_badges_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "class_codes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "game_id" INTEGER NOT NULL,
    "teacher_name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "max_students" INTEGER,
    "student_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" DATETIME,
    CONSTRAINT "class_codes_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "email_notifications" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "recipient_email" TEXT NOT NULL,
    "recipient_name" TEXT,
    "student_id" INTEGER NOT NULL,
    "student_name" TEXT NOT NULL,
    "email_type" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "badge_name" TEXT,
    "course_name" TEXT,
    "sent_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_sent" BOOLEAN NOT NULL DEFAULT true,
    "error_message" TEXT
);

-- CreateTable
CREATE TABLE "game_enrollments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "game_id" INTEGER NOT NULL,
    "class_code" TEXT NOT NULL,
    "enrolled_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unlocked_by" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "completed_at" DATETIME,
    CONSTRAINT "game_enrollments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "game_enrollments_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "courses_game_id_course_order_key" ON "courses"("game_id", "course_order");

-- CreateIndex
CREATE INDEX "progress_events_user_id_course_id_idx" ON "progress_events"("user_id", "course_id");

-- CreateIndex
CREATE UNIQUE INDEX "progress_events_user_id_course_id_step_number_key" ON "progress_events"("user_id", "course_id", "step_number");

-- CreateIndex
CREATE UNIQUE INDEX "student_badges_user_id_course_id_key" ON "student_badges"("user_id", "course_id");

-- CreateIndex
CREATE UNIQUE INDEX "class_codes_code_key" ON "class_codes"("code");

-- CreateIndex
CREATE INDEX "class_codes_teacher_id_game_id_idx" ON "class_codes"("teacher_id", "game_id");

-- CreateIndex
CREATE INDEX "email_notifications_student_id_idx" ON "email_notifications"("student_id");

-- CreateIndex
CREATE INDEX "email_notifications_recipient_email_idx" ON "email_notifications"("recipient_email");

-- CreateIndex
CREATE INDEX "game_enrollments_class_code_idx" ON "game_enrollments"("class_code");

-- CreateIndex
CREATE UNIQUE INDEX "game_enrollments_user_id_game_id_key" ON "game_enrollments"("user_id", "game_id");
