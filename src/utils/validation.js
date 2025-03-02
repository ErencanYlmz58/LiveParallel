// Email validation regex
const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if email is valid
 */
export const isValidEmail = (email) => {
  return EMAIL_REGEX.test(email);
};

/**
 * Validates required fields
 * @param {string} value - Value to validate
 * @returns {boolean} - True if value is not empty
 */
export const isRequired = (value) => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

/**
 * Validates minimum length
 * @param {string} value - Value to validate
 * @param {number} minLength - Minimum length required
 * @returns {boolean} - True if value meets minimum length
 */
export const minLength = (value, minLength) => {
  if (typeof value !== 'string') return false;
  return value.length >= minLength;
};

/**
 * Validates maximum length
 * @param {string} value - Value to validate
 * @param {number} maxLength - Maximum length allowed
 * @returns {boolean} - True if value meets maximum length
 */
export const maxLength = (value, maxLength) => {
  if (typeof value !== 'string') return false;
  return value.length <= maxLength;
};

/**
 * Validates that two fields match
 * @param {string} value - Primary value
 * @param {string} confirmValue - Value to compare with
 * @returns {boolean} - True if values match
 */
export const matches = (value, confirmValue) => {
  return value === confirmValue;
};

/**
 * Validates login form fields
 * @param {Object} values - Form values object
 * @returns {Object} - Object with error messages for invalid fields
 */
export const validateLoginForm = (values) => {
  const errors = {};

  if (!isRequired(values.email)) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Invalid email format';
  }

  if (!isRequired(values.password)) {
    errors.password = 'Password is required';
  }

  return errors;
};

/**
 * Validates registration form fields
 * @param {Object} values - Form values object
 * @returns {Object} - Object with error messages for invalid fields
 */
export const validateRegisterForm = (values) => {
  const errors = {};

  if (!isRequired(values.displayName)) {
    errors.displayName = 'Name is required';
  } else if (!minLength(values.displayName, 2)) {
    errors.displayName = 'Name must be at least 2 characters';
  } else if (!maxLength(values.displayName, 50)) {
    errors.displayName = 'Name cannot exceed 50 characters';
  }

  if (!isRequired(values.email)) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Invalid email format';
  }

  if (!isRequired(values.password)) {
    errors.password = 'Password is required';
  } else if (!minLength(values.password, 6)) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (!isRequired(values.confirmPassword)) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (!matches(values.password, values.confirmPassword)) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
};

/**
 * Validates scenario form fields
 * @param {Object} values - Form values object
 * @returns {Object} - Object with error messages for invalid fields
 */
export const validateScenarioForm = (values) => {
  const errors = {};

  if (!isRequired(values.title)) {
    errors.title = 'Title is required';
  } else if (!minLength(values.title, 3)) {
    errors.title = 'Title must be at least 3 characters';
  } else if (!maxLength(values.title, 100)) {
    errors.title = 'Title cannot exceed 100 characters';
  }

  if (!isRequired(values.description)) {
    errors.description = 'Description is required';
  } else if (!minLength(values.description, 10)) {
    errors.description = 'Description must be at least 10 characters';
  }

  if (!isRequired(values.choice)) {
    errors.choice = 'Please enter the choice you want to explore';
  }

  return errors;
};

export default {
  isValidEmail,
  isRequired,
  minLength,
  maxLength,
  matches,
  validateLoginForm,
  validateRegisterForm,
  validateScenarioForm
};