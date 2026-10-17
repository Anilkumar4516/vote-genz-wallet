import secrets
import re
from sqlalchemy.orm import Session
from src.core.exceptions import AppException, NotFoundException
from src.modules.users.repository import UserRepository
from src.modules.wallet.services import WalletService


def generate_voter_code(name: str, phone: str) -> str:
    clean_name = re.sub(r"[^a-zA-Z]", "", name)[:3].upper().ljust(3, "X")
    digits = re.sub(r"\D", "", phone)
    suffix = digits[-4:] if len(digits) >= 4 else str(secrets.randbelow(9000) + 1000)
    return f"VOTER-{clean_name}{suffix}"


class UserService:
    """Citizen registration, roll enrollment, and voter card retrieval."""

    def __init__(self, db: Session):
        self.db = db
        self.repo = UserRepository(db)
        self.wallet_service = WalletService(db)

    def list_voters(self) -> list:
        return self.repo.get_all()

    def register_voter(self, name: str, phone: str, photo_url: str | None = None) -> dict:
        digits = re.sub(r"\D", "", phone)
        if len(digits) < 8:
            raise AppException(status_code=400, message="Please enter a valid mobile number (min 8 digits).")

        existing = self.repo.find_duplicate(digits, name)
        if existing:
            raise AppException(
                status_code=409,
                message=f"Duplicate Registration Blocked: Citizen already enrolled as {existing.full_name} ({existing.voter_code})!"
            )

        voter_code = generate_voter_code(name, phone)
        formatted_phone = phone.strip() if phone.strip().startswith("+") else f"+91 {phone.strip()}"
        photo = photo_url if photo_url else f"https://api.dicebear.com/7.x/identicon/svg?seed={voter_code}"

        voter = self.repo.create(voter_code, name.strip(), formatted_phone, photo)
        
        self.wallet_service.append_ledger(
            "VOTER_REGISTERED",
            f"Enrolled citizen {voter_code} ({name}) to electoral roll"
        )

        return {
            "success": True,
            "voter_code": voter.voter_code,
            "full_name": voter.full_name,
            "phone": voter.phone,
            "photo_url": voter.photo_url,
            "message": f"Citizen {name} successfully enrolled with Voter ID {voter_code}!"
        }

    def get_voter_card(self, voter_code: str) -> dict:
        voter = self.repo.get_by_code(voter_code)
        if not voter:
            raise NotFoundException("Citizen record not found in electoral roll.")

        return {
            "voter": voter,
            "constituency": "042 - Metropolitan Civic District",
            "pollingStation": "Station 14A - National Tech Hall",
            "serialNo": f"{voter.id:04d}",
            "issuanceDate": "15-OCT-2026",
            "stateAuthority": "STATE ELECTION COMMISSION"
        }
