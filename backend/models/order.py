from pydantic import BaseModel
from typing import Optional, Literal


class OrderItem(BaseModel):
    """A single item in a grocery order."""
    query: str
    quantity: int = 1
    unit: str = "pcs"
    brand: Optional[str] = None


class GroceryOrder(BaseModel):
    """Canonical structured representation of a grocery order.
    
    Replaces free-form string passing with typed data,
    reducing the number of places where LLM text drives behavior.
    """
    items: list[OrderItem]
    delivery_address: Optional[str] = None
    phone: Optional[str] = None
    language: Literal["en", "ta"] = "en"
