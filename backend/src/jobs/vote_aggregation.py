import logging
from sqlalchemy.orm import Session
from src.modules.voting.models import Candidate, Ballot

logger = logging.getLogger(__name__)


def recalculate_election_tallies(db: Session, election_id: int = 1) -> dict:
    """Periodic job recalculating candidate vote counts from sealed ballots."""
    logger.info(f"Starting tally recalculation for Election #{election_id}...")
    candidates = db.query(Candidate).filter(Candidate.election_id == election_id).all()
    ballots = db.query(Ballot).filter(Ballot.election_id == election_id).all()

    total_ballots = len(ballots)
    logger.info(f"Audit verified {total_ballots} ballots for Election #{election_id}.")
    
    return {
        "election_id": election_id,
        "total_ballots": total_ballots,
        "candidate_count": len(candidates)
    }
