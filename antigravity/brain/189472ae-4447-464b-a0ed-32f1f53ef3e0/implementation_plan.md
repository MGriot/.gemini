# Implementation Plan - Fix Project/Task/Subtask Creation

The goal is to resolve critical 500 errors in the backend and improve the frontend UI to align with project requirements and the roadmap.

## Proposed Changes

### Backend

#### [MODIFY] [tasks.py](file:///c:/Users/Admin/Documents/Coding/SynapsePlan/backend/routers/tasks.py)
- Change `task.promoter_id` to handle `task.promoter_ids` (List[int]) in `create_task_for_project`.
- Update validation logic to iterate over `promoter_ids`.

#### [MODIFY] [admin.py](file:///c:/Users/Admin/Documents/Coding/SynapsePlan/backend/routers/admin.py)
- Add logging to `read_tags` and `read_topics` to identify the cause of 500 errors.
- Investigate/fix potential circular import or dependency issues with `get_current_active_superuser`.

---

### Frontend

#### [MODIFY] [CreateProjectModal.tsx](file:///c:/Users/Admin/Documents/Coding/SynapsePlan/frontend/src/components/projects/CreateProjectModal.tsx)
- Add `Owner` selection field using a searchable Autocomplete.
- Add `Promoters` selection field (multi-choice) if we decide to support it (check if we need a DB migration first, for now I'll add Owner at least).

#### [MODIFY] [CreateTaskModal.tsx](file:///c:/Users/Admin/Documents/Coding/SynapsePlan/frontend/src/components/tasks/CreateTaskModal.tsx)
- Refactor `handleAddSubtask` and `handleSubmit` to ensure validation messages are cleared correctly.
- Fix the issue where subtask name is not registered unless re-typed.

## Verification Plan

### Automated Tests
- Run `pytest` for authentication (already exists).
- I will create a small script to test the `/admin/tags` endpoint directly if needed.

### Manual Verification
1. Login as `admin@synapseplan.com`.
2. Create a Project:
   - Verify Owner selection is present.
   - Verify Tags/Topics are loaded (once fixed).
3. Create a Task in the project:
   - Verify Promoters selection works.
   - Verify Task is created successfully (no 500 error).
4. Create Subtasks and Nested Subtasks:
   - Verify the hierarchy is correctly displayed in the list.
5. Check Browser Console:
   - Verify no 404/500 errors for admin endpoints.
