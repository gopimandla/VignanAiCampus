import logging
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import settings

logger = logging.getLogger("uvicorn.error")

class Database:
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None
    is_connected: bool = False

db_manager = Database()

async def connect_to_mongo():
    """Establishes connection to MongoDB Atlas / Local MongoDB instance."""
    # Mask password for secure logging
    uri_display = settings.MONGODB_URI
    if "@" in uri_display:
        parts = uri_display.split("@")
        scheme = parts[0].split("://")[0]
        uri_display = f"{scheme}://****:****@{parts[1]}"
    logger.info(f"Connecting to MongoDB at {uri_display}...")

    try:
        db_manager.client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000
        )
        # Verify connection with ping
        await db_manager.client.admin.command('ping')
        db_manager.db = db_manager.client[settings.MONGODB_DB_NAME]
        db_manager.is_connected = True
        logger.info(f"Successfully connected to MongoDB Database: '{settings.MONGODB_DB_NAME}'")
    except Exception as e:
        db_manager.is_connected = False
        logger.error(f"MongoDB connection failed: {e}. System running in standby mode.")
        return

    # Trigger index creation & idempotent seeding in isolated block
    try:
        from app.seed.seed_service import ensure_database_indexes_and_seed
        await ensure_database_indexes_and_seed()
    except Exception as seed_err:
        logger.warning(f"Database connected, but master data seeding/indexing notice: {seed_err}")


async def close_mongo_connection():
    """Closes MongoDB connection pool gracefully."""
    if db_manager.client is not None:
        logger.info("Closing MongoDB connection...")
        db_manager.client.close()
        db_manager.is_connected = False
        logger.info("MongoDB connection closed.")

def get_database() -> AsyncIOMotorDatabase:
    """Returns the current MongoDB database instance."""
    return db_manager.db

def get_collection(name: str):
    """Helper to return a specific collection."""
    if db_manager.db is not None:
        return db_manager.db[name]
    return None

# Canonical collection names
COLLECTIONS = {
    "users": "users",
    "departments": "departments",
    "leadership": "leadership",
    "faculty": "faculty",
    "venues": "venues",
    "rooms": "rooms",
    "resources": "resources",
    "events": "events",
    "event_requests": "event_requests",
    "approvals": "approvals",
    "conflicts": "conflicts",
    "notifications": "notifications",
    "audit_logs": "audit_logs",
    "registrations": "registrations",
}
