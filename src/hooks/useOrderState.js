import { useReducer, useCallback } from 'react';

/**
 * Order phase state machine.
 * Replaces the collection of independent boolean states
 * (isBotThinking, isWaitingForOTP, isWaitingForPhone, isOtpModalOpen)
 * with a single phase enum and derived boolean getters.
 */

export const ORDER_PHASES = {
  IDLE: 'idle',
  THINKING: 'thinking',
  CLARIFYING: 'clarifying',
  SEARCHING: 'searching',
  AWAITING_PRODUCT: 'awaiting_product',
  AWAITING_PHONE: 'awaiting_phone',
  AWAITING_OTP: 'awaiting_otp',
  AWAITING_ADDRESS: 'awaiting_address',
  AWAITING_CONFIRMATION: 'awaiting_confirmation',
  ADDING_TO_CART: 'adding_to_cart',
  QUEUE_SHOPPING: 'queue_shopping',
  ASK_MORE_OR_CHECKOUT: 'ask_more_or_checkout',
  CHECKOUT: 'checkout',
  SUCCESS: 'success',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
};

const initialState = {
  phase: ORDER_PHASES.IDLE,
  defaultPhone: '',
  otpPrompt: '',
  isOtpModalOpen: false,
  otpLength: 6,
  confirmationData: null,
  // Multi-item cart state
  cartSummary: [],
  queueProgress: null, // { currentIndex, totalItems, currentItem }
  isAddMoreOrCheckoutOpen: false,
};

function orderReducer(state, event) {
  switch (event.type) {
    case 'USER_SENT_MESSAGE':
      return {
        ...state,
        phase: ORDER_PHASES.THINKING,
        isOtpModalOpen: false,
      };

    case 'BOT_RESPONDED':
      return {
        ...state,
        phase: ORDER_PHASES.IDLE,
      };

    case 'PHONE_REQUESTED':
      return {
        ...state,
        phase: ORDER_PHASES.AWAITING_PHONE,
        defaultPhone: event.defaultPhone || state.defaultPhone,
      };

    case 'OTP_REQUESTED':
      return {
        ...state,
        phase: ORDER_PHASES.AWAITING_OTP,
        otpPrompt: event.prompt || state.otpPrompt,
        otpLength: event.otpLength || 6,
        isOtpModalOpen: true,
      };

    case 'CONFIRMATION_REQUESTED':
      return {
        ...state,
        phase: ORDER_PHASES.AWAITING_CONFIRMATION,
        confirmationData: event.data || null,
      };

    case 'PRODUCT_RESULTS':
      return {
        ...state,
        phase: ORDER_PHASES.AWAITING_PRODUCT,
      };

    case 'ORDER_SUCCESS':
      return {
        ...state,
        phase: ORDER_PHASES.SUCCESS,
        isOtpModalOpen: false,
      };

    case 'ORDER_CANCELLED':
      return {
        ...state,
        phase: ORDER_PHASES.CANCELLED,
        isOtpModalOpen: false,
      };

    case 'ORDER_FAILED':
      return {
        ...state,
        phase: ORDER_PHASES.FAILED,
        isOtpModalOpen: false,
      };

    case 'CLOSE_OTP_MODAL':
      return {
        ...state,
        isOtpModalOpen: false,
      };

    case 'OPEN_OTP_MODAL':
      return {
        ...state,
        isOtpModalOpen: true,
      };

    case 'RESET':
      return { ...initialState };

    case 'STEP_PROGRESS':
      // Don't change phase during step progress — this prevents
      // the OTP state wipe bug where step_progress messages
      // would prematurely clear isWaitingForOTP
      return state;

    // ---- Multi-Item Cart Events ----
    case 'QUEUE_PROGRESS':
      return {
        ...state,
        phase: ORDER_PHASES.QUEUE_SHOPPING,
        queueProgress: {
          currentIndex: event.currentIndex,
          totalItems: event.totalItems,
          currentItem: event.currentItem,
        },
        cartSummary: event.cartSummary || state.cartSummary,
      };

    case 'ASK_MORE_OR_CHECKOUT':
      return {
        ...state,
        phase: ORDER_PHASES.ASK_MORE_OR_CHECKOUT,
        isAddMoreOrCheckoutOpen: true,
        cartSummary: event.cartSummary || state.cartSummary,
      };

    case 'CLOSE_ADD_MORE_MODAL':
      return {
        ...state,
        isAddMoreOrCheckoutOpen: false,
      };

    case 'CART_UPDATED':
      return {
        ...state,
        cartSummary: event.cartSummary || state.cartSummary,
      };

    default:
      return state;
  }
}

export function useOrderState(defaultOtpPrompt = '') {
  const [state, dispatch] = useReducer(orderReducer, {
    ...initialState,
    otpPrompt: defaultOtpPrompt,
  });

  // Derived boolean getters for backward compatibility
  const isBotThinking = state.phase === ORDER_PHASES.THINKING;
  const isWaitingForOTP = state.phase === ORDER_PHASES.AWAITING_OTP;
  const isWaitingForPhone = state.phase === ORDER_PHASES.AWAITING_PHONE;
  const isWaitingForConfirmation = state.phase === ORDER_PHASES.AWAITING_CONFIRMATION;

  const isAddMoreOrCheckoutOpen = state.isAddMoreOrCheckoutOpen;
  const isQueueShopping = state.phase === ORDER_PHASES.QUEUE_SHOPPING;

  return {
    // State
    phase: state.phase,
    defaultPhone: state.defaultPhone,
    otpPrompt: state.otpPrompt,
    otpLength: state.otpLength,
    isOtpModalOpen: state.isOtpModalOpen,
    confirmationData: state.confirmationData,
    cartSummary: state.cartSummary,
    queueProgress: state.queueProgress,
    isAddMoreOrCheckoutOpen,
    
    // Derived booleans
    isBotThinking,
    isWaitingForOTP,
    isWaitingForPhone,
    isWaitingForConfirmation,
    isQueueShopping,
    
    // Dispatch
    dispatch,
  };
}
