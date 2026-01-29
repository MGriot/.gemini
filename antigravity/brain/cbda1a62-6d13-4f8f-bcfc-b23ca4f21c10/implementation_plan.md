# Implementation Plan - Fix Task Workflow and Admin Issues

This plan addresses the 500 errors discovered during task and subtask creation, as well as the 500 errors in the Admin section for Tags and Topics.

## User Review Required

> [!NOTE]
> The subtask owner requirement in the frontend is being enforced by logic, but the UI label didn't explicitly mark it as required. I will add a `*` to the label to make it clearer.

## Proposed Changes

### Backend

#### [MODIFY] [tasks.py](file:///c:/Users/Admin/Documents/Coding/SynapsePlan/backend/routers/tasks.py)
- Fix `create_task_for_project` to use `task.promoter_ids` (plural) instead of `task.promoter_id` (singular) when validating users.
- Since it's a list, I will iterate through it to check if all users exist.

#### [MODIFY] [__init__.py](file:///c:/Users/Admin/Documents/Coding/SynapsePlan/backend/crud/__init__.py)
- Import all functions from `.tag` and `.topic` to make them available in the `crud` package.

### Frontend

#### [MODIFY] [CreateTaskModal.tsx](file:///c:/Users/Admin/Documents/Coding/SynapsePlan/frontend/src/components/tasks/CreateTaskModal.tsx)
- Update the "Owner" label in the subtask addition section to "Owner *" to indicate it is a required field.

## Verification Plan

### Automated Tests
- I will use the browser subagent to re-run the workflow testing.

### Manual Verification
- Navigate to `http://localhost/admin` and verify that Tags and Topics tabs load correctly.
- Navigate to a project and create a new task.
- Create a task with a subtask and verify success.
