from pydantic import BaseModel, model_validator
from typing import Optional, Literal


class AgentAction(BaseModel):
    """Validated schema for LLM-generated agent actions.
    
    Treats LLM output as untrusted external input and validates
    that required fields are present for each action type.
    """
    reasoning: str = ""
    status: str = "Processing..."
    action: Literal[
        "click",
        "type",
        "scroll",
        "show_results",
        "input_phone",
        "input_otp",
        "ask_user",
        "ask_address",
        "reload",
        "done",
    ]
    id: Optional[int] = None
    text: Optional[str] = None
    question: Optional[str] = None
    summary: Optional[str] = None
    results: Optional[list] = None

    @model_validator(mode="after")
    def validate_action_fields(self):
        """Ensure each action type has its required fields."""
        actions_requiring_id = ("click", "type", "input_phone", "input_otp")
        if self.action in actions_requiring_id and self.id is None:
            raise ValueError(
                f"Action '{self.action}' requires an 'id' field specifying the "
                f"target element's custom-agent-id. Got None."
            )
        if self.action == "type" and not self.text:
            raise ValueError(
                "Action 'type' requires a 'text' field specifying what to type."
            )
        if self.action == "ask_user" and not self.question:
            raise ValueError(
                "Action 'ask_user' requires a 'question' field for the user prompt."
            )
        return self
