'use client';

import { useAppStore } from '@/lib/store';
import { 
  Wand2, 
  FileText, 
  Image, 
  Download,
  CheckCircle,
  Circle
} from 'lucide-react';

const steps = [
  {
    id: 'magic-fill',
    title: 'Magic Fill AI',
    description: 'Автоматическое заполнение',
    icon: Wand2,
    shortTitle: 'Magic Fill'
  },
  {
    id: 'product-info',
    title: 'Информация о товаре',
    description: 'Проверка и редактирование',
    icon: FileText,
    shortTitle: 'Информация'
  },
  {
    id: 'photo-editor',
    title: 'Редактор фото',
    description: 'Обработка изображений',
    icon: Image,
    shortTitle: 'Фото',
    optional: true
  },
  {
    id: 'export',
    title: 'Экспорт',
    description: 'Скачивание пакета',
    icon: Download,
    shortTitle: 'Экспорт'
  }
];

export default function StepRoadmap() {
  const { currentStep } = useAppStore();
  
  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === currentStep);
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Desktop Roadmap */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between relative">
          {/* Progress Line */}
          <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200 -z-10">
            <div 
              className="h-full bg-gray-900 transition-all duration-500"
              style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
            />
          </div>
          
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = index < currentStepIndex;
            const isUpcoming = index > currentStepIndex;
            
            return (
              <div key={step.id} className="flex flex-col items-center relative z-10">
                <div className={`
                  flex items-center justify-center w-12 h-12 rounded-xl border-2 transition-all duration-300
                  ${isActive 
                    ? 'bg-gray-900 border-gray-900 text-white shadow-lg' 
                    : isCompleted
                    ? 'bg-gray-900 border-gray-900 text-white'
                    : 'bg-white border-gray-200 text-gray-400'
                  }
                `}>
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>
                
                <div className="mt-4 text-center">
                  <div className={`
                    text-sm font-semibold transition-colors
                    ${isActive ? 'text-gray-900' : isCompleted ? 'text-gray-900' : 'text-gray-500'}
                  `}>
                    {step.title}
                    {step.optional && (
                      <span className="text-xs text-gray-400 ml-1">(опционально)</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {step.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Roadmap */}
      <div className="md:hidden">
        <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = index < currentStepIndex;
            
            return (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-lg border-2 transition-all duration-300
                  ${isActive 
                    ? 'bg-gray-900 border-gray-900 text-white' 
                    : isCompleted
                    ? 'bg-gray-900 border-gray-900 text-white'
                    : 'bg-white border-gray-200 text-gray-400'
                  }
                `}>
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                
                <div className="text-xs text-center mt-2">
                  <div className={`
                    font-medium transition-colors
                    ${isActive ? 'text-gray-900' : isCompleted ? 'text-gray-900' : 'text-gray-500'}
                  `}>
                    {step.shortTitle}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
