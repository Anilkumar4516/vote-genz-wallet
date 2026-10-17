from typing import TypeVar, Generic, Sequence
from pydantic import BaseModel

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    items: Sequence[T]
    total: int
    page: int
    size: int
    has_next: bool


def paginate_query(query, page: int = 1, size: int = 20) -> tuple[list, int, bool]:
    """Applies limit/offset pagination to a SQLAlchemy query."""
    page = max(1, page)
    size = max(1, min(100, size))
    total = query.count()
    items = query.offset((page - 1) * size).limit(size).all()
    has_next = (page * size) < total
    return items, total, has_next
