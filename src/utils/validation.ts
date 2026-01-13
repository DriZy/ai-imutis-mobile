import { REGEX_PATTERNS } from './constants';

// Email Validation
export const validateEmail = (email: string): boolean => {
  return REGEX_PATTERNS.EMAIL.test(email);
};

// Phone Number Validation
export const validatePhoneNumber = (phone: string): boolean => {
  return REGEX_PATTERNS.PHONE.test(phone);
};

// Password Validation
// At least 8 characters, one uppercase, one lowercase, one number
export const validatePassword = (password: string): boolean => {
  return REGEX_PATTERNS.PASSWORD.test(password);
};

// Name Validation
export const validateName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 50;
};

// OTP Code Validation
export const validateOTPCode = (code: string): boolean => {
  return /^\d{6}$/.test(code);
};

// Price Validation
export const validatePrice = (price: number): boolean => {
  return !isNaN(price) && price > 0;
};

// Coordinates Validation
export const validateCoordinates = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

// Validation Error Messages
export const getValidationError = (field: string, value: any): string | null => {
  switch (field) {
    case 'email':
      if (!validateEmail(value)) {
        return 'Please enter a valid email address';
      }
      break;
    case 'phone':
      if (!validatePhoneNumber(value)) {
        return 'Please enter a valid phone number';
      }
      break;
    case 'password':
      if (!validatePassword(value)) {
        return 'Password must be at least 8 characters with uppercase, lowercase, and number';
      }
      break;
    case 'name':
      if (!validateName(value)) {
        return 'Name must be between 2 and 50 characters';
      }
      break;
    case 'otp':
      if (!validateOTPCode(value)) {
        return 'Please enter a valid 6-digit code';
      }
      break;
    default:
      return null;
  }
  return null;
};
