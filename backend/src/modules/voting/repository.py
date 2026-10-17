from datetime import datetime, timezone
from sqlalchemy.orm import Session
from src.modules.voting.models import Election, Candidate, VoterParticipation, VoteToken, Ballot


class VotingRepository:
    """Database query operations for elections, tokens, and ballots."""

    def __init__(self, db: Session):
        self.db = db

    def get_election(self, election_id: int) -> Election | None:
        return self.db.query(Election).filter(Election.id == election_id).first()

    def get_candidates(self, election_id: int) -> list[Candidate]:
        return self.db.query(Candidate).filter(Candidate.election_id == election_id).order_by(Candidate.votes.desc()).all()

    def get_candidate(self, candidate_id: int, election_id: int) -> Candidate | None:
        return self.db.query(Candidate).filter(
            Candidate.id == candidate_id,
            Candidate.election_id == election_id
        ).first()

    def has_participated(self, voter_id: int, election_id: int) -> bool:
        return self.db.query(VoterParticipation).filter(
            VoterParticipation.voter_id == voter_id,
            VoterParticipation.election_id == election_id
        ).first() is not None

    def record_participation(self, voter_id: int, election_id: int) -> VoterParticipation:
        record = VoterParticipation(voter_id=voter_id, election_id=election_id)
        self.db.add(record)
        return record

    def create_vote_token(self, token_hash: str, election_id: int, expires_at: datetime) -> VoteToken:
        token = VoteToken(
            token_hash=token_hash,
            election_id=election_id,
            expires_at=expires_at,
            used=0
        )
        self.db.add(token)
        self.db.commit()
        return token

    def get_valid_token(self, token_hash: str, election_id: int) -> VoteToken | None:
        return self.db.query(VoteToken).filter(
            VoteToken.token_hash == token_hash,
            VoteToken.election_id == election_id,
            VoteToken.used == 0,
            VoteToken.expires_at > datetime.now(timezone.utc)
        ).first()

    def burn_token(self, token: VoteToken):
        token.used = 1
        token.used_at = datetime.now(timezone.utc)

    def save_ballot(self, election_id: int, encrypted_choice: str, receipt_hash: str, created_hour: str, leaf_hash: str = None) -> Ballot:
        ballot = Ballot(
            election_id=election_id,
            candidate_choice_encrypted=encrypted_choice,
            receipt_hash=receipt_hash,
            created_hour=created_hour,
            merkle_leaf_hash=leaf_hash
        )
        self.db.add(ballot)
        return ballot

    def increment_candidate_vote(self, candidate_id: int):
        candidate = self.db.query(Candidate).filter(Candidate.id == candidate_id).first()
        if candidate:
            candidate.votes += 1

    def find_ballot_by_receipt_hash(self, receipt_hash: str) -> Ballot | None:
        return self.db.query(Ballot).filter(Ballot.receipt_hash == receipt_hash).first()

    def get_all_ballots(self, election_id: int) -> list[Ballot]:
        return self.db.query(Ballot).filter(Ballot.election_id == election_id).order_by(Ballot.id.asc()).all()
