import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  originalUrl?: string;
  processedUrl?: string;
  originalFile?: File; // Store the actual File object
  error?: string;
}

export interface Settings {
  maxEdgePx: number;
  format: 'jpeg' | 'webp';
  quality: number;
  removeBg: boolean;
}

export interface FormData {
  brand: string;
  type: string;
  model: string;
  keySpec: string;
  sku: string;
  category: string;
  price: number;
  quantity: number;
  description: string;
  additionalSpecs: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

// Store slices
interface FilesSlice {
  files: FileItem[];
  selectedFileId: string | null;
  addFile: (file: FileItem) => void;
  removeFile: (id: string) => void;
  updateFileStatus: (id: string, status: FileItem['status'], error?: string) => void;
  updateFileUrls: (id: string, originalUrl?: string, processedUrl?: string) => void;
  clearFiles: () => void;
  setSelectedFile: (id: string | null) => void;
}

interface SettingsSlice {
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => void;
}

interface FormSlice {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  resetForm: () => void;
}

interface ChecklistSlice {
  checklist: ChecklistItem[];
  setChecklist: (items: ChecklistItem[]) => void;
  toggleItem: (id: string) => void;
  resetChecklist: () => void;
}

// Combined store
interface AppStore extends FilesSlice, SettingsSlice, FormSlice, ChecklistSlice {}

const initialSettings: Settings = {
  maxEdgePx: 2000,
  format: 'webp',
  quality: 0.8,
  removeBg: false,
};

const initialFormData: FormData = {
  brand: '',
  type: '',
  model: '',
  keySpec: '',
  sku: '',
  category: '',
  price: 0,
  quantity: 1,
  description: '',
  additionalSpecs: '',
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      // Files slice
      files: [],
      selectedFileId: null,
      addFile: (file) => set((state) => ({ files: [...state.files, file] })),
      removeFile: (id) => set((state) => {
        const fileToRemove = state.files.find(f => f.id === id);
        if (fileToRemove?.originalUrl) {
          URL.revokeObjectURL(fileToRemove.originalUrl);
        }
        if (fileToRemove?.processedUrl) {
          URL.revokeObjectURL(fileToRemove.processedUrl);
        }
        return {
          files: state.files.filter(f => f.id !== id),
          selectedFileId: state.selectedFileId === id ? null : state.selectedFileId
        };
      }),
      updateFileStatus: (id, status, error) => set((state) => ({
        files: state.files.map(f => f.id === id ? { ...f, status, error } : f)
      })),
      updateFileUrls: (id, originalUrl, processedUrl) => set((state) => ({
        files: state.files.map(f => f.id === id ? { ...f, originalUrl, processedUrl } : f)
      })),
      clearFiles: () => set((state) => {
        // Clean up all URLs
        state.files.forEach(file => {
          if (file.originalUrl) {
            URL.revokeObjectURL(file.originalUrl);
          }
          if (file.processedUrl) {
            URL.revokeObjectURL(file.processedUrl);
          }
        });
        return { files: [], selectedFileId: null };
      }),
      setSelectedFile: (id) => set({ selectedFileId: id }),

      // Settings slice
      settings: initialSettings,
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),

      // Form slice
      formData: initialFormData,
      updateFormData: (data) => set((state) => ({
        formData: { ...state.formData, ...data }
      })),
      resetForm: () => set({ formData: initialFormData }),

      // Checklist slice
      checklist: [],
      setChecklist: (items) => set({ checklist: items }),
      toggleItem: (id) => set((state) => ({
        checklist: state.checklist.map(item => 
          item.id === id ? { ...item, completed: !item.completed } : item
        )
      })),
      resetChecklist: () => set({ checklist: [] }),
    }),
    {
      name: 'kaspi-card-builder-storage',
      partialize: (state) => ({
        settings: state.settings,
        formData: state.formData,
        checklist: state.checklist,
      }),
    }
  )
);
