import pytest
from models.messages import ClientMessage, ServerMessage, ProductResult
from models.actions import AgentAction
from models.order import GroceryOrder, OrderItem


class TestClientMessage:
    def test_valid_message(self):
        msg = ClientMessage(text="Order 1kg onions", lang="en")
        assert msg.sender == "user"
        assert msg.text == "Order 1kg onions"
        assert msg.lang == "en"

    def test_tamil_language(self):
        msg = ClientMessage(text="1 கிலோ வெங்காயம்", lang="ta")
        assert msg.lang == "ta"

    def test_invalid_language_rejected(self):
        with pytest.raises(Exception):
            ClientMessage(text="test", lang="invalid")

    def test_default_sender(self):
        msg = ClientMessage(text="hello")
        assert msg.sender == "user"


class TestProductResult:
    def test_valid_product(self):
        p = ProductResult(name="Red Onions 1kg", price="₹45")
        assert p.name == "Red Onions 1kg"
        assert p.add_button_id is None  # No magic fallback

    def test_with_button_id(self):
        p = ProductResult(name="Milk 500ml", price="₹28", add_button_id=42)
        assert p.add_button_id == 42


class TestAgentAction:
    def test_valid_click(self):
        action = AgentAction(action="click", id=5, reasoning="Clicking add button")
        assert action.action == "click"
        assert action.id == 5

    def test_click_without_id_raises(self):
        with pytest.raises(ValueError, match="requires an 'id' field"):
            AgentAction(action="click", reasoning="test")

    def test_type_without_text_raises(self):
        with pytest.raises(ValueError, match="requires a 'text' field"):
            AgentAction(action="type", id=10, reasoning="test")

    def test_valid_type(self):
        action = AgentAction(action="type", id=10, text="1kg onions", reasoning="Typing search")
        assert action.text == "1kg onions"

    def test_ask_user_without_question_raises(self):
        with pytest.raises(ValueError, match="requires a 'question' field"):
            AgentAction(action="ask_user", reasoning="test")

    def test_valid_scroll(self):
        action = AgentAction(action="scroll", reasoning="Scrolling down")
        assert action.action == "scroll"

    def test_valid_done(self):
        action = AgentAction(action="done", summary="Order placed", reasoning="Complete")
        assert action.summary == "Order placed"

    def test_invalid_action_type_rejected(self):
        with pytest.raises(Exception):
            AgentAction(action="hack_system", reasoning="test")

    def test_show_results_no_id_needed(self):
        action = AgentAction(action="show_results", reasoning="Showing", results=[{"name": "test"}])
        assert action.id is None


class TestGroceryOrder:
    def test_valid_order(self):
        order = GroceryOrder(
            items=[OrderItem(query="onions", quantity=1, unit="kg")],
            language="en"
        )
        assert len(order.items) == 1
        assert order.items[0].query == "onions"

    def test_tamil_order(self):
        order = GroceryOrder(
            items=[OrderItem(query="வெங்காயம்", quantity=2, unit="kg")],
            language="ta"
        )
        assert order.language == "ta"

    def test_empty_items_allowed(self):
        order = GroceryOrder(items=[])
        assert len(order.items) == 0
