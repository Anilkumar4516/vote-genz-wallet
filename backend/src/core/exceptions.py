from typing import Any
from fastapi import HTTPException, status


class AppException(HTTPException):
    """Base application exception with uniform error payload."""
    def __init__(
        self,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        message: str = "Internal server error",
        error_code: str = "INTERNAL_ERROR",
        details: Any = None
    ):
        super().__init__(status_code=status_code, detail=message)
        self.message = message
        self.error_code = error_code
        self.details = details


class NotFoundException(AppException):
    def __init__(self, message: str = "Resource not found", details: Any = None):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            message=message,
            error_code="RESOURCE_NOT_FOUND",
            details=details
        )


class UnauthorizedException(AppException):
    def __init__(self, message: str = "Authentication required", details: Any = None):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            message=message,
            error_code="UNAUTHORIZED",
            details=details
        )


class ForbiddenException(AppException):
    def __init__(self, message: str = "Action prohibited", details: Any = None):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            message=message,
            error_code="FORBIDDEN",
            details=details
        )


class DuplicateVoteException(AppException):
    def __init__(self, message: str = "Citizen has already cast a ballot in this election"):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            message=message,
            error_code="DUPLICATE_VOTE_BLOCKED"
        )


class InvalidTokenException(AppException):
    def __init__(self, message: str = "Invalid, expired, or burned ballot token"):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            message=message,
            error_code="INVALID_TOKEN"
        )


class RateLimitException(AppException):
    def __init__(self, message: str = "Too many requests. Please slow down."):
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            message=message,
            error_code="RATE_LIMIT_EXCEEDED"
        )
