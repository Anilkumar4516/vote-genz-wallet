from pydantic import BaseModel, Field


class CreateWalletSchema(BaseModel):
    label: str = Field(..., min_length=2, max_length=100)
    address: str | None = None
    credits: int = Field(default=20, ge=0)


class RechargeSchema(BaseModel):
    wallet_id: int = Field(..., gt=0)
    amount: int = Field(..., gt=0)


class WalletResponseSchema(BaseModel):
    id: int
    label: str
    address: str
    credits: int
