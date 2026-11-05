import logging
from typing import List, Dict, Any
from app.database import db_manager, COLLECTIONS
from app.seed.campus_seed import (
    SEED_VENUES,
    SEED_RESOURCES,
    SEED_BLOCKS,
    SEED_LEADERSHIP
)

logger = logging.getLogger("uvicorn.error")

class CampusDataService:
    @staticmethod
    async def get_venues() -> List[Dict[str, Any]]:
        """Fetch all venues from MongoDB Atlas or fallback seed data."""
        if db_manager.is_connected and db_manager.db is not None:
            try:
                coll = db_manager.db[COLLECTIONS["venues"]]
                count = await coll.count_documents({})
                if count > 0:
                    cursor = coll.find({}, {"_id": 0})
                    return await cursor.to_list(length=100)
            except Exception as e:
                logger.error(f"Error fetching venues from MongoDB: {e}")
        return [dict(v) for v in SEED_VENUES]

    @staticmethod
    async def get_resources() -> List[Dict[str, Any]]:
        """Fetch all campus resources from MongoDB Atlas or fallback seed data."""
        if db_manager.is_connected and db_manager.db is not None:
            try:
                coll = db_manager.db[COLLECTIONS["resources"]]
                count = await coll.count_documents({})
                if count > 0:
                    cursor = coll.find({}, {"_id": 0})
                    return await cursor.to_list(length=100)
            except Exception as e:
                logger.error(f"Error fetching resources from MongoDB: {e}")
        return [dict(r) for r in SEED_RESOURCES]

    @staticmethod
    async def get_blocks() -> List[Dict[str, Any]]:
        """Fetch campus blocks and floor patterns."""
        return [dict(b) for b in SEED_BLOCKS]

    @staticmethod
    async def get_leadership() -> List[Dict[str, Any]]:
        """Fetch leadership directory from MongoDB Atlas or fallback seed data."""
        if db_manager.is_connected and db_manager.db is not None:
            try:
                coll = db_manager.db[COLLECTIONS["leadership"]]
                count = await coll.count_documents({})
                if count > 0:
                    cursor = coll.find({}, {"_id": 0})
                    return await cursor.to_list(length=100)
            except Exception as e:
                logger.error(f"Error fetching leadership from MongoDB: {e}")
        return [dict(l) for l in SEED_LEADERSHIP]

    @staticmethod
    async def get_existing_bookings() -> List[Dict[str, Any]]:
        """
        Fetch existing event bookings directly from MongoDB Atlas 'events' collection
        for real date/time conflict resolution.
        """
        if db_manager.is_connected and db_manager.db is not None:
            try:
                coll = db_manager.db[COLLECTIONS["events"]]
                count = await coll.count_documents({})
                if count > 0:
                    cursor = coll.find(
                        {"status": {"$in": ["Approved", "Confirmed", "Pending Approval"]}},
                        {"_id": 0}
                    )
                    return await cursor.to_list(length=200)
            except Exception as e:
                logger.error(f"Error fetching events from MongoDB Atlas: {e}")

        # Initial fallback seed events
        return [
            {
                "id": "ev-101",
                "title": "Srujanankura 2026 National Hackathon",
                "venue_id": "sangamithra-sh",
                "venue_name": "Sangamithra Seminar Hall",
                "date": "2026-08-28",
                "start_time": "09:00 AM",
                "end_time": "06:00 PM",
                "expected_participants": 500,
                "status": "Approved"
            },
            {
                "id": "ev-102",
                "title": "Beat The Street Cultural Showcase",
                "venue_id": "h-block-oat",
                "venue_name": "H Block Open Air Theatre (OAT)",
                "date": "2026-09-02",
                "start_time": "05:00 PM",
                "end_time": "09:30 PM",
                "expected_participants": 450,
                "status": "Approved"
            }
        ]
