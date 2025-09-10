import { FormData } from './store';

/**
 * Нормализует строку для использования в тайтле
 */
export function normalizeTitleString(str: string): string {
  return str
    .trim()
    .replace(/\s+/g, ' ') // Убираем множественные пробелы
    .replace(/[^\w\s\-]/g, '') // Убираем специальные символы кроме дефиса
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Генерирует тайтл товара на основе данных формы
 */
export function generateTitle(formData: FormData): string {
  const { type, brand, model, keySpec, extraKeywords } = formData;
  
  const parts = [
    normalizeTitleString(type),
    normalizeTitleString(brand),
    normalizeTitleString(model),
    normalizeTitleString(keySpec),
    ...extraKeywords?.map(keyword => normalizeTitleString(keyword))
  ].filter(Boolean);

  return parts.join(' ');
}

/**
 * Генерирует описание товара на основе данных формы
 */
export function generateDescription(formData: FormData, locale: 'ru' | 'kz' = 'ru'): string {
  const { type, brand, model, keySpec, additionalSpecs, price, category } = formData;
  
  const benefits = generateBenefits(formData, locale);
  const characteristics = generateCharacteristics(formData, locale);
  
  return `${benefits}\n\n${characteristics}`;
}

/**
 * Генерирует секцию преимуществ
 */
function generateBenefits(formData: FormData, locale: 'ru' | 'kz'): string {
  const { type, brand, model, keySpec } = formData;
  
  const benefits = [
    `• Высокое качество ${type.toLowerCase()} от бренда ${brand}`,
    `• Современная модель ${model} с отличными характеристиками`,
    keySpec ? `• ${keySpec}` : null,
    `• Официальная гарантия и сертификация`,
    `• Быстрая доставка по всему Казахстану`
  ].filter(Boolean);

  return benefits.join('\n');
}

/**
 * Генерирует секцию характеристик
 */
function generateCharacteristics(formData: FormData, locale: 'ru' | 'kz'): string {
  const { type, brand, model, keySpec, additionalSpecs, price, category } = formData;
  
  const characteristics = [
    'Характеристики:',
    `• Тип: ${type}`,
    `• Бренд: ${brand}`,
    `• Модель: ${model}`,
    keySpec ? `• Основные характеристики: ${keySpec}` : null,
    additionalSpecs ? `• Дополнительные характеристики: ${additionalSpecs}` : null,
    `• Категория: ${getCategoryLabel(category, locale)}`,
    `• Цена: ${price.toLocaleString()} ₸`
  ].filter(Boolean);

  return characteristics.join('\n');
}

/**
 * Получает локализованное название категории
 */
function getCategoryLabel(category: string, locale: 'ru' | 'kz'): string {
  const categories: Record<string, { ru: string; kz: string }> = {
    electronics: { ru: 'Электроника', kz: 'Электроника' },
    clothing: { ru: 'Одежда', kz: 'Киім' },
    cosmetics: { ru: 'Косметика', kz: 'Косметика' },
    home: { ru: 'Дом и сад', kz: 'Үй және бақша' },
    sports: { ru: 'Спорт и отдых', kz: 'Спорт және демалыс' },
    books: { ru: 'Книги', kz: 'Кітаптар' },
    toys: { ru: 'Игрушки', kz: 'Ойыншықтар' },
    other: { ru: 'Другое', kz: 'Басқа' }
  };

  return categories[category]?.[locale] || category;
}

/**
 * Копирует текст в буфер обмена
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback для старых браузеров
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      textArea.remove();
      return result;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

