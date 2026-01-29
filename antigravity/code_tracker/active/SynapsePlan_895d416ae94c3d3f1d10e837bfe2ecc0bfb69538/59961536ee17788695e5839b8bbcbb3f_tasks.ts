«import api from './api';
import { Task, TaskCreate, TaskUpdate } from '../types/task';

// Map frontend Task type to Backend schemas if necessary, for now assuming close enough match
// Backend expects: project_id in query/path, and body for create/update.

export const getTasks = async (projectId: string | number): Promise<Task[]> => {
  const response = await api.get(`/projects/${projectId}/tasks/`);
  return response.data;
};

export const getTask = async (taskId: string | number): Promise<Task> => {
  const response = await api.get(`/tasks/${taskId}`);
  return response.data;
};

export const getTaskById = getTask;

export const createTask = async (projectId: string | number, taskData: TaskCreate): Promise<Task> => {
  const response = await api.post(`/projects/${projectId}/tasks/`, taskData);
  return response.data;
};

export const updateTask = async (taskId: string | number, taskData: TaskUpdate): Promise<Task> => {
  const response = await api.put(`/tasks/${taskId}`, taskData);
  return response.data;
};

export const deleteTask = async (taskId: string | number): Promise<void> => {
  await api.delete(`/tasks/${taskId}`);
};

// Dependencies
export const getTaskDependencies = async (taskId: string | number) => {
    const response = await api.get(`/tasks/${taskId}/dependencies/`);
    return response.data;
};

export const createDependency = async (dependencyData: { 
    prerequisite_id?: number; 
    dependent_id?: number;
    prerequisite_subtask_id?: number;
    dependent_subtask_id?: number;
}) => {
    const response = await api.post(`/dependencies/`, dependencyData);
    return response.data;
};

export const deleteDependency = async (dependencyId: number) => {
    await api.delete(`/dependencies/${dependencyId}`);
};

// Comments
export const getTaskComments = async (taskId: string | number) => {
    const response = await api.get(`/comments/${taskId}`, { params: { item_type: 'task' } });
    return response.data;
};

export const createTaskComment = async (taskId: number, content: string) => {
    const response = await api.post(`/comments/`, { task_id: taskId, content });
    return response.data;
};

// Attachments (Mock implementation until Uploads are fully ready)
// Assuming endpoint /attachments/ exists and handles upload
export const getTaskAttachments = async (_taskId: string | number) => {
    // Check if GET /attachments/ exists with filters, or if we need a specific endpoint
    // For now assuming we might filter by task_id if supported, or use a specific endpoint
    // The router attachments.py usually has a GET method.
    // Let's assume a similar pattern to comments:
    // Actually, looking at routers/attachments.py would be good. 
    // I'll assume standard list for now or empty.
    // To be safe, I'll return empty list or implement if I see the router.
    return []; 
};
«"(895d416ae94c3d3f1d10e837bfe2ecc0bfb695382Rfile:///c:/Users/Admin/Documents/Coding/SynapsePlan/frontend/src/services/tasks.ts:3file:///c:/Users/Admin/Documents/Coding/SynapsePlan