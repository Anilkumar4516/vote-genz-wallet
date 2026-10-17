import secrets
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.middlewares.rate_limiter import rate_limit_auth
from src.modules.auth.schemas import LoginRequest, VerifyOTPRequest
from src.modules.auth.services import AuthService

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/login", dependencies=[Depends(rate_limit_auth)])
async def login(req: LoginRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    return service.request_otp(req.voter_code)


@router.post("/verify-otp")
async def verify_otp(req: VerifyOTPRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    return service.verify_otp(req.voter_code, req.otp)


@router.get("/webauthn-challenge")
async def get_webauthn_challenge(request: Request):
    """Generates cryptographic challenge for FIDO2 WebAuthn / Touch ID."""
    challenge = secrets.token_urlsafe(32)
    return {
        "challenge": challenge,
        "rpId": request.headers.get("host", "localhost").split(":")[0],
        "timeout": 60000
    }
