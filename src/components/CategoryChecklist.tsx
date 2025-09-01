'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { CategoryChecklist as CategoryChecklistType, ChecklistItem } from '@/lib/categoryChecklists';
import { useTranslations } from '@/lib/useTranslations';

interface CategoryChecklistProps {
  categoryId: string;
  checklist: CategoryChecklistType;
  checkedItems: string[];
  onItemToggle: (itemId: string, checked: boolean) => void;
}

export function CategoryChecklist({
  categoryId,
  checklist,
  checkedItems,
  onItemToggle,
}: CategoryChecklistProps) {
  const { t } = useTranslations();
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [requiredItemsCompleted, setRequiredItemsCompleted] = useState(0);
  const [totalRequiredItems, setTotalRequiredItems] = useState(0);

  useEffect(() => {
    const requiredItems = checklist.items.filter(item => item.required);
    const completedRequiredItems = requiredItems.filter(item => 
      checkedItems.includes(item.id)
    ).length;
    
    const totalItems = checklist.items.length;
    const completedItems = checkedItems.length;
    
    setRequiredItemsCompleted(completedRequiredItems);
    setTotalRequiredItems(requiredItems.length);
    setCompletionPercentage(Math.round((completedItems / totalItems) * 100));
  }, [checklist.items, checkedItems]);

  const isFullyCompleted = checkedItems.length === checklist.items.length;
  const areRequiredItemsCompleted = requiredItemsCompleted === totalRequiredItems;

  const getItemIcon = (item: ChecklistItem) => {
    const isChecked = checkedItems.includes(item.id);
    const isRequired = item.required;
    
    if (isChecked) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    
    if (isRequired) {
      return <AlertCircle className="h-4 w-4 text-amber-500" />;
    }
    
    return <Circle className="h-4 w-4 text-gray-400" />;
  };

  const getCompletionBadge = () => {
    if (isFullyCompleted) {
      return (
        <Badge variant="default" className="bg-green-600 hover:bg-green-700">
          <CheckCircle className="h-3 w-3 mr-1" />
          {t('studio.checklist.completed')}
        </Badge>
      );
    }
    
    if (areRequiredItemsCompleted) {
      return (
        <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200">
          <AlertCircle className="h-3 w-3 mr-1" />
          {t('studio.checklist.required_completed')}
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="text-gray-600">
        {completionPercentage}% {t('studio.checklist.completed')}
      </Badge>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {t(`studio.checklist.categories.${categoryId}`)}
          </CardTitle>
          {getCompletionBadge()}
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>{t('studio.checklist.progress')}</span>
            <span>{checkedItems.length} / {checklist.items.length}</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>
        
        {totalRequiredItems > 0 && (
          <div className="text-sm text-gray-600">
            {t('studio.checklist.required_items')}: {requiredItemsCompleted} / {totalRequiredItems}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {checklist.items.map((item) => {
          const isChecked = checkedItems.includes(item.id);
          const isRequired = item.required;
          
          return (
            <div
              key={item.id}
              className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                isChecked 
                  ? 'bg-green-50 border-green-200' 
                  : isRequired 
                    ? 'bg-amber-50 border-amber-200' 
                    : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-2 mt-0.5">
                <Checkbox
                  id={item.id}
                  checked={isChecked}
                  onCheckedChange={(checked) => onItemToggle(item.id, checked as boolean)}
                  className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                />
                {getItemIcon(item)}
              </div>
              
              <div className="flex-1 min-w-0">
                <label
                  htmlFor={item.id}
                  className={`text-sm font-medium cursor-pointer ${
                    isChecked ? 'text-green-800' : isRequired ? 'text-amber-800' : 'text-gray-800'
                  }`}
                >
                  {t(`studio.checklist.items.${item.id}.label`)}
                  {isRequired && (
                    <span className="ml-1 text-red-500">*</span>
                  )}
                </label>
                
                {item.description && (
                  <p className={`text-xs mt-1 ${
                    isChecked ? 'text-green-600' : isRequired ? 'text-amber-600' : 'text-gray-500'
                  }`}>
                    {t(`studio.checklist.items.${item.id}.description`)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
        
        {isFullyCompleted && (
          <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                {t('studio.checklist.all_completed')}
              </span>
            </div>
            <p className="text-xs text-green-600 mt-1">
              {t('studio.checklist.ready_for_export')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
