import logging
from datetime import datetime
from app.database import db_manager, COLLECTIONS
from app.config import settings
from app.auth.security import get_password_hash
from app.seed.campus_seed import (
    SEED_VENUES,
    SEED_RESOURCES,
    SEED_LEADERSHIP,
    SEED_BLOCKS
)

logger = logging.getLogger("uvicorn.error")

_initial_user_specs = [
    {
        "id": "usr-superadmin",
        "name": "Dr. System Administrator",
        "email": "superadmin@vignan.ac.in",
        "password_env": "SEED_SUPERADMIN_PASSWORD",
        "role": "SUPER_ADMIN",
        "department": "University Administration",
        "is_active": True,
        "created_at": datetime.now().isoformat()
    },
    {
        "id": "usr-hod-cse",
        "name": "Dr. Venkatarama Phani Kumar",
        "email": "hod.cse@vignan.ac.in",
        "password_env": "SEED_HOD_PASSWORD",
        "role": "HOD",
        "department": "Computer Science and Engineering (CSE)",
        "is_active": True,
        "created_at": datetime.now().isoformat()
    },
    {
        "id": "usr-organizer",
        "name": "Campus Event Lead (SAC)",
        "email": "organizer@vignan.ac.in",
        "password_env": "SEED_ORGANIZER_PASSWORD",
        "role": "EVENT_ORGANIZER",
        "department": "Student Activity Center (SAC)",
        "is_active": True,
        "created_at": datetime.now().isoformat()
    },
    {
        "id": "usr-student",
        "name": "Sai Krishna (Student)",
        "email": "student@vignan.ac.in",
        "password_env": "SEED_STUDENT_PASSWORD",
        "role": "STUDENT",
        "department": "CSE - 3rd Year",
        "is_active": True,
        "created_at": datetime.now().isoformat()
    }
]

# Demo accounts are created only when an operator supplies every password in .env.
INITIAL_USERS = [
    {**{key: value for key, value in user.items() if key != "password_env"},
     "password": get_password_hash(getattr(settings, user["password_env"]))}
    for user in _initial_user_specs
] if all(getattr(settings, user["password_env"]) for user in _initial_user_specs) else []

INITIAL_EVENTS = [
    {
        "id": "ev-101",
        "title": "Srujanankura 2026 National Hackathon",
        "category": "Technical",
        "event_type": "Hackathon",
        "venue_id": "sangamithra-sh",
        "venue_name": "Sangamithra Seminar Hall",
        "date": "2026-08-28",
        "dates_label": "Aug 28-29, 2026",
        "start_time": "09:00 AM",
        "end_time": "06:00 PM",
        "expected_participants": 500,
        "budget": 100000.0,
        "estimated_cost": 82500.0,
        "remaining_budget": 17500.0,
        "budget_status": "WITHIN_BUDGET",
        "organizer": "Dept of CSE & SAC",
        "organizer_email": "hod.cse@vignan.ac.in",
        "host_department": "Computer Science and Engineering (CSE)",
        "status": "Approved",
        "approval_tier": "Approved by Institutional Dean & HOD",
        "conflict_status": "None",
        "description": "36-Hour continuous national-level hackathon with tracks on Generative AI, IoT, and Cloud Computing.",
        "registered_students_count": 420,
        "is_published": True,
        "created_by_user_id": "usr-hod-cse",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    },
    {
        "id": "ev-102",
        "title": "Beat The Street Cultural Showcase",
        "category": "Cultural / Major",
        "event_type": "Cultural Fest",
        "venue_id": "h-block-oat",
        "venue_name": "H Block Open Air Theatre (OAT)",
        "date": "2026-09-02",
        "dates_label": "Sep 02, 2026",
        "start_time": "05:00 PM",
        "end_time": "09:30 PM",
        "expected_participants": 450,
        "budget": 75000.0,
        "estimated_cost": 62000.0,
        "remaining_budget": 13000.0,
        "budget_status": "WITHIN_BUDGET",
        "organizer": "Music & Dance Club (SAC)",
        "organizer_email": "organizer@vignan.ac.in",
        "host_department": "Student Activity Center (SAC)",
        "status": "Approved",
        "approval_tier": "Approved by SAC Dean",
        "conflict_status": "Weather Watch Active",
        "description": "Annual live acoustic orchestra, student band battles, and classical dance performances.",
        "registered_students_count": 380,
        "is_published": True,
        "created_by_user_id": "usr-organizer",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    },
    {
        "id": "ev-103",
        "title": "AI & Quantum Computing Symposium",
        "category": "Academic / Workshop",
        "event_type": "Technical Seminar",
        "venue_id": "srujana-sh",
        "venue_name": "Srujana Seminar Hall",
        "date": "2026-09-05",
        "dates_label": "Sep 05, 2026",
        "start_time": "09:30 AM",
        "end_time": "04:30 PM",
        "expected_participants": 380,
        "budget": 50000.0,
        "estimated_cost": 45000.0,
        "remaining_budget": 5000.0,
        "budget_status": "WITHIN_BUDGET",
        "organizer": "Dept of IT",
        "organizer_email": "hod.it@vignan.ac.in",
        "host_department": "Information Technology (IT)",
        "status": "Pending Approval",
        "approval_tier": "Submitted to HOD IT",
        "conflict_status": "None",
        "description": "Distinguished keynote sessions from international researchers on Quantum algorithms and LLM architecture.",
        "registered_students_count": 190,
        "is_published": False,
        "created_by_user_id": "usr-organizer",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
]

INITIAL_DEPARTMENTS = [
    {"id": "dept-cse", "name": "Computer Science and Engineering", "code": "CSE", "hod": "Dr. Venkatarama Phani Kumar Sistla", "faculty_count": 48},
    {"id": "dept-ece", "name": "Electronics and Communication Engineering", "code": "ECE", "hod": "Dr. N. Usha Rani", "faculty_count": 42},
    {"id": "dept-eee", "name": "Electrical and Electronics Engineering", "code": "EEE", "hod": "Dr. G. Srinivasa Rao", "faculty_count": 30},
    {"id": "dept-mech", "name": "Mechanical Engineering", "code": "MECH", "hod": "Dr. M. Rama Krishna", "faculty_count": 32},
    {"id": "dept-it", "name": "Information Technology", "code": "IT", "hod": "Dr. A. Rama Swamy Reddy", "faculty_count": 28},
    {"id": "dept-chem", "name": "Chemical Engineering", "code": "CHEM", "hod": "Dr. M. Ramesh Naidu", "faculty_count": 18},
    {"id": "dept-bme", "name": "Biomedical Engineering", "code": "BME", "hod": "Dr. G. Sitaramanjaneya Reddy", "faculty_count": 16},
    {"id": "dept-pharm", "name": "Pharmacy", "code": "PHARM", "hod": "Dr. Ch. Jithendra", "faculty_count": 22},
    {"id": "dept-snh", "name": "Science & Humanities", "code": "S&H", "hod": "Dr. N. Srinivasu", "faculty_count": 55},
    {"id": "dept-mba", "name": "Management Studies", "code": "MBA", "hod": "Mr. D. Vijaya Krishna", "faculty_count": 20}
]

async def ensure_database_indexes_and_seed():
    """Ensure required indexes exist and seed master data idempotently on startup."""
    if not db_manager.is_connected or db_manager.db is None:
        logger.warning("Database not connected. Skipping index creation and seeding.")
        return

    logger.info("Initializing MongoDB Atlas indexes and campus master data...")

    try:
        # 1. Create Indexes
        users_coll = db_manager.db[COLLECTIONS["users"]]
        await users_coll.create_index("email", unique=True)

        events_coll = db_manager.db[COLLECTIONS["events"]]
        await events_coll.create_index([("venue_id", 1), ("date", 1)])
        await events_coll.create_index([("venue_id", 1), ("date", 1), ("start_time", 1), ("end_time", 1)])
        await events_coll.create_index("status")
        await events_coll.create_index("created_by_user_id")

        conflicts_coll = db_manager.db[COLLECTIONS["conflicts"]]
        await conflicts_coll.create_index([("event_id", 1), ("date", 1), ("venue_id", 1)])

        registrations_coll = db_manager.db[COLLECTIONS["registrations"] if "registrations" in COLLECTIONS else "registrations"]
        await registrations_coll.create_index([("event_id", 1), ("student_id", 1)], unique=True)

        logger.info("MongoDB Atlas indexes created successfully.")

        # 2. Idempotent Seeding: Seed only if collections are empty
        # Users
        if await users_coll.count_documents({}) == 0:
            logger.info("Seeding initial campus users into MongoDB Atlas...")
            await users_coll.insert_many(INITIAL_USERS)

        # Venues
        venues_coll = db_manager.db[COLLECTIONS["venues"]]
        if await venues_coll.count_documents({}) == 0:
            logger.info("Seeding campus venues into MongoDB Atlas...")
            await venues_coll.insert_many([dict(v) for v in SEED_VENUES])

        # Resources
        resources_coll = db_manager.db[COLLECTIONS["resources"]]
        if await resources_coll.count_documents({}) == 0:
            logger.info("Seeding campus resources into MongoDB Atlas...")
            await resources_coll.insert_many([dict(r) for r in SEED_RESOURCES])

        # Leadership
        leadership_coll = db_manager.db[COLLECTIONS["leadership"]]
        if await leadership_coll.count_documents({}) == 0:
            logger.info("Seeding campus leadership directory into MongoDB Atlas...")
            await leadership_coll.insert_many([dict(l) for l in SEED_LEADERSHIP])

        # Departments
        departments_coll = db_manager.db[COLLECTIONS["departments"]]
        if await departments_coll.count_documents({}) == 0:
            logger.info("Seeding academic departments into MongoDB Atlas...")
            await departments_coll.insert_many(INITIAL_DEPARTMENTS)

        # Events
        if await events_coll.count_documents({}) == 0:
            logger.info("Seeding initial events into MongoDB Atlas...")
            await events_coll.insert_many(INITIAL_EVENTS)

        logger.info("MongoDB Atlas master data initialization complete.")

    except Exception as e:
        logger.error(f"Error during database index creation or seeding: {e}", exc_info=True)
