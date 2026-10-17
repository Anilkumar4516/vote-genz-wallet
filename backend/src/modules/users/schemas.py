from pydantic import BaseModel, Field


class RegisterVoterSchema(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., min_length=8, max_length=20)
    photo_url: str | None = None


class VoterResponseSchema(BaseModel):
    id: int
    voter_code: str
    full_name: str
    phone: str
    photo_url: str | None
    status: str
