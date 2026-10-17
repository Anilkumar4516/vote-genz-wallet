from datetime import datetime, timezone
from sqlalchemy.orm import Session
from src.modules.auth.models import VoterSession
from src.modules.users.models import Voter


class AuthRepository:
    """Database query layer for Authentication and Voter sessions."""

    def __init__(self, db: Session):
        self.db = db

    def find_voter_by_code_or_phone(self, identifier: str) -> Voter | None:
        clean_id = identifier.strip().upper()
        
        # 1. Exact voter code or voter name match (highest priority)
        voter = self.db.query(Voter).filter(
            (Voter.voter_code == clean_id) |
            (Voter.voter_code == f"VOTER-{clean_id.replace('VOTER-', '')}") |
            (Voter.full_name.ilike(identifier.strip()))
        ).first()
        if voter:
            return voter

        # 2. Fallback: Phone number matching (require 10+ digits)
        digits = "".join(filter(str.isdigit, identifier))
        if len(digits) >= 10:
            return self.db.query(Voter).filter(Voter.phone.contains(digits)).first()

        return None

    def create_session(self, session_token: str, voter: Voter, expires_at: datetime) -> VoterSession:
        session = VoterSession(
            token=session_token,
            voter_id=voter.id,
            voter_code=voter.voter_code,
            expires_at=expires_at
        )
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        return session

    def get_session(self, token: str) -> VoterSession | None:
        return self.db.query(VoterSession).filter(
            VoterSession.token == token,
            VoterSession.expires_at > datetime.now(timezone.utc)
        ).first()
