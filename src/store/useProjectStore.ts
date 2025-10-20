import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROJECTS_STORAGE_KEY = '@snapcraft:completedProjects';

export type CompletedProject = {
  id: string;
  projectId: string;
  projectTitle: string;
  material: string;
  image?: string;
  completedAt: number;
  videoPath?: string;
};

type ProjectState = {
  completedProjects: CompletedProject[];
  markAsComplete: (project: Omit<CompletedProject, 'id' | 'completedAt'>) => void;
  isProjectCompleted: (projectId: string) => boolean;
  removeProject: (id: string) => void;
  clear: () => void;
};

// Load projects from AsyncStorage on initialization
const loadProjectsFromStorage = async (): Promise<CompletedProject[]> => {
  try {
    console.log('📥 Loading projects from storage...');
    const stored = await AsyncStorage.getItem(PROJECTS_STORAGE_KEY);
    console.log('📦 Raw stored data:', stored ? 'exists' : 'empty');
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('✅ Loaded projects:', parsed.length);
      return parsed;
    }
  } catch (error) {
    console.error('❌ Failed to load projects from storage:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
  }
  return [];
};

// Save projects to AsyncStorage
const saveProjectsToStorage = async (projects: CompletedProject[]) => {
  try {
    console.log('💾 Saving projects to storage:', projects.length);
    const jsonString = JSON.stringify(projects);
    console.log('📝 JSON string length:', jsonString.length);
    await AsyncStorage.setItem(PROJECTS_STORAGE_KEY, jsonString);
    console.log('✅ Projects saved successfully!');
    
    // Verify save
    const verify = await AsyncStorage.getItem(PROJECTS_STORAGE_KEY);
    console.log('✅ Verified saved data:', verify ? 'exists' : 'FAILED');
  } catch (error) {
    console.error('❌ Failed to save projects to storage:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    throw error; // Re-throw so caller knows it failed
  }
};

export const useProjectStore = create<ProjectState>((set, get) => ({
  completedProjects: [],
  
  markAsComplete: async (project) => {
    try {
      console.log('🎯 markAsComplete called for:', project.projectTitle);
      
      const existing = get().completedProjects.find(p => p.projectId === project.projectId);
      if (existing) {
        console.log('⚠️ Project already marked as complete:', project.projectId);
        return;
      }
      
      const newProject = {
        id: Math.random().toString(36).slice(2),
        completedAt: Date.now(),
        ...project,
      };
      
      console.log('📝 New project object:', newProject);
      
      const updatedProjects = [newProject, ...get().completedProjects];
      console.log('📊 Total projects after add:', updatedProjects.length);
      
      // Update state FIRST
      set({ completedProjects: updatedProjects });
      console.log('✅ State updated');
      
      // Then persist to storage
      try {
        await saveProjectsToStorage(updatedProjects);
        console.log('✅ Project marked as complete and saved:', newProject.projectTitle);
      } catch (storageError) {
        console.error('❌ Storage save failed, but state is updated:', storageError);
        // State is still updated, just storage failed
      }
    } catch (error) {
      console.error('❌ Critical error in markAsComplete:', error);
      throw error;
    }
  },
  
  isProjectCompleted: (projectId) => {
    return get().completedProjects.some(p => p.projectId === projectId);
  },
  
  removeProject: async (id) => {
    const updatedProjects = get().completedProjects.filter(p => p.id !== id);
    set({ completedProjects: updatedProjects });
    await saveProjectsToStorage(updatedProjects);
  },
  
  clear: async () => {
    set({ completedProjects: [] });
    await AsyncStorage.removeItem(PROJECTS_STORAGE_KEY);
  },
}));

// Initialize store with data from AsyncStorage
loadProjectsFromStorage().then((projects) => {
  if (projects.length > 0) {
    useProjectStore.setState({ completedProjects: projects });
    console.log('✅ Loaded', projects.length, 'completed projects from storage');
  }
});
