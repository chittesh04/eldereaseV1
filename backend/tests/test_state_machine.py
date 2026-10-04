import pytest
from agent.state_machine import SessionPhase, WaitingFor


class TestSessionPhase:
    def test_all_phases_are_strings(self):
        for phase in SessionPhase:
            assert isinstance(phase.value, str)

    def test_terminal_states(self):
        terminal = {SessionPhase.SUCCESS, SessionPhase.FAILED, SessionPhase.CANCELLED, SessionPhase.MAX_STEPS_EXCEEDED, SessionPhase.AGENT_UNAVAILABLE}
        assert SessionPhase.SUCCESS in terminal
        assert SessionPhase.IDLE not in terminal

    def test_phase_values_unique(self):
        values = [p.value for p in SessionPhase]
        assert len(values) == len(set(values))


class TestWaitingFor:
    def test_nothing_is_default(self):
        assert WaitingFor.NOTHING == "nothing"

    def test_all_waiting_states_are_strings(self):
        for w in WaitingFor:
            assert isinstance(w.value, str)

    def test_waiting_values_unique(self):
        values = [w.value for w in WaitingFor]
        assert len(values) == len(set(values))
