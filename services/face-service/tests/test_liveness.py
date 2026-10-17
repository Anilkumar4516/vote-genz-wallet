import pytest
from app.services.liveness import liveness_detector

def test_liveness_succeeds_when_actions_matched():
    required = ["BLINK", "HEAD_TURN_LEFT"]
    detected = ["SMILE", "BLINK", "HEAD_TURN_LEFT"]

    passed = liveness_detector.verify_challenge_actions(required, detected)
    assert passed is True

def test_liveness_fails_when_action_missing():
    required = ["BLINK", "HEAD_TURN_RIGHT"]
    detected = ["BLINK"] # Missing HEAD_TURN_RIGHT

    passed = liveness_detector.verify_challenge_actions(required, detected)
    assert passed is False

def test_liveness_fails_on_empty_detection():
    required = ["BLINK"]
    detected = []

    passed = liveness_detector.verify_challenge_actions(required, detected)
    assert passed is False
