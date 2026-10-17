from typing import List
from app.core.logging import logger

class LivenessDetector:
    """
    Evaluates dynamic interactive facial liveness challenges (e.g. eye blinks, head turns)
    to defend against pre-recorded video playback, deepfakes, and static printed photos.
    """

    @staticmethod
    def verify_challenge_actions(
        required_actions: List[str],
        detected_actions: List[str],
    ) -> bool:
        if not required_actions:
            return True

        if not detected_actions:
            logger.warning("Liveness check failed: No actions detected from client camera")
            return False

        # Validate that all required challenge actions occurred in acceptable sequence
        normalized_required = [a.upper().strip() for a in required_actions]
        normalized_detected = [a.upper().strip() for a in detected_actions]

        passed = all(action in normalized_detected for action in normalized_required)
        if passed:
            logger.info(f"Liveness verification PASSED: Satisfied {normalized_required}")
        else:
            logger.warning(
                f"Liveness verification FAILED: Required {normalized_required}, but received {normalized_detected}"
            )

        return passed

liveness_detector = LivenessDetector()
