import { describe, it, expect } from 'vitest';
import { validateGTIN, isPotentialGTIN } from '../gtinValidation';

describe('GTIN Validation', () => {
  describe('validateGTIN', () => {
    it('should validate correct EAN-13 GTIN', () => {
      // Валидный EAN-13: 1234567890128
      const result = validateGTIN('1234567890128');
      expect(result.isValid).toBe(true);
      expect(result.message).toBe('GTIN корректен');
    });

    it('should validate correct UPC-A GTIN', () => {
      // Валидный UPC-A: 123456789012
      const result = validateGTIN('123456789012');
      expect(result.isValid).toBe(true);
    });

    it('should validate correct EAN-8 GTIN', () => {
      // Валидный EAN-8: 12345670
      const result = validateGTIN('12345670');
      expect(result.isValid).toBe(true);
    });

    it('should validate correct GTIN-14', () => {
      // Валидный GTIN-14: 12345678901231
      const result = validateGTIN('12345678901231');
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid length', () => {
      const result = validateGTIN('12345');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('GTIN должен содержать 8, 12, 13 или 14 цифр');
    });

    it('should reject non-numeric input', () => {
      const result = validateGTIN('abc123');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('GTIN должен содержать 8, 12, 13 или 14 цифр');
    });

    it('should reject invalid check digit', () => {
      // Невалидный GTIN с неправильной контрольной цифрой
      const result = validateGTIN('1234567890124');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Некорректная контрольная цифра GTIN');
    });

    it('should handle empty input', () => {
      const result = validateGTIN('');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Введите GTIN');
    });

    it('should sanitize input with spaces and dashes', () => {
      const result = validateGTIN('123-456-789-012-8');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedGTIN).toBe('1234567890128');
    });
  });

  describe('isPotentialGTIN', () => {
    it('should return true for valid length GTIN', () => {
      expect(isPotentialGTIN('1234567890128')).toBe(true);
      expect(isPotentialGTIN('123456789012')).toBe(true);
      expect(isPotentialGTIN('12345670')).toBe(true);
      expect(isPotentialGTIN('12345678901231')).toBe(true);
    });

    it('should return false for invalid length', () => {
      expect(isPotentialGTIN('12345')).toBe(false);
      expect(isPotentialGTIN('123456789012345')).toBe(false);
    });

    it('should return false for non-numeric input', () => {
      expect(isPotentialGTIN('abc123')).toBe(false);
    });

    it('should return false for empty input', () => {
      expect(isPotentialGTIN('')).toBe(false);
    });
  });
});
