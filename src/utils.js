/**
 * Math utility functions
 */

/**
 * Add two numbers
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} Sum of a and b
 */
function add(a, b) {
  return a + b;
}

/**
 * Calculate the factorial of a number
 * @param {number} n - Non-negative integer
 * @returns {number} Factorial of n
 * @throws {Error} If n is negative
 */
function factorial(n) {
  if (n < 0) {
    throw new Error('Factorial is not defined for negative numbers');
  }
  if (n === 0 || n === 1) {
    return 1;
  }
  return n * factorial(n - 1);
}

/**
 * String utility functions
 */

/**
 * Capitalize the first letter of a string
 * @param {string} str - Input string
 * @returns {string} String with first letter capitalized
 */
function capitalize(str) {
  if (!str || typeof str !== 'string') {
    return '';
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = {
  add,
  factorial,
  capitalize
};
