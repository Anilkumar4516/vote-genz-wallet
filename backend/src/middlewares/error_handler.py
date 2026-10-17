import logging
from fastapi import Request
from fastapi.responses import JSONResponse
from src.core.exceptions import AppException

logger = logging.getLogger("api.errors")


async def app_exception_handler(request: Request, exc: AppException):
    """Uniform handler for all custom domain exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": exc.error_code,
                "message": exc.message,
                "details": exc.details,
                "correlation_id": getattr(request.state, "correlation_id", None)
            }
        }
    )


async def global_exception_handler(request: Request, exc: Exception):
    """Fallback handler for unhandled 500 exceptions."""
    correlation_id = getattr(request.state, "correlation_id", "unknown")
    logger.exception(f"Unhandled exception [Correlation: {correlation_id}]: {exc}")
    
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred. Please contact system support.",
                "correlation_id": correlation_id
            }
        }
    )
