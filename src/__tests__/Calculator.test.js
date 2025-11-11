const { describe, test, expect, beforeEach, jest } = require('@jest/globals');
const Calculator = require('../Calculator');

describe('Calculator', () => {
  let calculator;

  beforeEach(() => {
    calculator = new Calculator();
  });

  describe('initialization', () => {
    test('should initialize with result of 0', () => {
      expect(calculator.getResult()).toBe(0);
    });

    test('should initialize with empty history', () => {
      expect(calculator.getHistory()).toEqual([]);
    });
  });

  describe('add', () => {
    test('should add positive numbers', () => {
      calculator.add(5);
      expect(calculator.getResult()).toBe(5);
    });

    test('should add multiple numbers', () => {
      calculator.add(5).add(3);
      expect(calculator.getResult()).toBe(8);
    });

    test('should add negative numbers', () => {
      calculator.add(-5);
      expect(calculator.getResult()).toBe(-5);
    });

    test('should record operation in history', () => {
      calculator.add(5);
      expect(calculator.getHistory()).toContain('add 5');
    });

    test('should support method chaining', () => {
      const result = calculator.add(5).add(3).getResult();
      expect(result).toBe(8);
    });
  });

  describe('subtract', () => {
    test('should subtract numbers', () => {
      calculator.add(10).subtract(3);
      expect(calculator.getResult()).toBe(7);
    });

    test('should handle subtracting larger number', () => {
      calculator.add(5).subtract(10);
      expect(calculator.getResult()).toBe(-5);
    });

    test('should record operation in history', () => {
      calculator.subtract(3);
      expect(calculator.getHistory()).toContain('subtract 3');
    });

    test('should support method chaining', () => {
      const result = calculator.add(10).subtract(3).getResult();
      expect(result).toBe(7);
    });
  });

  describe('multiply', () => {
    test('should multiply numbers', () => {
      calculator.add(5).multiply(3);
      expect(calculator.getResult()).toBe(15);
    });

    test('should handle multiplication by zero', () => {
      calculator.add(5).multiply(0);
      expect(calculator.getResult()).toBe(0);
    });

    test('should handle negative multiplication', () => {
      calculator.add(5).multiply(-2);
      expect(calculator.getResult()).toBe(-10);
    });

    test('should record operation in history', () => {
      calculator.multiply(3);
      expect(calculator.getHistory()).toContain('multiply 3');
    });

    test('should support method chaining', () => {
      const result = calculator.add(5).multiply(3).getResult();
      expect(result).toBe(15);
    });
  });

  describe('divide', () => {
    test('should divide numbers', () => {
      calculator.add(10).divide(2);
      expect(calculator.getResult()).toBe(5);
    });

    test('should handle decimal results', () => {
      calculator.add(10).divide(3);
      expect(calculator.getResult()).toBeCloseTo(3.333, 2);
    });

    test('should throw error when dividing by zero', () => {
      expect(() => calculator.divide(0)).toThrow('Cannot divide by zero');
    });

    test('should record operation in history', () => {
      calculator.add(10).divide(2);
      expect(calculator.getHistory()).toContain('divide 2');
    });

    test('should support method chaining', () => {
      const result = calculator.add(10).divide(2).getResult();
      expect(result).toBe(5);
    });
  });

  describe('getResult', () => {
    test('should return current result', () => {
      calculator.add(5).multiply(2).subtract(3);
      expect(calculator.getResult()).toBe(7);
    });
  });

  describe('getHistory', () => {
    test('should return copy of history array', () => {
      calculator.add(5).subtract(2);
      const history = calculator.getHistory();
      history.push('fake operation');
      expect(calculator.getHistory()).toEqual(['add 5', 'subtract 2']);
    });

    test('should track all operations in order', () => {
      calculator
        .add(10)
        .subtract(3)
        .multiply(2)
        .divide(2);
      expect(calculator.getHistory()).toEqual([
        'add 10',
        'subtract 3',
        'multiply 2',
        'divide 2'
      ]);
    });
  });

  describe('reset', () => {
    test('should reset result to 0', () => {
      calculator.add(10).multiply(5);
      calculator.reset();
      expect(calculator.getResult()).toBe(0);
    });

    test('should clear history', () => {
      calculator.add(10).subtract(5);
      calculator.reset();
      expect(calculator.getHistory()).toEqual([]);
    });
  });

  describe('complex operations', () => {
    test('should handle complex calculation chain', () => {
      const result = calculator
        .add(100)
        .subtract(20)
        .multiply(2)
        .divide(4)
        .add(10)
        .getResult();
      expect(result).toBe(50);
    });

    test('should maintain accurate history for complex operations', () => {
      calculator
        .add(100)
        .subtract(20)
        .multiply(2)
        .divide(4);
      const history = calculator.getHistory();
      expect(history.length).toBe(4);
      expect(history[0]).toBe('add 100');
      expect(history[3]).toBe('divide 4');
    });
  });

  describe('edge cases', () => {
    test('should handle operations on negative results', () => {
      calculator.subtract(10).multiply(2);
      expect(calculator.getResult()).toBe(-20);
    });

    test('should handle multiple resets', () => {
      calculator.add(5);
      calculator.reset();
      calculator.add(10);
      calculator.reset();
      expect(calculator.getResult()).toBe(0);
      expect(calculator.getHistory()).toEqual([]);
    });
  });

  describe('mocking example', () => {
    test('should demonstrate mocking getHistory', () => {
      // Mock the getHistory method
      const mockHistory = ['mocked operation'];
      calculator.getHistory = jest.fn().mockReturnValue(mockHistory);

      expect(calculator.getHistory()).toEqual(mockHistory);
      expect(calculator.getHistory).toHaveBeenCalled();
    });

    test('should demonstrate spying on methods', () => {
      const addSpy = jest.spyOn(calculator, 'add');

      calculator.add(5).add(3);

      expect(addSpy).toHaveBeenCalledTimes(2);
      expect(addSpy).toHaveBeenCalledWith(5);
      expect(addSpy).toHaveBeenCalledWith(3);

      addSpy.mockRestore();
    });
  });
});
