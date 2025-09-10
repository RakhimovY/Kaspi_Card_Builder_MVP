'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/lib/store';
import { useTranslations } from '@/lib/useTranslations';
import { 
  FileText, 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  Eye,
  EyeOff,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Wand2
} from 'lucide-react';
import { toast } from 'sonner';
import TitleDescriptionGeneratorInline from './TitleDescriptionGeneratorInline';
import ProductVariants from './ProductVariants';
import ProductAttributes from './ProductAttributes';
import ProductLogistics from './ProductLogistics';

export default function ProductInfoStep() {
  const { t } = useTranslations();
  const { 
    formData, 
    updateFormData, 
    setCurrentStep, 
    resetStudio,
    resetFormData
  } = useAppStore();
  
  const [showGenerator, setShowGenerator] = useState(false);
  const [showVariants, setShowVariants] = useState(false);
  const [showAttributes, setShowAttributes] = useState(false);
  const [showLogistics, setShowLogistics] = useState(false);

  // Автоматически генерируем заголовок и описание при переходе на этот этап
  useEffect(() => {
    if (formData.brand && formData.type && formData.model && (!formData.titleRU || !formData.descRU)) {
      // Автоматически запускаем генерацию
      setTimeout(() => {
        setShowGenerator(true);
      }, 500);
    }
  }, []);

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    updateFormData({ [field]: value });
  };

  const canProceed = formData.brand && formData.type && formData.model && 
                   formData.titleRU && formData.descRU && 
                   formData.price && formData.quantity;

  const handleNext = () => {
    if (!canProceed) {
      toast.error('Заполните все обязательные поля');
      return;
    }
    setCurrentStep('photo-editor');
  };

  const handleReset = () => {
    if (confirm('Сбросить все данные и вернуться к началу?')) {
      resetStudio();
      toast.success('Данные сброшены');
    }
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-gray-200 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Проверка и редактирование информации</span>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Сбросить
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Основные данные */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Основные данные
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Бренд *
              </label>
              <Input
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                placeholder="Например: Apple"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Тип товара *
              </label>
              <Input
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                placeholder="Например: Смартфон"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Модель *
              </label>
              <Input
                value={formData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                placeholder="Например: iPhone 15"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Категория *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Выберите категорию</option>
                <option value="electronics">Электроника</option>
                <option value="clothing">Одежда</option>
                <option value="cosmetics">Косметика</option>
                <option value="home">Дом и сад</option>
                <option value="sports">Спорт</option>
                <option value="books">Книги</option>
                <option value="toys">Игрушки</option>
                <option value="other">Другое</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Цена *
              </label>
              <Input
                type="text"
                value={formData.price || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^[\d.,]+$/.test(value)) {
                    handleInputChange('price', value);
                  }
                }}
                placeholder="Например: 150000"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Количество *
              </label>
              <Input
                type="text"
                value={formData.quantity || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d+$/.test(value)) {
                    handleInputChange('quantity', value);
                  }
                }}
                placeholder="Например: 10"
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Описание */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Описание
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowGenerator(!showGenerator)}
              className="text-blue-600 hover:text-blue-700"
            >
              {showGenerator ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
              {showGenerator ? 'Скрыть' : 'Показать'} генератор
            </Button>
          </div>

          {showGenerator && (
            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
              <TitleDescriptionGeneratorInline />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Заголовок (RU) *
              </label>
              <Textarea
                value={formData.titleRU}
                onChange={(e) => handleInputChange('titleRU', e.target.value)}
                placeholder="Краткое описание товара на русском"
                rows={2}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Заголовок (KZ) *
              </label>
              <Textarea
                value={formData.titleKZ}
                onChange={(e) => handleInputChange('titleKZ', e.target.value)}
                placeholder="Краткое описание товара на казахском"
                rows={2}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание (RU) *
              </label>
              <Textarea
                value={formData.descRU}
                onChange={(e) => handleInputChange('descRU', e.target.value)}
                placeholder="Подробное описание товара на русском"
                rows={4}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание (KZ) *
              </label>
              <Textarea
                value={formData.descKZ}
                onChange={(e) => handleInputChange('descKZ', e.target.value)}
                placeholder="Подробное описание товара на казахском"
                rows={4}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Дополнительные секции */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            Дополнительная информация (опционально)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={() => setShowVariants(!showVariants)}
              className={`h-12 ${showVariants ? 'border-blue-500 bg-blue-50' : ''}`}
            >
              <Plus className="w-4 h-4 mr-2" />
              Вариации
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowAttributes(!showAttributes)}
              className={`h-12 ${showAttributes ? 'border-blue-500 bg-blue-50' : ''}`}
            >
              <Plus className="w-4 h-4 mr-2" />
              Атрибуты
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowLogistics(!showLogistics)}
              className={`h-12 ${showLogistics ? 'border-blue-500 bg-blue-50' : ''}`}
            >
              <Plus className="w-4 h-4 mr-2" />
              Логистика
            </Button>
          </div>

          {showVariants && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <ProductVariants />
            </div>
          )}

          {showAttributes && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <ProductAttributes />
            </div>
          )}

          {showLogistics && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <ProductLogistics />
            </div>
          )}
        </div>

        {/* Навигация */}
        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => {
              resetFormData(); // Очищаем все данные формы
              setCurrentStep('magic-fill');
            }}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад к Magic Fill
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!canProceed}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 flex items-center gap-2"
          >
            Продолжить к фото
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Статус */}
        {!canProceed && (
          <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            <span>Заполните все обязательные поля для продолжения</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
