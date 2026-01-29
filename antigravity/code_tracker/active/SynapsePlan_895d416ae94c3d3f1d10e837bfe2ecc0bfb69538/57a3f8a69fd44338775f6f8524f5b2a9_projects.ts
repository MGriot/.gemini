ƒimport api from './api';
import { Project } from '../types/project'; // Import Project type

export const getProjects = async () => {
  try {
    const response = await api.get('/projects/');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    throw error;
  }
};

export const getProjectById = async (projectId: string) => {
  try {
    const response = await api.get(`/projects/${projectId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch project ${projectId}:`, error);
    throw error;
  }
};

export const createProject = async (projectData: {
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  owner_id?: number;
  tag_ids?: number[];
  topic_ids?: number[];
}) => {
  try {
    const response = await api.post('/projects/', projectData);
    return response.data;
  } catch (error) {
    console.error('Failed to create project:', error);
    throw error;
  }
};

export const updateProject = async (projectId: string | number, projectData: {
  name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  owner_id?: number;
  tag_ids?: number[];
  topic_ids?: number[];
}) => {
  try {
    const response = await api.put(`/projects/${projectId}`, projectData);
    return response.data;
  } catch (error) {
    console.error(`Failed to update project ${projectId}:`, error);
    throw error;
  }
};

export const deleteProject = async (projectId: string | number) => {
  try {
    const response = await api.delete(`/projects/${projectId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete project ${projectId}:`, error);
    throw error;
  }
};

export const getSummaryGanttData = async (): Promise<Project[]> => {
  try {
    const response = await api.get('/projects/summary_gantt/');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch summary Gantt data:', error);
    throw error;
  }
};
ç çü*cascade08
üƒ "(895d416ae94c3d3f1d10e837bfe2ecc0bfb695382Ufile:///c:/Users/Admin/Documents/Coding/SynapsePlan/frontend/src/services/projects.ts:3file:///c:/Users/Admin/Documents/Coding/SynapsePlan