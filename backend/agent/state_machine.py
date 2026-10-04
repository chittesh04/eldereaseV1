from enum import Enum


class SessionPhase(str, Enum):
    """Explicit lifecycle phases for an ordering session."""
    IDLE = "idle"
    CLARIFYING = "clarifying"
    DRAFTING_COMMAND = "drafting_command"
    NAVIGATING = "navigating"
    SEARCHING = "searching"
    AWAITING_PRODUCT_SELECTION = "awaiting_product_selection"
    ADDING_TO_CART = "adding_to_cart"
    CHECKOUT = "checkout"
    AWAITING_PHONE = "awaiting_phone"
    AWAITING_OTP = "awaiting_otp"
    AWAITING_ADDRESS = "awaiting_address"
    AWAITING_CONFIRMATION = "awaiting_confirmation"
    PLACING_ORDER = "placing_order"
    SUCCESS = "success"
    FAILED = "failed"
    CANCELLED = "cancelled"
    MAX_STEPS_EXCEEDED = "max_steps_exceeded"
    AGENT_UNAVAILABLE = "agent_unavailable"


class WaitingFor(str, Enum):
    """What specific input the agent is currently blocked on.
    
    Replaces the fragile `thread.is_alive()` check with explicit state.
    """
    NOTHING = "nothing"
    CLARIFICATION = "clarification"
    PRODUCT_SELECTION = "product_selection"
    PHONE = "phone"
    OTP = "otp"
    ADDRESS = "address"
    PURCHASE_CONFIRMATION = "purchase_confirmation"
    GENERIC = "generic"
