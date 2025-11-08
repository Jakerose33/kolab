// Test ID constants to prevent string duplication and ensure consistency
export const TEST_IDS = {
  // Booking
  BOOKING_CTA: 'booking-request',
  BOOKING_MODAL: 'booking-modal',
  BOOKING_FORM: 'booking-form',
  PAYMENT_FORM: 'payment-form',
  
  // Events
  EVENT_CARD: 'event-card',
  EVENT_DETAIL: 'event-detail',
  EVENT_STATUS: 'event-status',
  
  // Auth
  AUTH_SIGNIN_EMAIL: 'signin-email',
  AUTH_SIGNIN_PASSWORD: 'signin-password',
  AUTH_SIGNIN_SUBMIT: 'signin-submit',
  AUTH_SIGNUP_EMAIL: 'signup-email',
  AUTH_SIGNUP_PASSWORD: 'signup-password',
  AUTH_SIGNUP_SUBMIT: 'signup-submit',
  
  // Navigation
  MAIN_NAV: 'main-navigation',
  USER_MENU: 'user-menu',
  
  // Payment
  PAYMENT_CARD_NUMBER: 'payment-card-number',
  PAYMENT_EXPIRY: 'payment-expiry',
  PAYMENT_CVV: 'payment-cvv',
  PAYMENT_SUBMIT: 'payment-submit',
  PAYMENT_SUCCESS: 'payment-success',
  PAYMENT_ERROR: 'payment-error',
} as const;

export type TestId = typeof TEST_IDS[keyof typeof TEST_IDS];