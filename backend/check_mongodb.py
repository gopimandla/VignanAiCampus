import asyncio
from app.database import connect_to_mongo, db_manager

async def main():
    await connect_to_mongo()

    if not db_manager.is_connected:
        print("❌ MongoDB is NOT connected")
        return

    print("✅ MongoDB connected")
    print("Database:", db_manager.db.name)

    collections = await db_manager.db.list_collection_names()

    print("\nCollections:")
    for collection in collections:
        count = await db_manager.db[collection].count_documents({})
        print(f"  - {collection}: {count} documents")

    db_manager.client.close()

asyncio.run(main())