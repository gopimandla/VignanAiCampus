import asyncio

from app.database import connect_to_mongo, db_manager
from app.seed.campus_seed import (
    CAMPUS_INFO,
    SEED_VENUES,
    SEED_BLOCKS,
    SEED_LEADERSHIP,
    SEED_RESOURCES,
)


async def upsert_many(collection_name, documents, key_field):
    collection = db_manager.db[collection_name]

    inserted = 0
    updated = 0

    for document in documents:
        key = document[key_field]

        result = await collection.update_one(
            {key_field: key},
            {"$set": document},
            upsert=True
        )

        if result.upserted_id:
            inserted += 1
        else:
            updated += 1

    print(
        f"  {collection_name}: "
        f"{inserted} inserted, {updated} updated"
    )


async def seed_database():
    await connect_to_mongo()

    if not db_manager.is_connected:
        print("❌ MongoDB connection failed")
        return

    print("\n🌱 Starting Vignan campus database seed...")
    print(f"Database: {db_manager.db.name}\n")

    # Campus information
    await db_manager.db["campus_info"].update_one(
        {"short_name": CAMPUS_INFO["short_name"]},
        {"$set": CAMPUS_INFO},
        upsert=True
    )
    print("  campus_info: seeded")

    # Venues
    await upsert_many(
        "venues",
        SEED_VENUES,
        "id"
    )

    # Blocks
    await upsert_many(
        "blocks",
        SEED_BLOCKS,
        "block_id"
    )

    # Leadership / HODs
    await upsert_many(
        "leadership",
        SEED_LEADERSHIP,
        "id"
    )

    # Resources
    await upsert_many(
        "resources",
        SEED_RESOURCES,
        "id"
    )

    print("\n✅ Campus master data seeded successfully!")

    print("\n📦 Current collections:")

    collections = await db_manager.db.list_collection_names()

    for name in sorted(collections):
        count = await db_manager.db[name].count_documents({})
        print(f"  - {name}: {count} documents")

    db_manager.client.close()


if __name__ == "__main__":
    asyncio.run(seed_database())