from pydantic import BaseModel, Field
from typing import Optional, List, Literal

class FaceVerifyRequest(BaseModel):
  nationalId: str = Field(..., description="Voter national identification number")
  challengeId: str = Field(..., description="Active session challenge ID issued by challenge_store")
  liveEmbedding: Optional[List[float]] = Field(None, description="512-dim ArcFace embedding vector")
  liveImageBase64: Optional[str] = Field(None, description="Base64 encoded live capture portrait")
  livenessActions: Optional[List[str]] = Field(
    default_factory=list,
    description="Completed liveness actions e.g. ['BLINK', 'HEAD_TURN_LEFT']",
  )

class FaceVerifyResponse(BaseModel):
  result: Literal["PASS", "FAIL"] = Field(
    ..., description="Strict binary result: PASS or FAIL only (no raw biometric leakage)"
  )
  nationalId: str
  verificationToken: Optional[str] = Field(
    None, description="Cryptographic one-time proof token upon PASS"
  )
  message: str

class ChallengeResponse(BaseModel):
  challengeId: str
  nationalId: str
  requiredActions: List[str]
  expiresInSec: int
