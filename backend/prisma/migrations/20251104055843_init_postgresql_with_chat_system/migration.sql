-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "pin_code" TEXT,
    "role" TEXT NOT NULL DEFAULT 'student',
    "parent_email" TEXT,
    "parent_name" TEXT,
    "created_by_teacher_id" INTEGER,
    "class_codes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_active" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invitation_token" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "games" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" SERIAL NOT NULL,
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
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progress_events" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "event_type" TEXT NOT NULL,
    "level_number" INTEGER,
    "step_number" INTEGER,
    "is_checked" BOOLEAN,
    "data" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "progress_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_badges" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "badge_name" TEXT NOT NULL,
    "game_id" INTEGER NOT NULL,
    "earned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "parent_notified" BOOLEAN NOT NULL DEFAULT false,
    "notified_at" TIMESTAMP(3),

    CONSTRAINT "student_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_codes" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "game_id" INTEGER NOT NULL,
    "teacher_name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "max_students" INTEGER,
    "student_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "class_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_notifications" (
    "id" SERIAL NOT NULL,
    "recipient_email" TEXT NOT NULL,
    "recipient_name" TEXT,
    "student_id" INTEGER NOT NULL,
    "student_name" TEXT NOT NULL,
    "email_type" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "badge_name" TEXT,
    "course_name" TEXT,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_sent" BOOLEAN NOT NULL DEFAULT true,
    "error_message" TEXT,

    CONSTRAINT "email_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_enrollments" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "game_id" INTEGER NOT NULL,
    "class_code" TEXT NOT NULL,
    "enrolled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unlocked_by" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "game_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_rooms" (
    "id" SERIAL NOT NULL,
    "room_type" TEXT NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "student_id" INTEGER,
    "name" TEXT,
    "class_code" TEXT,
    "last_message_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "chat_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_participants" (
    "id" SERIAL NOT NULL,
    "room_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_read_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_muted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "chat_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" SERIAL NOT NULL,
    "room_id" INTEGER NOT NULL,
    "sender_id" INTEGER NOT NULL,
    "sender_name" TEXT NOT NULL,
    "sender_role" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "message_type" TEXT NOT NULL DEFAULT 'text',
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_edited" BOOLEAN NOT NULL DEFAULT false,
    "edited_at" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "online_status" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "is_online" BOOLEAN NOT NULL DEFAULT false,
    "last_seen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "socket_id" TEXT,

    CONSTRAINT "online_status_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "courses_game_id_course_order_key" ON "courses"("game_id", "course_order");

-- CreateIndex
CREATE INDEX "progress_events_user_id_course_id_idx" ON "progress_events"("user_id", "course_id");

-- CreateIndex
CREATE UNIQUE INDEX "progress_events_user_id_course_id_event_type_level_number_s_key" ON "progress_events"("user_id", "course_id", "event_type", "level_number", "step_number");

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

-- CreateIndex
CREATE INDEX "chat_rooms_teacher_id_idx" ON "chat_rooms"("teacher_id");

-- CreateIndex
CREATE INDEX "chat_rooms_student_id_idx" ON "chat_rooms"("student_id");

-- CreateIndex
CREATE INDEX "chat_rooms_class_code_idx" ON "chat_rooms"("class_code");

-- CreateIndex
CREATE UNIQUE INDEX "chat_rooms_teacher_id_student_id_key" ON "chat_rooms"("teacher_id", "student_id");

-- CreateIndex
CREATE INDEX "chat_participants_user_id_idx" ON "chat_participants"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "chat_participants_room_id_user_id_key" ON "chat_participants"("room_id", "user_id");

-- CreateIndex
CREATE INDEX "chat_messages_room_id_sent_at_idx" ON "chat_messages"("room_id", "sent_at");

-- CreateIndex
CREATE INDEX "chat_messages_sender_id_idx" ON "chat_messages"("sender_id");

-- CreateIndex
CREATE UNIQUE INDEX "online_status_user_id_key" ON "online_status"("user_id");

-- CreateIndex
CREATE INDEX "online_status_user_id_idx" ON "online_status"("user_id");

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_events" ADD CONSTRAINT "progress_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_events" ADD CONSTRAINT "progress_events_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_badges" ADD CONSTRAINT "student_badges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_badges" ADD CONSTRAINT "student_badges_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_codes" ADD CONSTRAINT "class_codes_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_enrollments" ADD CONSTRAINT "game_enrollments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_enrollments" ADD CONSTRAINT "game_enrollments_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_participants" ADD CONSTRAINT "chat_participants_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "chat_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "chat_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
