import time
from fastapi import APIRouter
from app.config import settings
from app.database import db_manager

router = APIRouter(prefix="/health", tags=["Health"])

START_TIME = time.time()

@router.get("")
async def health_check():
    """System health check and diagnostic status endpoint."""
    uptime_seconds = round(time.time() - START_TIME, 2)
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "campus": {
            "name": settings.CAMPUS_NAME,
            "location": settings.CAMPUS_LOCATION,
        },
        "database": {
            "status": "connected" if db_manager.is_connected else "disconnected/standby",
            "name": settings.MONGODB_DB_NAME,
            "connected": db_manager.is_connected
        },
        "ai_engine": {
            "provider": "Anthropic Claude",
            "model": settings.ANTHROPIC_MODEL,
            "api_key_configured": bool(settings.ANTHROPIC_API_KEY and len(settings.ANTHROPIC_API_KEY) > 5)
        },
        "uptime_seconds": uptime_seconds
    }
