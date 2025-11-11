/**
 * Calculator class to demonstrate object testing patterns
 */
class Calculator {
  constructor() {
    this.result = 0;
    this.history = [];
  }

  /**
   * Add a number to the current result
   * @param {number} value - Number to add
   * @returns {Calculator} Returns this for chaining
   */
  add(value) {
    this.result += value;
    this.history.push(`add ${value}`);
    return this;
  }

  /**
   * Subtract a number from the current result
   * @param {number} value - Number to subtract
   * @returns {Calculator} Returns this for chaining
   */
  subtract(value) {
    this.result -= value;
    this.history.push(`subtract ${value}`);
    return this;
  }

  /**
   * Multiply the current result by a number
   * @param {number} value - Number to multiply by
   * @returns {Calculator} Returns this for chaining
   */
  multiply(value) {
    this.result *= value;
    this.history.push(`multiply ${value}`);
    return this;
  }

  /**
   * Divide the current result by a number
   * @param {number} value - Number to divide by
   * @returns {Calculator} Returns this for chaining
   * @throws {Error} If attempting to divide by zero
   */
  divide(value) {
    if (value === 0) {
      throw new Error('Cannot divide by zero');
    }
    this.result /= value;
    this.history.push(`divide ${value}`);
    return this;
  }

  /**
   * Get the current result
   * @returns {number} Current result
   */
  getResult() {
    return this.result;
  }

  /**
   * Get the operation history
   * @returns {Array<string>} Array of operation strings
   */
  getHistory() {
    return [...this.history];
  }

  /**
   * Reset the calculator to initial state
   */
  reset() {
    this.result = 0;
    this.history = [];
  }
}

module.exports = Calculator;
