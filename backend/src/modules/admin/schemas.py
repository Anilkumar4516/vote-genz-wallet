from pydantic import BaseModel
from typing import Any, Optional


class CloseElectionResponse(BaseModel):
    success: bool
    message: str


class ReopenElectionResponse(BaseModel):
    success: bool
    message: str


class TallyElectionResponse(BaseModel):
    success: bool
    total_ballots: int
    total_voter_participation: int
    audit_check_passed: bool
    tally_breakdown: dict[str, int]
    message: str


class ResetElectionResponse(BaseModel):
    success: bool
    message: str


class BlockVerification(BaseModel):
    id: int
    tx_hash: str
    prev_hash: str
    action_type: str
    detail: str
    created_at: str


class VerifyChainResponse(BaseModel):
    valid: bool
    total_blocks: int
    latest_hash: str
    failed_at_id: Optional[int] = None
    reason: Optional[str] = None
    blocks: list[dict[str, Any]] = []
