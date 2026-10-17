import os
import time
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from src.core.exceptions import NotFoundException, ForbiddenException, UnauthorizedException
from src.core.security import generate_otp, create_access_token
from src.core.config import get_settings
from src.modules.auth.repository import AuthRepository

settings = get_settings()

# In-memory OTP storage fallback when Redis is absent
_otp_cache: dict[str, dict] = {}


class AuthService:
    """Business logic service for citizen authentication & session management."""

    def __init__(self, db: Session):
        self.repo = AuthRepository(db)

    def request_otp(self, identifier: str) -> dict:
        voter = self.repo.find_voter_by_code_or_phone(identifier)
        if not voter:
            raise NotFoundException("Voter ID or phone not found in the electoral roll.")
        if voter.status != "active":
            raise ForbiddenException("Voter account is locked or deactivated.")

        otp = generate_otp()
        _otp_cache[voter.voter_code] = {
            "otp": otp,
            "voter_id": voter.id,
            "expires_at": time.time() + 300
        }

        response = {
            "success": True,
            "message": f"OTP sent to {voter.phone}",
            "voter_code": voter.voter_code
        }
        # In non-production, supply demoOtp for developer convenience
        if settings.ENV != "production":
            response["demo_otp"] = otp

        return response

    def verify_otp(self, voter_code: str, entered_otp: str) -> dict:
        clean_code = voter_code.strip().upper()
        record = _otp_cache.get(clean_code)

        if not record:
            raise UnauthorizedException("No active OTP requested or OTP has expired.")
        if time.time() > record["expires_at"]:
            _otp_cache.pop(clean_code, None)
            raise UnauthorizedException("OTP has expired. Please request a fresh code.")
        if record["otp"] != entered_otp.strip():
            raise UnauthorizedException("Invalid OTP entered. Please try again.")

        _otp_cache.pop(clean_code, None)
        voter = self.repo.find_voter_by_code_or_phone(clean_code)
        if not voter:
            raise NotFoundException("Voter not found.")

        # Create JWT access token
        access_token = create_access_token(
            subject=voter.id,
            expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        )
        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        self.repo.create_session(access_token, voter, expires_at)

        return {
            "success": True,
            "session_token": access_token,
            "voter": {
                "id": voter.id,
                "voter_code": voter.voter_code,
                "full_name": voter.full_name,
                "phone": voter.phone,
                "photo_url": voter.photo_url
            }
        }
