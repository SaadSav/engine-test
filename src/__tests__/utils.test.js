const { describe, test, expect } = require('@jest/globals');
const { add, factorial, capitalize } = require('../utils');

describe('Math utilities', () => {
  describe('add', () => {
    test('should add two positive numbers', () => {
      expect(add(2, 3)).toBe(5);
    });

    test('should add negative numbers', () => {
      expect(add(-5, -3)).toBe(-8);
    });

    test('should add positive and negative numbers', () => {
      expect(add(10, -3)).toBe(7);
    });

    test('should handle zero', () => {
      expect(add(0, 5)).toBe(5);
      expect(add(5, 0)).toBe(5);
    });

    test('should handle decimal numbers', () => {
      expect(add(1.5, 2.5)).toBe(4);
    });
  });

  describe('factorial', () => {
    test('should calculate factorial of 0', () => {
      expect(factorial(0)).toBe(1);
    });

    test('should calculate factorial of 1', () => {
      expect(factorial(1)).toBe(1);
    });

    test('should calculate factorial of positive numbers', () => {
      expect(factorial(5)).toBe(120);
      expect(factorial(3)).toBe(6);
      expect(factorial(4)).toBe(24);
    });

    test('should throw error for negative numbers', () => {
      expect(() => factorial(-1)).toThrow('Factorial is not defined for negative numbers');
      expect(() => factorial(-5)).toThrow(Error);
    });
  });
});

describe('String utilities', () => {
  describe('capitalize', () => {
    test('should capitalize first letter of lowercase string', () => {
      expect(capitalize('hello')).toBe('Hello');
    });

    test('should handle already capitalized string', () => {
      expect(capitalize('Hello')).toBe('Hello');
    });

    test('should handle single character', () => {
      expect(capitalize('a')).toBe('A');
    });

    test('should handle empty string', () => {
      expect(capitalize('')).toBe('');
    });

    test('should handle null or undefined', () => {
      expect(capitalize(null)).toBe('');
      expect(capitalize(undefined)).toBe('');
    });

    test('should handle non-string input', () => {
      expect(capitalize(123)).toBe('');
      expect(capitalize({})).toBe('');
    });

    test('should only capitalize first letter', () => {
      expect(capitalize('hello world')).toBe('Hello world');
    });
  });
});
