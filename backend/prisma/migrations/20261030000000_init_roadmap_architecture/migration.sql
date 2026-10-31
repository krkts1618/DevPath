-- CreateTable
CREATE TABLE "roadmap_categories" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roadmap_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roadmaps" (
    "id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(220) NOT NULL,
    "description" TEXT,
    "duration" INTEGER NOT NULL,
    "target_daily_study_time" INTEGER NOT NULL DEFAULT 120,
    "start_date" TIMESTAMP(3),
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "icon_identifier" VARCHAR(50),
    "theme_identifier" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roadmaps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modules" (
    "id" UUID NOT NULL,
    "roadmap_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "starting_day" INTEGER NOT NULL,
    "ending_day" INTEGER NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roadmap_days" (
    "id" UUID NOT NULL,
    "roadmap_id" UUID NOT NULL,
    "module_id" UUID,
    "day_number" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "objective" TEXT,
    "estimated_study_time" INTEGER NOT NULL DEFAULT 120,
    "day_type" VARCHAR(30) NOT NULL DEFAULT 'learning',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roadmap_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" UUID NOT NULL,
    "roadmap_day_id" UUID NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "description" TEXT,
    "task_type" VARCHAR(30) NOT NULL DEFAULT 'learn',
    "estimated_duration" INTEGER NOT NULL DEFAULT 30,
    "is_required" BOOLEAN NOT NULL DEFAULT true,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "github_url" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_completions" (
    "id" UUID NOT NULL,
    "task_id" UUID NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT true,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_completions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_notes" (
    "id" UUID NOT NULL,
    "roadmap_id" UUID,
    "roadmap_day_id" UUID,
    "title" VARCHAR(200),
    "content" TEXT NOT NULL,
    "note_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resources" (
    "id" UUID NOT NULL,
    "roadmap_id" UUID,
    "task_id" UUID,
    "title" VARCHAR(255) NOT NULL,
    "url" VARCHAR(1000) NOT NULL,
    "description" TEXT,
    "resource_type" VARCHAR(50) NOT NULL DEFAULT 'documentation',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revision_schedule" (
    "id" UUID NOT NULL,
    "roadmap_id" UUID NOT NULL,
    "task_id" UUID,
    "scheduled_date" TIMESTAMP(3) NOT NULL,
    "revision_number" INTEGER NOT NULL DEFAULT 1,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "revision_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL,
    "roadmap_id" UUID,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "github_url" VARCHAR(500),
    "demo_url" VARCHAR(500),
    "status" VARCHAR(30) NOT NULL DEFAULT 'planned',
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_reassignments" (
    "id" UUID NOT NULL,
    "task_id" UUID NOT NULL,
    "original_roadmap_day_id" UUID NOT NULL,
    "new_roadmap_day_id" UUID NOT NULL,
    "reason" TEXT,
    "reassigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_reassignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roadmap_categories_name_key" ON "roadmap_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "roadmap_categories_slug_key" ON "roadmap_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "roadmaps_slug_key" ON "roadmaps"("slug");

-- CreateIndex
CREATE INDEX "roadmaps_category_id_idx" ON "roadmaps"("category_id");

-- CreateIndex
CREATE INDEX "roadmaps_status_idx" ON "roadmaps"("status");

-- CreateIndex
CREATE INDEX "modules_roadmap_id_idx" ON "modules"("roadmap_id");

-- CreateIndex
CREATE INDEX "modules_display_order_idx" ON "modules"("display_order");

-- CreateIndex
CREATE INDEX "roadmap_days_roadmap_id_idx" ON "roadmap_days"("roadmap_id");

-- CreateIndex
CREATE INDEX "roadmap_days_module_id_idx" ON "roadmap_days"("module_id");

-- CreateIndex
CREATE INDEX "roadmap_days_day_number_idx" ON "roadmap_days"("day_number");

-- CreateIndex
CREATE UNIQUE INDEX "roadmap_days_roadmap_id_day_number_key" ON "roadmap_days"("roadmap_id", "day_number");

-- CreateIndex
CREATE INDEX "tasks_roadmap_day_id_idx" ON "tasks"("roadmap_day_id");

-- CreateIndex
CREATE INDEX "tasks_task_type_idx" ON "tasks"("task_type");

-- CreateIndex
CREATE INDEX "task_completions_task_id_idx" ON "task_completions"("task_id");

-- CreateIndex
CREATE INDEX "task_completions_completed_at_idx" ON "task_completions"("completed_at");

-- CreateIndex
CREATE INDEX "task_completions_completed_idx" ON "task_completions"("completed");

-- CreateIndex
CREATE UNIQUE INDEX "task_completions_task_id_key" ON "task_completions"("task_id");

-- CreateIndex
CREATE INDEX "daily_notes_roadmap_id_idx" ON "daily_notes"("roadmap_id");

-- CreateIndex
CREATE INDEX "daily_notes_roadmap_day_id_idx" ON "daily_notes"("roadmap_day_id");

-- CreateIndex
CREATE INDEX "daily_notes_note_date_idx" ON "daily_notes"("note_date");

-- CreateIndex
CREATE INDEX "resources_roadmap_id_idx" ON "resources"("roadmap_id");

-- CreateIndex
CREATE INDEX "resources_task_id_idx" ON "resources"("task_id");

-- CreateIndex
CREATE INDEX "resources_resource_type_idx" ON "resources"("resource_type");

-- CreateIndex
CREATE INDEX "revision_schedule_roadmap_id_idx" ON "revision_schedule"("roadmap_id");

-- CreateIndex
CREATE INDEX "revision_schedule_task_id_idx" ON "revision_schedule"("task_id");

-- CreateIndex
CREATE INDEX "revision_schedule_scheduled_date_idx" ON "revision_schedule"("scheduled_date");

-- CreateIndex
CREATE INDEX "revision_schedule_completed_idx" ON "revision_schedule"("completed");

-- CreateIndex
CREATE INDEX "projects_roadmap_id_idx" ON "projects"("roadmap_id");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE INDEX "task_reassignments_task_id_idx" ON "task_reassignments"("task_id");

-- CreateIndex
CREATE INDEX "task_reassignments_original_roadmap_day_id_idx" ON "task_reassignments"("original_roadmap_day_id");

-- CreateIndex
CREATE INDEX "task_reassignments_new_roadmap_day_id_idx" ON "task_reassignments"("new_roadmap_day_id");

-- AddForeignKey
ALTER TABLE "roadmaps" ADD CONSTRAINT "roadmaps_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "roadmap_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modules" ADD CONSTRAINT "modules_roadmap_id_fkey" FOREIGN KEY ("roadmap_id") REFERENCES "roadmaps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmap_days" ADD CONSTRAINT "roadmap_days_roadmap_id_fkey" FOREIGN KEY ("roadmap_id") REFERENCES "roadmaps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmap_days" ADD CONSTRAINT "roadmap_days_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_roadmap_day_id_fkey" FOREIGN KEY ("roadmap_day_id") REFERENCES "roadmap_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_completions" ADD CONSTRAINT "task_completions_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_notes" ADD CONSTRAINT "daily_notes_roadmap_id_fkey" FOREIGN KEY ("roadmap_id") REFERENCES "roadmaps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_notes" ADD CONSTRAINT "daily_notes_roadmap_day_id_fkey" FOREIGN KEY ("roadmap_day_id") REFERENCES "roadmap_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_roadmap_id_fkey" FOREIGN KEY ("roadmap_id") REFERENCES "roadmaps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revision_schedule" ADD CONSTRAINT "revision_schedule_roadmap_id_fkey" FOREIGN KEY ("roadmap_id") REFERENCES "roadmaps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revision_schedule" ADD CONSTRAINT "revision_schedule_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_roadmap_id_fkey" FOREIGN KEY ("roadmap_id") REFERENCES "roadmaps"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_reassignments" ADD CONSTRAINT "task_reassignments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_reassignments" ADD CONSTRAINT "task_reassignments_original_roadmap_day_id_fkey" FOREIGN KEY ("original_roadmap_day_id") REFERENCES "roadmap_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_reassignments" ADD CONSTRAINT "task_reassignments_new_roadmap_day_id_fkey" FOREIGN KEY ("new_roadmap_day_id") REFERENCES "roadmap_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;
