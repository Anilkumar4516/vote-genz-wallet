from sqlalchemy.orm import Session
from src.modules.users.models import Voter


class UserRepository:
    """Database operations for voter citizen records."""

    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> list[Voter]:
        return self.db.query(Voter).order_by(Voter.id.asc()).all()

    def get_by_id(self, voter_id: int) -> Voter | None:
        return self.db.query(Voter).filter(Voter.id == voter_id).first()

    def get_by_code(self, voter_code: str) -> Voter | None:
        clean = voter_code.strip().upper()
        return self.db.query(Voter).filter(
            (Voter.voter_code == clean) |
            (Voter.voter_code == f"VOTER-{clean.replace('VOTER-', '')}")
        ).first()

    def find_duplicate(self, phone_digits: str, full_name: str) -> Voter | None:
        return self.db.query(Voter).filter(
            (Voter.phone.contains(phone_digits)) |
            (Voter.full_name.ilike(full_name.strip()))
        ).first()

    def create(self, voter_code: str, full_name: str, phone: str, photo_url: str | None = None) -> Voter:
        voter = Voter(
            voter_code=voter_code,
            full_name=full_name,
            phone=phone,
            photo_url=photo_url,
            status="active"
        )
        self.db.add(voter)
        self.db.commit()
        self.db.refresh(voter)
        return voter
