-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_game_enrollments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "game_id" INTEGER NOT NULL,
    "class_code" TEXT NOT NULL,
    "enrolled_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unlocked_by" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "completed_at" DATETIME,
    CONSTRAINT "game_enrollments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "game_enrollments_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_game_enrollments" ("class_code", "completed_at", "enrolled_at", "game_id", "id", "is_active", "unlocked_by", "user_id") SELECT "class_code", "completed_at", "enrolled_at", "game_id", "id", "is_active", "unlocked_by", "user_id" FROM "game_enrollments";
DROP TABLE "game_enrollments";
ALTER TABLE "new_game_enrollments" RENAME TO "game_enrollments";
CREATE INDEX "game_enrollments_class_code_idx" ON "game_enrollments"("class_code");
CREATE UNIQUE INDEX "game_enrollments_user_id_game_id_key" ON "game_enrollments"("user_id", "game_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
