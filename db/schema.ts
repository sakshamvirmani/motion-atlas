import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const learnerProfiles = sqliteTable("learner_profiles", {
  userId: text("user_id").primaryKey(),
  displayName: text("display_name"),
  currentLesson: integer("current_lesson").notNull().default(1),
  schemaVersion: integer("schema_version").notNull().default(1),
  revision: integer("revision").notNull().default(0),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
  lastSeenAt: integer("last_seen_at").notNull(),
});

export const lessonProgress = sqliteTable(
  "lesson_progress",
  {
    userId: text("user_id").notNull(),
    lessonId: integer("lesson_id").notNull(),
    status: text("status").notNull().default("completed"),
    completedAt: integer("completed_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.lessonId] }),
    index("idx_lesson_progress_user_updated").on(
      table.userId,
      table.updatedAt,
    ),
  ],
);

export const quizProgress = sqliteTable(
  "quiz_progress",
  {
    userId: text("user_id").notNull(),
    lessonId: integer("lesson_id").notNull(),
    selectedAnswer: integer("selected_answer").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.lessonId] }),
    index("idx_quiz_progress_user_updated").on(
      table.userId,
      table.updatedAt,
    ),
  ],
);
