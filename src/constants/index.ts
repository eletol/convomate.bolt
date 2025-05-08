// Firebase Collections
export const COLLECTIONS = {
  USERS: 'users',
  MESSAGES: 'messages',
  CONVERSATIONS: 'conversations',
} as const;

// Storage Paths
export const STORAGE_PATHS = {
  USER_AVATARS: 'avatars',
  MESSAGE_ATTACHMENTS: 'attachments',
} as const;

// Authentication
export const AUTH = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 20,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/,
} as const;

// API Endpoints
export const API = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  VERSION: 'v1',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  AUTH: {
    INVALID_EMAIL: 'Please enter a valid email address',
    INVALID_PASSWORD: 'Password must be at least 6 characters long',
    WEAK_PASSWORD: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    EMAIL_IN_USE: 'This email is already in use',
    USER_NOT_FOUND: 'No user found with this email',
    WRONG_PASSWORD: 'Incorrect password',
  },
  GENERAL: {
    REQUIRED_FIELD: 'This field is required',
    NETWORK_ERROR: 'Network error. Please try again',
    UNKNOWN_ERROR: 'An unknown error occurred',
  },
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  AUTH: {
    SIGNUP_SUCCESS: 'Account created successfully',
    LOGIN_SUCCESS: 'Logged in successfully',
    LOGOUT_SUCCESS: 'Logged out successfully',
    PASSWORD_RESET_SENT: 'Password reset email sent',
  },
} as const; 