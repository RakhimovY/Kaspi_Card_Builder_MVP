import JSZip from 'jszip';
import { FileItem, FormData } from './store';

/**
 * Нормализует строку для использования в имени файла
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9а-яА-Я\s\-_]/g, '') // Удаляем спецсимволы
    .replace(/\s+/g, '-') // Заменяем пробелы на дефисы
    .toLowerCase()
    .trim();
}

/**
 * Генерирует SKU на основе данных формы
 */
export function generateSKU(formData: FormData): string {
  if (formData.sku.trim()) {
    return sanitizeFilename(formData.sku);
  }
  
  const brand = sanitizeFilename(formData.brand);
  const model = sanitizeFilename(formData.model);
  
  if (brand && model) {
    return `${brand}-${model}`;
  }
  
  return 'product';
}

/**
 * Конвертирует File в ArrayBuffer
 */
export async function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Конвертирует Blob в ArrayBuffer
 */
export async function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
}

/**
 * Создает CSV строку для экспорта в Kaspi
 */
export function generateCSV(files: FileItem[], formData: FormData, sku: string): string {
  const headers = [
    'sku',
    'name', 
    'brand',
    'category',
    'price',
    'qty',
    'description',
    'image1',
    'image2', 
    'image3',
    'image4',
    'image5',
    'image6',
    'image7',
    'image8',
    'attributes_notes'
  ];

  // Генерируем имена изображений
  const imageNames = files
    .filter(file => file.status === 'completed' && file.processedUrl)
    .map((_, index) => `${sku}_${index + 1}.${formData.type === 'jpeg' ? 'jpg' : 'webp'}`)
    .slice(0, 8); // Максимум 8 изображений

  // Заполняем недостающие изображения пустыми строками
  while (imageNames.length < 8) {
    imageNames.push('');
  }

  // Создаем описание с атрибутами
  const description = generateDescription(formData);
  
  // Создаем строку атрибутов
  const attributesNotes = generateAttributesNotes(formData);

  const row = [
    sku,
    formData.titleRU || formData.generatedTitle || `${formData.type} ${formData.brand} ${formData.model}`,
    formData.brand,
    formData.category,
    formData.price.toString(),
    formData.quantity.toString(),
    description,
    ...imageNames,
    attributesNotes
  ];

  // Экранируем значения для CSV
  const escapedRow = row.map(value => {
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  });

  return [headers.join(','), escapedRow.join(',')].join('\n');
}

/**
 * Генерирует описание товара с атрибутами
 */
function generateDescription(formData: FormData): string {
  let description = formData.descRU || formData.generatedDescription || formData.description || '';
  
  // Добавляем логистическую информацию
  const logisticsInfo = [];
  if (formData.weight) logisticsInfo.push(`Вес: ${formData.weight} кг`);
  if (formData.dimensions) logisticsInfo.push(`Габариты: ${formData.dimensions} см`);
  if (formData.warranty) logisticsInfo.push(`Гарантия: ${formData.warranty}`);
  if (formData.country) logisticsInfo.push(`Страна: ${formData.country}`);
  if (formData.bundle) logisticsInfo.push(`Комплектация: ${formData.bundle}`);
  
  if (logisticsInfo.length > 0) {
    description += '\n\nДополнительная информация:\n' + logisticsInfo.join('\n');
  }
  
  return description;
}

/**
 * Генерирует строку атрибутов для CSV
 */
function generateAttributesNotes(formData: FormData): string {
  const attributes = [];
  
  // Добавляем атрибуты из формы
  (formData.attributes || []).forEach(attr => {
    if (attr.key && attr.value) {
      attributes.push(`${attr.key}: ${attr.value}`);
    }
  });
  
  // Добавляем логистические атрибуты
  if (formData.cert) attributes.push(`Сертификация: ${formData.cert}`);
  if (formData.power) attributes.push(`Питание: ${formData.power}`);
  if (formData.age) attributes.push(`Возраст: ${formData.age}`);
  
  // Добавляем GTIN если есть
  if (formData.gtin) attributes.push(`GTIN: ${formData.gtin}`);
  
  return attributes.join('; ');
}

/**
 * Генерирует CSV для KZ локали (отдельный файл)
 */
export function generateCSVKZ(files: FileItem[], formData: FormData, baseSku: string): string {
  const headers = [
    'sku',
    'name',
    'brand', 
    'category',
    'price',
    'qty',
    'description',
    'image1',
    'image2', 
    'image3',
    'image4',
    'image5',
    'image6',
    'image7',
    'image8',
    'attributes_notes'
  ];

  const rows: string[] = [];
  rows.push(headers.join(','));

  // Генерируем имена изображений для основного товара
  const imageNames = files
    .filter(file => file.status === 'completed' && file.processedUrl)
    .map((_, index) => `${baseSku}_${index + 1}.${formData.type === 'jpeg' ? 'jpg' : 'webp'}`)
    .slice(0, 8);

  // Заполняем недостающие изображения пустыми строками
  while (imageNames.length < 8) {
    imageNames.push('');
  }

  // Создаем описание и атрибуты для KZ
  const description = formData.descKZ || formData.descRU || formData.generatedDescription || formData.description || '';
  const attributesNotes = generateAttributesNotes(formData);

  // Основной товар для KZ
  const mainRow = [
    baseSku,
    formData.titleKZ || formData.titleRU || formData.generatedTitle || `${formData.type} ${formData.brand} ${formData.model}`,
    formData.brand,
    formData.category,
    formData.price.toString(),
    formData.quantity.toString(),
    description,
    ...imageNames,
    attributesNotes
  ];

  rows.push(escapeCSVRow(mainRow));

  // Варианты товара для KZ
  if (formData.variants && formData.variants.length > 0) {
    (formData.variants || []).forEach((variant, index) => {
      if (variant.sku) {
        const variantRow = [
          variant.sku,
          formData.titleKZ || formData.titleRU || formData.generatedTitle || `${formData.type} ${formData.brand} ${formData.model}`,
          formData.brand,
          formData.category,
          formData.price.toString(),
          formData.quantity.toString(),
          description,
          ...imageNames, // Варианты используют те же изображения
          generateVariantAttributes(formData, variant)
        ];
        
        rows.push(escapeCSVRow(variantRow));
      }
    });
  }

  return rows.join('\n');
}

/**
 * Создает README.md с инструкциями
 */
export function generateReadme(): string {
  return `# Инструкция по загрузке товаров в Kaspi

## Содержимое архива

- **images/** - папка с обработанными изображениями товара
- **export_ru.csv** - файл с данными товара для импорта в Kaspi (русская версия)
- **export_kz.csv** - файл с данными товара для импорта в Kaspi (казахская версия, если заполнена)
- **README.md** - данная инструкция

## Как загрузить товар в Kaspi

1. **Подготовка изображений:**
   - Все изображения уже обработаны и готовы к загрузке
   - Формат: JPEG или WebP
   - Размер: оптимизирован для Kaspi
   - Фон: удален (если была включена опция)

2. **Загрузка в Kaspi:**
   - Войдите в личный кабинет продавца Kaspi
   - Перейдите в раздел "Товары" → "Добавить товар"
   - Выберите "Импорт из CSV"
   - Загрузите файл export_ru.csv (или export_kz.csv для казахского рынка)
   - Загрузите изображения из папки images/

3. **Важные ограничения Kaspi:**
   - Максимум 8 изображений на товар
   - Размер изображения: не более 10 МБ
   - Форматы: JPEG, PNG, WebP
   - Минимальный размер: 500x500 пикселей

4. **Проверка данных:**
   - Убедитесь, что все поля в CSV заполнены корректно
   - Проверьте цены и количество
   - Убедитесь, что категория выбрана правильно

## Поддержка

Если у вас возникли вопросы, обратитесь в службу поддержки Kaspi или к разработчикам данного инструмента.

---
        Создано с помощью Trade Card Builder
`;
}

/**
 * Основная функция экспорта ZIP архива
 */
export async function exportToZip(
  files: FileItem[], 
  formData: FormData,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const zip = new JSZip();
  const imagesFolder = zip.folder('images');
  
  if (!imagesFolder) {
    throw new Error('Не удалось создать папку images в архиве');
  }

  const baseSku = generateSKU(formData);
  const completedFiles = files.filter(file => 
    file.status === 'completed' && file.processedUrl
  );

  if (completedFiles.length === 0) {
    throw new Error('Нет обработанных изображений для экспорта');
  }

  // Добавляем изображения
  for (let i = 0; i < completedFiles.length; i++) {
    const file = completedFiles[i];
    const fileExtension = formData.type === 'jpeg' ? 'jpg' : 'webp';
    const fileName = `${baseSku}_${i + 1}.${fileExtension}`;
    
    try {
      // Получаем обработанное изображение
      const response = await fetch(file.processedUrl!);
      const blob = await response.blob();
      const arrayBuffer = await blobToArrayBuffer(blob);
      
      imagesFolder.file(fileName, arrayBuffer);
      
      // Обновляем прогресс
      if (onProgress) {
        const progress = ((i + 1) / completedFiles.length) * 0.7; // 70% на изображения
        onProgress(progress);
      }
    } catch (error) {
      console.error(`Ошибка при добавлении файла ${fileName}:`, error);
      throw new Error(`Не удалось добавить изображение ${fileName}`);
    }
  }

  // Генерируем CSV с поддержкой вариаций (RU версия)
  const csvContentRU = generateCSVWithVariants(completedFiles, formData, baseSku);
  zip.file('export_ru.csv', csvContentRU);

  // Генерируем CSV для KZ версии (если есть titleKZ)
  if (formData.titleKZ && formData.titleKZ.trim()) {
    const csvContentKZ = generateCSVKZ(completedFiles, formData, baseSku);
    zip.file('export_kz.csv', csvContentKZ);
  }

  // Добавляем README
  const readmeContent = generateReadme();
  zip.file('README.md', readmeContent);

  // Обновляем прогресс
  if (onProgress) {
    onProgress(0.9);
  }

  // Генерируем ZIP
  const zipBlob = await zip.generateAsync({ 
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  if (onProgress) {
    onProgress(1.0);
  }

  return zipBlob;
}

/**
 * Создает CSV с поддержкой вариаций товара
 */
function generateCSVWithVariants(files: FileItem[], formData: FormData, baseSku: string): string {
  const headers = [
    'sku',
    'name', 
    'brand',
    'category',
    'price',
    'qty',
    'description',
    'image1',
    'image2', 
    'image3',
    'image4',
    'image5',
    'image6',
    'image7',
    'image8',
    'attributes_notes'
  ];

  const rows: string[] = [];
  rows.push(headers.join(','));

  // Генерируем имена изображений для основного товара
  const imageNames = files
    .filter(file => file.status === 'completed' && file.processedUrl)
    .map((_, index) => `${baseSku}_${index + 1}.${formData.type === 'jpeg' ? 'jpg' : 'webp'}`)
    .slice(0, 8);

  // Заполняем недостающие изображения пустыми строками
  while (imageNames.length < 8) {
    imageNames.push('');
  }

  // Создаем описание и атрибуты
  const description = generateDescription(formData);
  const attributesNotes = generateAttributesNotes(formData);

  // Основной товар
  const mainRow = [
    baseSku,
    formData.titleRU || formData.generatedTitle || `${formData.type} ${formData.brand} ${formData.model}`,
    formData.brand,
    formData.category,
    formData.price.toString(),
    formData.quantity.toString(),
    description,
    ...imageNames,
    attributesNotes
  ];

  rows.push(escapeCSVRow(mainRow));

  // Варианты товара
  if (formData.variants && formData.variants.length > 0) {
    (formData.variants || []).forEach((variant, index) => {
      if (variant.sku) {
        const variantRow = [
          variant.sku,
          formData.titleRU || formData.generatedTitle || `${formData.type} ${formData.brand} ${formData.model}`,
          formData.brand,
          formData.category,
          formData.price.toString(),
          formData.quantity.toString(),
          description,
          ...imageNames, // Варианты используют те же изображения
          generateVariantAttributes(formData, variant)
        ];
        
        rows.push(escapeCSVRow(variantRow));
      }
    });
  }

  return rows.join('\n');
}

/**
 * Генерирует атрибуты для варианта товара
 */
function generateVariantAttributes(formData: FormData, variant: { sku: string; color?: string; size?: string; capacity?: string; compat?: string }): string {
  const attributes = [];
  
  // Добавляем атрибуты варианта
  if (variant.color) attributes.push(`Цвет: ${variant.color}`);
  if (variant.size) attributes.push(`Размер: ${variant.size}`);
  if (variant.capacity) attributes.push(`Объем: ${variant.capacity}`);
  if (variant.compat) attributes.push(`Совместимость: ${variant.compat}`);
  
  // Добавляем основные атрибуты
  (formData.attributes || []).forEach(attr => {
    if (attr.key && attr.value) {
      attributes.push(`${attr.key}: ${attr.value}`);
    }
  });
  
  return attributes.join('; ');
}

/**
 * Экранирует строку для CSV
 */
function escapeCSVRow(row: string[]): string {
  const escapedRow = row.map(value => {
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  });
  
  return escapedRow.join(',');
}

/**
 * Скачивает файл в браузере
 */
export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
