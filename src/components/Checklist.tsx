'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useAppStore } from '@/lib/store';
import { useEffect } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

const CHECKLIST_PRESETS = {
  electronics: [
    { id: 'electronics-1', text: 'Указаны основные технические характеристики' },
    { id: 'electronics-2', text: 'Есть информация о гарантии' },
    { id: 'electronics-3', text: 'Указана мощность/емкость батареи' },
    { id: 'electronics-4', text: 'Есть размеры и вес товара' },
    { id: 'electronics-5', text: 'Указаны совместимые модели/системы' },
    { id: 'electronics-6', text: 'Есть информация о комплектации' },
  ],
  clothing: [
    { id: 'clothing-1', text: 'Указан состав материала' },
    { id: 'clothing-2', text: 'Есть размерная сетка' },
    { id: 'clothing-3', text: 'Указаны рекомендации по уходу' },
    { id: 'clothing-4', text: 'Есть информация о сезонности' },
    { id: 'clothing-5', text: 'Указан пол и возрастная группа' },
    { id: 'clothing-6', text: 'Есть информация о стиле/назначении' },
  ],
  cosmetics: [
    { id: 'cosmetics-1', text: 'Указан состав продукта' },
    { id: 'cosmetics-2', text: 'Есть информация о объеме/весе' },
    { id: 'cosmetics-3', text: 'Указан срок годности' },
    { id: 'cosmetics-4', text: 'Есть рекомендации по применению' },
    { id: 'cosmetics-5', text: 'Указаны противопоказания' },
    { id: 'cosmetics-6', text: 'Есть информация о сертификации' },
  ],
  home: [
    { id: 'home-1', text: 'Указаны размеры и вес' },
    { id: 'home-2', text: 'Есть информация о материале' },
    { id: 'home-3', text: 'Указаны рекомендации по уходу' },
    { id: 'home-4', text: 'Есть информация о сборке/установке' },
    { id: 'home-5', text: 'Указана грузоподъемность/нагрузка' },
    { id: 'home-6', text: 'Есть информация о гарантии' },
  ],
  sports: [
    { id: 'sports-1', text: 'Указаны размеры и вес' },
    { id: 'sports-2', text: 'Есть информация о материале' },
    { id: 'sports-3', text: 'Указана максимальная нагрузка' },
    { id: 'sports-4', text: 'Есть рекомендации по использованию' },
    { id: 'sports-5', text: 'Указан уровень подготовки' },
    { id: 'sports-6', text: 'Есть информация о безопасности' },
  ],
  books: [
    { id: 'books-1', text: 'Указан автор и издательство' },
    { id: 'books-2', text: 'Есть информация о количестве страниц' },
    { id: 'books-3', text: 'Указан год издания' },
    { id: 'books-4', text: 'Есть краткое описание содержания' },
    { id: 'books-5', text: 'Указан ISBN' },
    { id: 'books-6', text: 'Есть информация о переплете' },
  ],
  toys: [
    { id: 'toys-1', text: 'Указан возрастной диапазон' },
    { id: 'toys-2', text: 'Есть информация о материале' },
    { id: 'toys-3', text: 'Указаны размеры игрушки' },
    { id: 'toys-4', text: 'Есть информация о безопасности' },
    { id: 'toys-5', text: 'Указан тип игрушки' },
    { id: 'toys-6', text: 'Есть рекомендации по уходу' },
  ],
  other: [
    { id: 'other-1', text: 'Указаны основные характеристики' },
    { id: 'other-2', text: 'Есть информация о размерах/весе' },
    { id: 'other-3', text: 'Указан материал/состав' },
    { id: 'other-4', text: 'Есть рекомендации по использованию' },
    { id: 'other-5', text: 'Указана гарантия (если применимо)' },
    { id: 'other-6', text: 'Есть информация о сертификации' },
  ],
};

export default function Checklist() {
  const { formData, checklist, setChecklist, toggleItem } = useAppStore();

  useEffect(() => {
    // Update checklist when category changes
    if (formData.category && CHECKLIST_PRESETS[formData.category as keyof typeof CHECKLIST_PRESETS]) {
      const newChecklist = CHECKLIST_PRESETS[formData.category as keyof typeof CHECKLIST_PRESETS].map(item => ({
        ...item,
        completed: false,
      }));
      setChecklist(newChecklist);
    } else {
      setChecklist([]);
    }
  }, [formData.category, setChecklist]);

  const completedCount = checklist.filter(item => item.completed).length;
  const totalCount = checklist.length;
  const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const getCompletionStatus = () => {
    if (completionPercentage === 100) {
      return { icon: CheckCircle, color: 'text-green-600', text: 'Все требования выполнены!' };
    } else if (completionPercentage >= 80) {
      return { icon: CheckCircle, color: 'text-yellow-600', text: 'Почти готово!' };
    } else {
      return { icon: AlertCircle, color: 'text-red-600', text: 'Требует доработки' };
    }
  };

  const status = getCompletionStatus();
  const StatusIcon = status.icon;

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <span>Проверка требований Kaspi</span>
          </div>
          {totalCount > 0 && (
            <span className="text-sm font-normal text-gray-500">
              {completedCount}/{totalCount}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!formData.category ? (
          <div className="text-center py-8">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-blue-300" />
            <p className="text-gray-600 font-medium">Выберите категорию товара для отображения чек-листа</p>
          </div>
        ) : checklist.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Загрузка чек-листа...</p>
          </div>
        ) : (
          <>
            {/* Progress Indicator */}
            <div className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
              <StatusIcon className={`w-5 h-5 ${status.color}`} />
              <div className="flex-1">
                <p className={`text-sm font-medium ${status.color}`}>{status.text}</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-300 shadow-sm"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
              <span className="text-sm font-bold text-gray-700 bg-white px-2 py-1 rounded">
                {Math.round(completionPercentage)}%
              </span>
            </div>

            {/* Checklist Items */}
            <div className="space-y-2 max-h-48 lg:max-h-64 overflow-y-auto component-scrollbar">
              {checklist.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-3 hover:bg-blue-50/50 rounded-lg border border-transparent hover:border-blue-100 transition-all">
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={() => toggleItem(item.id)}
                    className="mt-0.5"
                  />
                  <label
                    className={`text-sm cursor-pointer flex-1 leading-relaxed ${
                      item.completed ? 'line-through text-gray-500' : 'text-gray-700'
                    }`}
                    onClick={() => toggleItem(item.id)}
                  >
                    {item.text}
                  </label>
                </div>
              ))}
            </div>

            {/* Tips */}
            {completionPercentage < 100 && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 leading-relaxed">
                  <strong>💡 Совет:</strong> Заполните все поля формы и отметьте выполненные требования для успешной публикации на Kaspi.
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
