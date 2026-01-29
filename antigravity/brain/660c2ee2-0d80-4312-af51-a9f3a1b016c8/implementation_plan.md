# Implementation Plan - Enhance Project and Task Management

The goal is to provide full CRUD functionality for Projects and Tasks, ensuring the "empty" state is replaced by a rich management interface.

## User Review Required
> [!IMPORTANT]
> This plan involves modifying the `TaskDetailModal` to be an editing form rather than just a viewer. This changes the interaction model slightly.
> `ProjectDetailPage` will also become an administration point for the project.

## Proposed Changes

### Frontend Components

#### [MODIFY] [TaskDetailModal.tsx](file:///c:/Users/Admin/Documents/Coding/SynapsePlan/frontend/src/components/tasks/TaskDetailModal.tsx)
-   Convert Description to `TextField` (multiline).
-   Convert Priority to `Select` or dropdown.
-   Convert Due Date to a Date Picker (or text field for MVP).
-   Add `updateTask` service call on "Save Changes".
-   Ensure modifications reflect immediately (optimistic UI or refetch).

#### [MODIFY] [DashboardPage.tsx](file:///c:/Users/Admin/Documents/Coding/SynapsePlan/frontend/src/pages/dashboardPage.tsx)
-   Add a "Create New Project" button (e.g., in the header or a dedicated card).
-   Reuse `CreateProjectModal` to handle the flow.

#### [NEW] [ProjectGanttChart.tsx](file:///c:/Users/Admin/Documents/Coding/SynapsePlan/frontend/src/components/projects/ProjectGanttChart.tsx)
#### [MODIFY] [ProjectDetailPage.tsx](file:///c:/Users/Admin/Documents/Coding/SynapsePlan/frontend/src/pages/projectDetailPage.tsx)
-   Add an "Edit" button to toggle edit mode for Project Name and Description.
-   Add a "Delete" button with confirmation to delete the project.
-   Add a "Create Task" button to add tasks directly from this list view.
-   Improve Task List styling (maybe re-use `TaskCard` or a table view).

### Form Enhancements
#### [MODIFY] [CreateProjectModal.tsx](file:///c:/Users/Admin/Documents/Coding/SynapsePlan/frontend/src/components/projects/CreateProjectModal.tsx)
- Add DatePickers for Start/End Date.
- Add Select for Status (optional, default Not Started).

#### [MODIFY] [CreateTaskModal.tsx](file:///c:/Users/Admin/Documents/Coding/SynapsePlan/frontend/src/components/tasks/CreateTaskModal.tsx)
- Add DatePickers for Start/End Date.
- Add Select for Status and Priority.

### Edit Functionality
#### [NEW] [EditProjectModal.tsx](file:///c:/Users/Admin/Documents/Coding/SynapsePlan/frontend/src/components/projects/EditProjectModal.tsx)
- Duplicate/Adapt CreateProjectModal.
- Pre-fill data.
- Call `updateProject`.

#### [NEW] [EditTaskModal.tsx](file:///c:/Users/Admin/Documents/Coding/SynapsePlan/frontend/src/components/tasks/EditTaskModal.tsx)
- Duplicate/Adapt CreateTaskModal.
- Pre-fill data.
- Call `updateTask`.

#### [MODIFY] [ProjectDetailPage.tsx](file:///c:/Users/Admin/Documents/Coding/SynapsePlan/frontend/src/pages/projectDetailPage.tsx)
- Add state for `isEditProjectModalOpen`.
- Add state for `isEditTaskModalOpen` and `selectedTask`.
- Wire up "Edit" buttons.

#### [MODIFY] [projects.ts](file:///c:/Users/Admin/Documents/Coding/SynapsePlan/frontend/src/services/projects.ts)
-   Add `updateProject` and `deleteProject` functions if missing.

### Backend Verification
-   Ensure `PUT /tasks/{id}` supports all fields being edited.
-   Ensure `PUT /projects/{id}` and `DELETE /projects/{id}` work as expected.

### Subtask Management
#### [MODIFY] [EditTaskModal.tsx](file:///c:/Users/Admin/Documents/Coding/SynapsePlan/frontend/src/components/tasks/EditTaskModal.tsx)
-   Add "Subtasks" section.
-   List existing subtasks.
-   Add "Add Subtask" form (inline or nested).
-   Add "Edit Subtask" functionality.
-   **Date Logic**: Calculate min/max dates from subtasks. Suggest these values to the user (e.g., "Apply Suggested Dates" button or auto-fill if empty).

#### [MODIFY] [backend/main.py] (or create router)
-   Ensure endpoints `POST /tasks/{id}/subtasks`, `PUT /subtasks/{id}`, `DELETE /subtasks/{id}` exist.

## Verification Plan

### Manual Verification
1.  **Project Management**:
    -   Create a new project.
    -   Go to Project Detail page.
    -   Edit name/description and save. Verify update.
    -   Delete project. Verify redirection to project list.
2.  **Task Management**:
    -   Open Task Detail Modal.
    -   Change description, priority, due date.
    -   Save.
    -   Re-open to verify persistence.
    -   Check if changes appear on Board.
3.  **Subtasks**:
    -   Verify standard add/toggle/delete flows continue to work.
