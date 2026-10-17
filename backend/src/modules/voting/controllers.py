from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.middlewares.auth_guard import get_current_voter
from src.middlewares.rate_limiter import rate_limit_vote
from src.modules.voting.schemas import IssueTokenSchema, CastVoteSchema
from src.modules.voting.services import VotingService

router = APIRouter(tags=["Voting"])


@router.post("/api/vote/token")
async def issue_anonymous_token(
    payload: IssueTokenSchema,
    current_voter: dict = Depends(get_current_voter),
    db: Session = Depends(get_db)
):
    voter_id = int(current_voter["sub"])
    service = VotingService(db)
    return service.issue_anonymous_token(voter_id, payload.election_id)


@router.post("/api/vote/cast", dependencies=[Depends(rate_limit_vote)])
async def cast_ballot(
    payload: CastVoteSchema,
    current_voter: dict = Depends(get_current_voter),
    db: Session = Depends(get_db)
):
    voter_id = int(current_voter["sub"])
    service = VotingService(db)
    return service.cast_ballot(
        voter_id=voter_id,
        anonymous_token=payload.anonymous_token,
        candidate_id=payload.candidate_id,
        election_id=payload.election_id
    )


@router.get("/api/vote/receipt/{code}")
async def verify_receipt(code: str, db: Session = Depends(get_db)):
    service = VotingService(db)
    return service.verify_receipt(code)


@router.get("/api/vote/merkle-proof/{receipt_hash}")
async def get_merkle_proof(receipt_hash: str, db: Session = Depends(get_db)):
    service = VotingService(db)
    return service.get_merkle_proof(receipt_hash)


@router.get("/api/elections/{election_id}/candidates")
async def list_candidates(election_id: int, db: Session = Depends(get_db)):
    service = VotingService(db)
    election = service.repo.get_election(election_id)
    candidates = service.repo.get_candidates(election_id)
    return {
        "election": election,
        "candidates": candidates
    }
