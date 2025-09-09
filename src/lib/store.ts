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

export interface ProductVariant {
  id: string;
  sku: string;
  color?: string;
  size?: string;
  capacity?: string;
  compat?: string;
}

export interface ProductAttribute {
  key: string;
  value: string;
}

export interface FormData {
  // Identification
  sku: string;
  gtin?: string;
  brand: string;
  type: string;
  model: string;
  keySpec: string;
  
  // Content RU/KZ
  titleRU: string;
  titleKZ: string;
  descRU: string;
  descKZ: string;
  
  // Variants
  variants: ProductVariant[];
  
  // Attributes
  attributes: ProductAttribute[];
  
  // Logistics
  weight?: number;
  dimensions?: string; // "Д×Ш×В"
  bundle?: string;
  warranty?: string;
  country?: string;
  cert?: string;
  power?: string;
  age?: string;
  
  // Legacy fields (for backward compatibility)
  category: string;
  price: string;
  quantity: string;
  description: string;
  additionalSpecs: string;
  extraKeywords: string[];
  generatedTitle: string;
  generatedDescription: string;
}



export interface CategoryChecklistState {
  categoryId: string;
  checkedItems: string[];
}

export type StudioStep = 'magic-fill' | 'product-info' | 'photo-editor' | 'export';

export interface StudioState {
  currentStep: StudioStep;
  setCurrentStep: (step: StudioStep) => void;
  resetStudio: () => void;
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
  clearStorage: () => void;
  addVariant: (variant: Omit<ProductVariant, 'id'>) => void;
  updateVariant: (id: string, variant: Partial<ProductVariant>) => void;
  removeVariant: (id: string) => void;
  addAttribute: (attribute: ProductAttribute) => void;
  updateAttribute: (index: number, attribute: Partial<ProductAttribute>) => void;
  removeAttribute: (index: number) => void;
}

interface ChecklistSlice {
  // Category checklist system
  categoryChecklist: CategoryChecklistState;
  setCategoryChecklist: (categoryId: string, checkedItems: string[]) => void;
  toggleCategoryItem: (itemId: string) => void;
  resetCategoryChecklist: () => void;
}

// Combined store
interface AppStore extends FilesSlice, SettingsSlice, FormSlice, ChecklistSlice, StudioState {}

const initialSettings: Settings = {
  maxEdgePx: 2000,
  format: 'webp',
  quality: 0.8,
  removeBg: false,
};

const initialFormData: FormData = {
  // Identification
  sku: '',
  gtin: '',
  brand: '',
  type: '',
  model: '',
  keySpec: '',
  
  // Content RU/KZ
  titleRU: '',
  titleKZ: '',
  descRU: '',
  descKZ: '',
  
  // Variants
  variants: [],
  
  // Attributes
  attributes: [],
  
  // Logistics
  weight: undefined,
  dimensions: '',
  bundle: '',
  warranty: '',
  country: '',
  cert: '',
  power: '',
  age: '',
  
  // Legacy fields
  category: '',
  price: '',
  quantity: '',
  description: '',
  additionalSpecs: '',
  extraKeywords: [],
  generatedTitle: '',
  generatedDescription: '',
};

const initialCategoryChecklist: CategoryChecklistState = {
  categoryId: '',
  checkedItems: [],
};

// Функция для нормализации данных формы
const normalizeFormData = (data: Record<string, unknown> | FormData): FormData => {
  return {
    ...initialFormData,
    ...data,
    // Убеждаемся, что variants и attributes всегда являются массивами
    variants: Array.isArray(data?.variants) ? data.variants : [],
    attributes: Array.isArray(data?.attributes) ? data.attributes : [],
    // Убеждаемся, что extraKeywords является массивом
    extraKeywords: Array.isArray(data?.extraKeywords) ? data.extraKeywords : [],
  };
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
      clearStorage: () => {
        // Очищаем localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('trade-card-builder-storage');
        }
        // Сбрасываем store с нормализованными данными
        set({ formData: normalizeFormData(initialFormData) });
      },
      addVariant: (variant) => set((state) => ({
        formData: {
          ...state.formData,
          variants: [...(Array.isArray(state.formData.variants) ? state.formData.variants : []), { ...variant, id: crypto.randomUUID() }]
        }
      })),
      updateVariant: (id, variant) => set((state) => ({
        formData: {
          ...state.formData,
          variants: (Array.isArray(state.formData.variants) ? state.formData.variants : []).map(v => v.id === id ? { ...v, ...variant } : v)
        }
      })),
      removeVariant: (id) => set((state) => ({
        formData: {
          ...state.formData,
          variants: (Array.isArray(state.formData.variants) ? state.formData.variants : []).filter(v => v.id !== id)
        }
      })),
      addAttribute: (attribute) => set((state) => ({
        formData: {
          ...state.formData,
          attributes: [...(Array.isArray(state.formData.attributes) ? state.formData.attributes : []), attribute]
        }
      })),
      updateAttribute: (index, attribute) => set((state) => ({
        formData: {
          ...state.formData,
          attributes: (Array.isArray(state.formData.attributes) ? state.formData.attributes : []).map((a, i) => i === index ? { ...a, ...attribute } : a)
        }
      })),
      removeAttribute: (index) => set((state) => ({
        formData: {
          ...state.formData,
          attributes: (Array.isArray(state.formData.attributes) ? state.formData.attributes : []).filter((_, i) => i !== index)
        }
      })),

      // Category checklist slice
      categoryChecklist: initialCategoryChecklist,
      setCategoryChecklist: (categoryId, checkedItems) => set({
        categoryChecklist: { categoryId, checkedItems }
      }),
      toggleCategoryItem: (itemId) => set((state) => {
        const { checkedItems } = state.categoryChecklist;
        const isChecked = checkedItems.includes(itemId);
        const newCheckedItems = isChecked
          ? checkedItems.filter(id => id !== itemId)
          : [...checkedItems, itemId];
        
        return {
          categoryChecklist: {
            ...state.categoryChecklist,
            checkedItems: newCheckedItems
          }
        };
      }),
      resetCategoryChecklist: () => set({ categoryChecklist: initialCategoryChecklist }),

      // Studio slice
      currentStep: 'magic-fill',
      setCurrentStep: (step) => set({ currentStep: step }),
      resetStudio: () => set({ currentStep: 'magic-fill' }),
    }),
    {
      name: 'trade-card-builder-storage',
      partialize: (state) => ({
        settings: state.settings,
        formData: state.formData,
        categoryChecklist: state.categoryChecklist,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Нормализуем данные при загрузке из localStorage
          state.formData = normalizeFormData(state.formData);
        }
      },
    }
  )
);
