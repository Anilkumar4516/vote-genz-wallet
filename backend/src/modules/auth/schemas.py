from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    voter_code: str = Field(..., min_length=2, max_length=64, description="Citizen Voter ID or Mobile Number")


class VerifyOTPRequest(BaseModel):
    voter_code: str = Field(..., min_length=2, max_length=64)
    otp: str = Field(..., min_length=6, max_length=6)


class AuthResponse(BaseModel):
    success: bool
    session_token: str
    voter: dict
