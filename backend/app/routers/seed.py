from fastapi import APIRouter
from app.seed.campus_seed import (
    CAMPUS_INFO,
    SEED_VENUES,
    SEED_BLOCKS,
    SEED_EVENT_CATEGORIES,
    SEED_LEADERSHIP,
    SEED_RESOURCES
)
from app.database import db_manager, COLLECTIONS

router = APIRouter(prefix="/campus", tags=["Campus Master Data"])

@router.get("/info")
async def get_campus_info():
    """Get general campus and university profile details."""
    return {"campus": CAMPUS_INFO}

@router.get("/venues")
async def get_seed_venues():
    """Get list of user-provided campus venues and seminar halls."""
    if db_manager.is_connected and db_manager.db is not None:
        venues_coll = db_manager.db[COLLECTIONS["venues"]]
        count = await venues_coll.count_documents({})
        if count > 0:
            cursor = venues_coll.find({}, {"_id": 0})
            db_venues = await cursor.to_list(length=100)
            return {"source": "database", "total": len(db_venues), "venues": db_venues}
    
    return {"source": "seed", "total": len(SEED_VENUES), "venues": SEED_VENUES}

@router.get("/blocks")
async def get_seed_blocks():
    """Get known campus blocks and floor configurations."""
    return {"blocks": SEED_BLOCKS}

@router.get("/categories")
async def get_seed_event_categories():
    """Get official event categories."""
    return {"categories": SEED_EVENT_CATEGORIES}

@router.get("/leadership")
async def get_seed_leadership():
    """Get leadership and HOD directory."""
    if db_manager.is_connected and db_manager.db is not None:
        lead_coll = db_manager.db[COLLECTIONS["leadership"]]
        count = await lead_coll.count_documents({})
        if count > 0:
            cursor = lead_coll.find({}, {"_id": 0})
            db_lead = await cursor.to_list(length=100)
            return {"source": "database", "total": len(db_lead), "leadership": db_lead}

    return {"source": "seed", "total": len(SEED_LEADERSHIP), "leadership": SEED_LEADERSHIP}

@router.get("/resources")
async def get_seed_resources():
    """Get resource inventory catalog."""
    if db_manager.is_connected and db_manager.db is not None:
        res_coll = db_manager.db[COLLECTIONS["resources"]]
        count = await res_coll.count_documents({})
        if count > 0:
            cursor = res_coll.find({}, {"_id": 0})
            db_res = await cursor.to_list(length=100)
            return {"source": "database", "total": len(db_res), "resources": db_res}

    return {"source": "seed", "total": len(SEED_RESOURCES), "resources": SEED_RESOURCES}
