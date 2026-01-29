•import api from './api';
import { Subtask, SubtaskCreate, SubtaskUpdate } from '../types/subtask'; 
export type { Subtask, SubtaskCreate, SubtaskUpdate }; 

export const getSubtasks = async (taskId: number, parentSubtaskId?: number): Promise<Subtask[]> => {
    // Modify this to fetch based on parent_task_id OR parent_subtask_id
    let url = `/tasks/${taskId}/subtasks/`;
    if (parentSubtaskId) {
        url += `?parent_subtask_id=${parentSubtaskId}`;
    }
    const response = await api.get<Subtask[]>(url);
    return response.data;
};

export const createSubtask = async (
    parentTaskId: number | undefined, 
    parentSubtaskId: number | undefined, 
    subtaskData: SubtaskCreate
): Promise<Subtask> => {
    // Backend requires SubtaskCreate schema: name (mapped from title), owner_id
    const payload: any = {
        name: subtaskData.name,
        description: subtaskData.description,
        owner_id: subtaskData.owner_id,
        start_date: subtaskData.start_date,
        end_date: subtaskData.end_date,
        status: subtaskData.status,
        progress: subtaskData.progress,
        tag_ids: subtaskData.tag_ids,
        topic_ids: subtaskData.topic_ids,
    };

    let url = '';
    if (parentTaskId) {
        url = `/tasks/${parentTaskId}/subtasks/`;
        // Pass parent_subtask_id as query param if it exists
        if (parentSubtaskId) {
            url += `?parent_subtask_id=${parentSubtaskId}`;
        }
    } else if (parentSubtaskId) {
        // This case would mean creating a subtask directly under a subtask,
        // but the current backend router still links to a task.
        // The backend `create_subtask_for_task` needs a task_id path param.
        // We will assume that if parentSubtaskId is given, its parent task ID will be passed as taskId.
        // This logic needs to be refined if the backend ever supports direct subtask creation endpoints.
        // For now, if creating a sub-subtask, we always need the grand-parent task_id.
        // The backend `create_subtask_for_task` can handle parent_subtask_id in query.
        throw new Error("Cannot create subtask directly under another subtask without parent task ID. Use grand-parent task ID.");
    } else {
        throw new Error("Must provide either parentTaskId or parentSubtaskId.");
    }
    
    // Explicitly set parent_task_id/parent_subtask_id in payload if not already set by query param
    // This is for the backend Pydantic model
    if (parentTaskId) payload.parent_task_id = parentTaskId;
    if (parentSubtaskId) payload.parent_subtask_id = parentSubtaskId;


    const response = await api.post<Subtask>(url, payload);
    return response.data;
};

export const updateSubtask = async (subtaskId: number, updates: SubtaskUpdate): Promise<Subtask> => {
    const response = await api.put(`/subtasks/${subtaskId}`, updates);
    return response.data;
};

export const deleteSubtask = async (subtaskId: number): Promise<void> => {
    await api.delete(`/subtasks/${subtaskId}`);
};
•"(895d416ae94c3d3f1d10e837bfe2ecc0bfb695382Ufile:///c:/Users/Admin/Documents/Coding/SynapsePlan/frontend/src/services/subtasks.ts:3file:///c:/Users/Admin/Documents/Coding/SynapsePlan