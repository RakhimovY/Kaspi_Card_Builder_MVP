/**
 * GTIN Validation Utility
 * 
 * Валидация GTIN (Global Trade Item Number) с проверкой:
 * - Длины (8, 12, 13, 14 цифр)
 * - Формата (только цифры)
 * - Контрольной цифры (алгоритм GS1 mod 10)
 */

export interface GTINValidationResult {
  isValid: boolean;
  message: string;
  sanitizedGTIN?: string;
}

/**
 * Проверяет корректность контрольной цифры GTIN
 * Использует алгоритм GS1 mod 10
 */
function isValidCheckDigit(gtin: string): boolean {
  const digits = gtin.split('').map(Number);
  const checkDigit = digits.pop();
  
  if (checkDigit === undefined) {
    return false;
  }

  let sum = 0;
  
  // Определяем коэффициент умножения в зависимости от длины GTIN
  // Для четной длины: [3, 1], для нечетной: [1, 3]
  const multiplier = gtin.length % 2 === 0 ? [3, 1] : [1, 3];

  // Вычисляем сумму произведений цифр на соответствующие коэффициенты
  for (let i = 0; i < digits.length; i++) {
    sum += digits[i] * multiplier[i % 2];
  }

  // Вычисляем контрольную цифру
  const calculatedCheckDigit = (10 - (sum % 10)) % 10;

  return checkDigit === calculatedCheckDigit;
}

/**
 * Валидирует GTIN
 * @param gtin - строка GTIN для валидации
 * @returns результат валидации с сообщением
 */
export function validateGTIN(gtin: string): GTINValidationResult {
  // Удаляем все нецифровые символы (пробелы, дефисы и т.д.)
  const sanitizedGTIN = gtin.replace(/\D/g, '');

  // Если после очистки строка пустая
  if (!sanitizedGTIN) {
    return {
      isValid: false,
      message: 'Введите GTIN'
    };
  }

  // Проверяем, что все символы - цифры
  if (!/^\d+$/.test(sanitizedGTIN)) {
    return {
      isValid: false,
      message: 'GTIN должен содержать только цифры'
    };
  }

  // Проверяем длину GTIN
  const validLengths = [8, 12, 13, 14];
  if (!validLengths.includes(sanitizedGTIN.length)) {
    return {
      isValid: false,
      message: `GTIN должен содержать 8, 12, 13 или 14 цифр (введено: ${sanitizedGTIN.length})`
    };
  }

  // Проверяем контрольную цифру
  if (!isValidCheckDigit(sanitizedGTIN)) {
    return {
      isValid: false,
      message: 'Некорректная контрольная цифра GTIN'
    };
  }

  return {
    isValid: true,
    message: 'GTIN корректен',
    sanitizedGTIN
  };
}

/**
 * Проверяет, является ли строка потенциально валидным GTIN
 * (без проверки контрольной цифры, только длина и формат)
 */
export function isPotentialGTIN(gtin: string): boolean {
  const sanitizedGTIN = gtin.replace(/\D/g, '');
  const validLengths = [8, 12, 13, 14];
  
  return sanitizedGTIN.length > 0 && 
         validLengths.includes(sanitizedGTIN.length) && 
         /^\d+$/.test(sanitizedGTIN);
}
