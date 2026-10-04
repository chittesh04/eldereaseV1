from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


class ClientMessage(BaseModel):
    """Validated schema for messages received from the frontend over WebSocket."""
    sender: Literal["user"] = "user"
    text: str
    lang: Literal["en", "ta"] = "en"
    isOtpResponse: bool = False
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())


class ProductResult(BaseModel):
    """A single product result extracted by the vision LLM from the shopping page."""
    name: str
    price: str
    weight: Optional[str] = None
    add_button_id: Optional[int] = None  # No magic fallback — must be explicitly provided
    image_url: Optional[str] = None


class ServerMessage(BaseModel):
    """Validated schema for messages sent from the backend to the frontend over WebSocket."""
    sender: Literal["bot"] = "bot"
    action: str
    text: str
    lang: str = "en"
    timestamp: str = Field(default_factory=lambda: datetime.now().strftime("%I:%M %p"))
    type: Optional[str] = None
    step: Optional[int] = None
    results: Optional[list[ProductResult]] = None
    prompt: Optional[str] = None
    default_phone: Optional[str] = None
    summary: Optional[str] = None
