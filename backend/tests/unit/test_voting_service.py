from datetime import datetime, timezone
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.core.database import Base
from src.core.exceptions import DuplicateVoteException
from src.modules.voting.services import VotingService
from src.modules.voting.models import Election, Candidate


@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()

    # Seed election & candidate
    now = datetime.now(timezone.utc)
    election = Election(id=1, title="Test Election", status="open", opens_at=now, closes_at=now)
    candidate = Candidate(id=1, name="Alice", election_id=1, votes=0)
    session.add_all([election, candidate])
    session.commit()

    yield session
    session.close()


def test_voting_lifecycle_and_duplicate_prevention(db_session):
    service = VotingService(db_session)

    # 1. Issue anonymous token
    token_res = service.issue_anonymous_token(voter_id=101, election_id=1)
    assert token_res["success"] is True
    anon_token = token_res["anonymous_token"]

    # 2. Cast ballot
    cast_res = service.cast_ballot(voter_id=101, anonymous_token=anon_token, candidate_id=1, election_id=1)
    assert cast_res["success"] is True
    assert "receipt_hash" in cast_res

    # 3. Attempt duplicate vote (must fail)
    with pytest.raises(DuplicateVoteException):
        service.issue_anonymous_token(voter_id=101, election_id=1)
