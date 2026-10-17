from pydantic import BaseModel, Field


class IssueTokenSchema(BaseModel):
    election_id: int = Field(default=1)


class CastVoteSchema(BaseModel):
    anonymous_token: str = Field(..., min_length=16, description="Single-use anonymous ballot token")
    candidate_id: int = Field(..., gt=0, description="Target Candidate ID")
    election_id: int = Field(default=1)


class ReceiptVerificationSchema(BaseModel):
    receipt_code: str = Field(..., min_length=4)


class BallotResponseSchema(BaseModel):
    success: bool
    receipt_code: str
    receipt_hash: str
    timestamp: str
    message: str
