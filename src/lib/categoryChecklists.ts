/**
 * Справочник чек-листов для категорий товаров
 * Используется для валидации готовности товара к загрузке в Kaspi
 */

export interface ChecklistItem {
  id: string;
  label: string;
  description?: string;
  required?: boolean;
}

export interface CategoryChecklist {
  id: string;
  name: string;
  items: ChecklistItem[];
}

export const categoryChecklists: CategoryChecklist[] = [
  {
    id: 'clothing',
    name: 'Одежда',
    items: [
      {
        id: 'material_composition',
        label: 'Состав/Материал указан',
        description: 'Указан точный состав ткани (например: 100% хлопок, 80% полиэстер, 20% эластан)',
        required: true,
      },
      {
        id: 'size_chart',
        label: 'Размерная сетка',
        description: 'Приложена таблица размеров с измерениями в см',
        required: true,
      },
      {
        id: 'care_instructions',
        label: 'Инструкции по уходу',
        description: 'Указаны рекомендации по стирке, сушке и глажке',
        required: true,
      },
      {
        id: 'color_variants',
        label: 'Варианты цветов',
        description: 'Перечислены все доступные цвета товара',
        required: false,
      },
      {
        id: 'brand_info',
        label: 'Информация о бренде',
        description: 'Указан производитель и страна производства',
        required: true,
      },
      {
        id: 'model_description',
        label: 'Описание модели',
        description: 'Детальное описание фасона, особенностей кроя',
        required: true,
      },
    ],
  },
  {
    id: 'electronics',
    name: 'Электроника',
    items: [
      {
        id: 'technical_specs',
        label: 'Основные технические параметры',
        description: 'Указаны ключевые характеристики (мощность, емкость, размеры экрана и т.д.)',
        required: true,
      },
      {
        id: 'compatibility',
        label: 'Совместимость',
        description: 'Указаны совместимые устройства, операционные системы',
        required: true,
      },
      {
        id: 'warranty_info',
        label: 'Гарантийные обязательства',
        description: 'Указан срок гарантии и условия обслуживания',
        required: true,
      },
      {
        id: 'power_requirements',
        label: 'Требования к питанию',
        description: 'Напряжение, потребляемая мощность, тип разъема',
        required: true,
      },
      {
        id: 'package_contents',
        label: 'Комплектация',
        description: 'Полный список того, что входит в упаковку',
        required: true,
      },
      {
        id: 'certifications',
        label: 'Сертификаты и стандарты',
        description: 'Указаны сертификаты качества, соответствие стандартам',
        required: false,
      },
    ],
  },
  {
    id: 'cosmetics',
    name: 'Косметика',
    items: [
      {
        id: 'ingredients_list',
        label: 'Состав продукта',
        description: 'Полный список ингредиентов в порядке убывания концентрации',
        required: true,
      },
      {
        id: 'skin_type',
        label: 'Тип кожи',
        description: 'Для какого типа кожи предназначен продукт',
        required: true,
      },
      {
        id: 'usage_instructions',
        label: 'Инструкция по применению',
        description: 'Как правильно использовать продукт, частота применения',
        required: true,
      },
      {
        id: 'shelf_life',
        label: 'Срок годности',
        description: 'Указан срок годности и условия хранения',
        required: true,
      },
      {
        id: 'volume_weight',
        label: 'Объем/Вес',
        description: 'Точный объем в мл или вес в граммах',
        required: true,
      },
      {
        id: 'allergen_info',
        label: 'Информация об аллергенах',
        description: 'Предупреждения о возможных аллергических реакциях',
        required: false,
      },
      {
        id: 'cruelty_free',
        label: 'Не тестируется на животных',
        description: 'Указано, что продукт не тестируется на животных',
        required: false,
      },
    ],
  },
];

/**
 * Получить чек-лист по ID категории
 */
export function getChecklistByCategoryId(categoryId: string): CategoryChecklist | undefined {
  return categoryChecklists.find(checklist => checklist.id === categoryId);
}

/**
 * Получить все доступные категории
 */
export function getAllCategories(): CategoryChecklist[] {
  return categoryChecklists;
}
