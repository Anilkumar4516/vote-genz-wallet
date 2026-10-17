from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.middlewares.auth_guard import get_current_voter
from src.modules.users.schemas import RegisterVoterSchema
from src.modules.users.services import UserService

router = APIRouter(tags=["Voters & Electoral Roll"])


@router.get("/api/voters")
async def list_voters(db: Session = Depends(get_db)):
    service = UserService(db)
    return {"voters": service.list_voters()}


@router.post("/api/voters/register")
async def register_voter(payload: RegisterVoterSchema, db: Session = Depends(get_db)):
    service = UserService(db)
    return service.register_voter(payload.name, payload.phone, payload.photo_url)


@router.get("/api/voters/{code}/card")
async def get_voter_card(code: str, db: Session = Depends(get_db)):
    service = UserService(db)
    return service.get_voter_card(code)


@router.get("/api/voter/me")
async def get_my_profile(current_voter: dict = Depends(get_current_voter), db: Session = Depends(get_db)):
    service = UserService(db)
    voter = service.repo.get_by_id(int(current_voter["sub"]))
    return {
        "voter": voter,
        "faceVerified": True,
        "bioVerified": True
    }
