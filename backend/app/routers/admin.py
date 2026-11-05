import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.auth.rbac import require_role
from app.database import db_manager, COLLECTIONS
from app.seed.campus_seed import (
    SEED_VENUES,
    SEED_RESOURCES,
    SEED_LEADERSHIP
)

logger = logging.getLogger("uvicorn.error")

router = APIRouter(
    prefix="/admin",
    tags=["Super Admin Master Data Console"],
    dependencies=[Depends(require_role(["SUPER_ADMIN"]))]
)

async def record_audit_log(actor: str, action: str, details: str):
    log_entry = {
        "id": f"log-{int(datetime.now().timestamp() * 1000)}",
        "timestamp": datetime.now().isoformat(),
        "actor": actor,
        "action": action,
        "details": details
    }
    if db_manager.is_connected and db_manager.db is not None:
        try:
            coll = db_manager.db[COLLECTIONS["audit_logs"]]
            await coll.insert_one(log_entry)
        except Exception as e:
            logger.error(f"Failed to record audit log in MongoDB: {e}")

# -------------------------------------------------------------
# 1. VENUES CRUD (MONGODB ATLAS PERSISTED)
# -------------------------------------------------------------

class VenueCreate(BaseModel):
    name: str
    category: str
    block: str
    capacity: int
    ac: bool = True
    av_equipped: bool = True
    suitable_for: List[str] = ["Events", "Seminars"]
    description: str = "Campus venue"

@router.get("/venues")
async def get_all_venues():
    """Retrieve full venue master catalog from MongoDB Atlas."""
    if db_manager.is_connected and db_manager.db is not None:
        try:
            coll = db_manager.db[COLLECTIONS["venues"]]
            cursor = coll.find({}, {"_id": 0})
            venues = await cursor.to_list(length=200)
            if venues:
                return {"venues": venues, "total": len(venues)}
        except Exception as e:
            logger.error(f"Error fetching admin venues from MongoDB Atlas: {e}")
    return {"venues": [dict(v) for v in SEED_VENUES], "total": len(SEED_VENUES)}

@router.post("/venues", status_code=status.HTTP_201_CREATED)
async def create_venue(venue: VenueCreate, current_user: dict = Depends(require_role(["SUPER_ADMIN"]))):
    """Add a new campus venue to MongoDB Atlas master data."""
    v_id = f"venue-{int(datetime.now().timestamp() * 1000)}"
    new_v = {
        "id": v_id,
        "name": venue.name,
        "category": venue.category,
        "block": venue.block,
        "capacity": venue.capacity,
        "ac": venue.ac,
        "av_equipped": venue.av_equipped,
        "suitable_for": venue.suitable_for,
        "status": "available",
        "description": venue.description
    }
    if db_manager.is_connected and db_manager.db is not None:
        try:
            coll = db_manager.db[COLLECTIONS["venues"]]
            await coll.insert_one(new_v)
            await record_audit_log(current_user.get("name", "Super Admin"), "Create Venue", f"Created venue '{venue.name}' (Cap: {venue.capacity})")
        except Exception as e:
            logger.error(f"Error creating venue in MongoDB Atlas: {e}")
            raise HTTPException(status_code=500, detail="Failed to save venue in MongoDB database")

    new_v.pop("_id", None)
    return {"message": "Venue successfully created in MongoDB Atlas", "venue": new_v}

@router.put("/venues/{venue_id}")
async def update_venue(venue_id: str, venue: VenueCreate, current_user: dict = Depends(require_role(["SUPER_ADMIN"]))):
    """Update an existing campus venue in MongoDB Atlas."""
    update_data = {
        "name": venue.name,
        "category": venue.category,
        "block": venue.block,
        "capacity": venue.capacity,
        "ac": venue.ac,
        "av_equipped": venue.av_equipped,
        "suitable_for": venue.suitable_for,
        "description": venue.description
    }
    if db_manager.is_connected and db_manager.db is not None:
        try:
            coll = db_manager.db[COLLECTIONS["venues"]]
            res = await coll.find_one_and_update(
                {"id": venue_id},
                {"$set": update_data},
                return_document=True,
                projection={"_id": 0}
            )
            if res:
                await record_audit_log(current_user.get("name", "Super Admin"), "Update Venue", f"Updated venue '{venue.name}'")
                return {"message": "Venue updated successfully in MongoDB Atlas", "venue": res}
        except Exception as e:
            logger.error(f"Error updating venue in MongoDB Atlas: {e}")

    raise HTTPException(status_code=404, detail="Venue not found")

@router.delete("/venues/{venue_id}")
async def delete_venue(venue_id: str, current_user: dict = Depends(require_role(["SUPER_ADMIN"]))):
    """Delete a campus venue from MongoDB Atlas master data."""
    if db_manager.is_connected and db_manager.db is not None:
        try:
            coll = db_manager.db[COLLECTIONS["venues"]]
            v = await coll.find_one({"id": venue_id})
            if v:
                await coll.delete_one({"id": venue_id})
                await record_audit_log(current_user.get("name", "Super Admin"), "Delete Venue", f"Deleted venue '{v['name']}'")
                return {"message": f"Venue '{v['name']}' deleted successfully from MongoDB Atlas"}
        except Exception as e:
            logger.error(f"Error deleting venue in MongoDB Atlas: {e}")

    raise HTTPException(status_code=404, detail="Venue not found")

# -------------------------------------------------------------
# 2. RESOURCES CRUD (MONGODB ATLAS PERSISTED)
# -------------------------------------------------------------

class ResourceCreate(BaseModel):
    name: str
    category: str
    total_quantity: int
    available_quantity: int
    unit: str = "units"
    unit_cost: Optional[float] = 100.0

@router.get("/resources")
async def get_all_resources():
    """Retrieve full resource master catalog from MongoDB Atlas."""
    if db_manager.is_connected and db_manager.db is not None:
        try:
            coll = db_manager.db[COLLECTIONS["resources"]]
            cursor = coll.find({}, {"_id": 0})
            resources = await cursor.to_list(length=200)
            if resources:
                return {"resources": resources, "total": len(resources)}
        except Exception as e:
            logger.error(f"Error fetching resources from MongoDB Atlas: {e}")
    return {"resources": [dict(r) for r in SEED_RESOURCES], "total": len(SEED_RESOURCES)}

@router.post("/resources", status_code=status.HTTP_201_CREATED)
async def create_resource(res: ResourceCreate, current_user: dict = Depends(require_role(["SUPER_ADMIN"]))):
    """Add a new resource stream to campus inventory in MongoDB Atlas."""
    r_id = f"res-{int(datetime.now().timestamp() * 1000)}"
    new_r = {
        "id": r_id,
        "name": res.name,
        "category": res.category,
        "total_quantity": res.total_quantity,
        "available_quantity": res.available_quantity,
        "unit": res.unit,
        "unit_cost": res.unit_cost or 100.0,
        "editable": True
    }
    if db_manager.is_connected and db_manager.db is not None:
        try:
            coll = db_manager.db[COLLECTIONS["resources"]]
            await coll.insert_one(new_r)
            await record_audit_log(current_user.get("name", "Super Admin"), "Create Resource", f"Created resource '{res.name}' ({res.total_quantity} {res.unit})")
        except Exception as e:
            logger.error(f"Error creating resource in MongoDB Atlas: {e}")

    new_r.pop("_id", None)
    return {"message": "Resource created successfully in MongoDB Atlas", "resource": new_r}

@router.put("/resources/{res_id}")
async def update_resource(res_id: str, res: ResourceCreate, current_user: dict = Depends(require_role(["SUPER_ADMIN"]))):
    """Update inventory quantity and details for a campus resource in MongoDB Atlas."""
    update_data = {
        "name": res.name,
        "category": res.category,
        "total_quantity": res.total_quantity,
        "available_quantity": res.available_quantity,
        "unit": res.unit,
        "unit_cost": res.unit_cost or 100.0
    }
    if db_manager.is_connected and db_manager.db is not None:
        try:
            coll = db_manager.db[COLLECTIONS["resources"]]
            result = await coll.find_one_and_update(
                {"id": res_id},
                {"$set": update_data},
                return_document=True,
                projection={"_id": 0}
            )
            if result:
                await record_audit_log(current_user.get("name", "Super Admin"), "Update Resource", f"Updated resource '{res.name}'")
                return {"message": "Resource updated successfully in MongoDB Atlas", "resource": result}
        except Exception as e:
            logger.error(f"Error updating resource in MongoDB Atlas: {e}")

    raise HTTPException(status_code=404, detail="Resource not found")

@router.delete("/resources/{res_id}")
async def delete_resource(res_id: str, current_user: dict = Depends(require_role(["SUPER_ADMIN"]))):
    """Delete a resource stream from inventory in MongoDB Atlas."""
    if db_manager.is_connected and db_manager.db is not None:
        try:
            coll = db_manager.db[COLLECTIONS["resources"]]
            r = await coll.find_one({"id": res_id})
            if r:
                await coll.delete_one({"id": res_id})
                await record_audit_log(current_user.get("name", "Super Admin"), "Delete Resource", f"Deleted resource '{r['name']}'")
                return {"message": f"Resource '{r['name']}' deleted successfully from MongoDB Atlas"}
        except Exception as e:
            logger.error(f"Error deleting resource in MongoDB Atlas: {e}")

    raise HTTPException(status_code=404, detail="Resource not found")

# -------------------------------------------------------------
# 3. FACULTY CRUD (MONGODB ATLAS PERSISTED)
# -------------------------------------------------------------

class FacultyCreate(BaseModel):
    name: str
    designation: str
    department: str
    email: str
    qualifications: str = "Ph.D."
    status: str = "Active"

@router.get("/faculty")
async def get_all_faculty():
    """Retrieve campus faculty directory from MongoDB Atlas."""
    if db_manager.is_connected and db_manager.db is not None:
        try:
            coll = db_manager.db[COLLECTIONS["faculty"]]
            cursor = coll.find({}, {"_id": 0})
            faculty_list = await cursor.to_list(length=200)
            if faculty_list:
                return {"faculty": faculty_list, "total": len(faculty_list)}
        except Exception as e:
            logger.error(f"Error fetching faculty from MongoDB Atlas: {e}")
    return {"faculty": [], "total": 0}

@router.post("/faculty", status_code=status.HTTP_201_CREATED)
async def create_faculty(fac: FacultyCreate, current_user: dict = Depends(require_role(["SUPER_ADMIN"]))):
    """Add a faculty coordinator to MongoDB Atlas directory."""
    f_id = f"fac-{int(datetime.now().timestamp() * 1000)}"
    new_f = {
        "id": f_id,
        "name": fac.name,
        "designation": fac.designation,
        "department": fac.department,
        "email": fac.email,
        "qualifications": fac.qualifications,
        "status": fac.status
    }
    if db_manager.is_connected and db_manager.db is not None:
        try:
            coll = db_manager.db[COLLECTIONS["faculty"]]
            await coll.insert_one(new_f)
            await record_audit_log(current_user.get("name", "Super Admin"), "Create Faculty", f"Added faculty '{fac.name}' ({fac.department})")
        except Exception as e:
            logger.error(f"Error saving faculty to MongoDB Atlas: {e}")

    new_f.pop("_id", None)
    return {"message": "Faculty added successfully in MongoDB Atlas", "faculty": new_f}

@router.put("/faculty/{fac_id}")
async def update_faculty(fac_id: str, fac: FacultyCreate, current_user: dict = Depends(require_role(["SUPER_ADMIN"]))):
    """Update faculty details in MongoDB Atlas."""
    update_data = {
        "name": fac.name,
        "designation": fac.designation,
        "department": fac.department,
        "email": fac.email,
        "qualifications": fac.qualifications,
        "status": fac.status
    }
    if db_manager.is_connected and db_manager.db is not None:
        try:
            coll = db_manager.db[COLLECTIONS["faculty"]]
            res = await coll.find_one_and_update(
                {"id": fac_id},
                {"$set": update_data},
                return_document=True,
                projection={"_id": 0}
            )
            if res:
                await record_audit_log(current_user.get("name", "Super Admin"), "Update Faculty", f"Updated faculty '{fac.name}'")
                return {"message": "Faculty updated successfully in MongoDB Atlas", "faculty": res}
        except Exception as e:
            logger.error(f"Error updating faculty in MongoDB Atlas: {e}")

    raise HTTPException(status_code=404, detail="Faculty member not found")

@router.delete("/faculty/{fac_id}")
async def delete_faculty(fac_id: str, current_user: dict = Depends(require_role(["SUPER_ADMIN"]))):
    """Remove faculty member from MongoDB Atlas."""
    if db_manager.is_connected and db_manager.db is not None:
        try:
            coll = db_manager.db[COLLECTIONS["faculty"]]
            f = await coll.find_one({"id": fac_id})
            if f:
                await coll.delete_one({"id": fac_id})
                await record_audit_log(current_user.get("name", "Super Admin"), "Delete Faculty", f"Removed faculty '{f['name']}'")
                return {"message": f"Faculty '{f['name']}' deleted from MongoDB Atlas"}
        except Exception as e:
            logger.error(f"Error deleting faculty in MongoDB Atlas: {e}")

    raise HTTPException(status_code=404, detail="Faculty member not found")

# -------------------------------------------------------------
# 4. DEPARTMENTS CRUD & AUDIT LOGS (MONGODB ATLAS PERSISTED)
# -------------------------------------------------------------

class DepartmentCreate(BaseModel):
    name: str
    code: str
    hod: str
    faculty_count: int = 25

@router.get("/departments")
async def get_all_departments():
    """Retrieve university departments from MongoDB Atlas."""
    if db_manager.is_connected and db_manager.db is not None:
        try:
            coll = db_manager.db[COLLECTIONS["departments"]]
            cursor = coll.find({}, {"_id": 0})
            departments = await cursor.to_list(length=200)
            if departments:
                return {"departments": departments, "total": len(departments)}
        except Exception as e:
            logger.error(f"Error fetching departments from MongoDB Atlas: {e}")
    return {"departments": [], "total": 0}

@router.post("/departments", status_code=status.HTTP_201_CREATED)
async def create_department(dept: DepartmentCreate, current_user: dict = Depends(require_role(["SUPER_ADMIN"]))):
    """Add a new university academic department in MongoDB Atlas."""
    d_id = f"dept-{dept.code.lower()}"
    new_d = {
        "id": d_id,
        "name": dept.name,
        "code": dept.code,
        "hod": dept.hod,
        "faculty_count": dept.faculty_count
    }
    if db_manager.is_connected and db_manager.db is not None:
        try:
            coll = db_manager.db[COLLECTIONS["departments"]]
            await coll.insert_one(new_d)
            await record_audit_log(current_user.get("name", "Super Admin"), "Create Department", f"Created department '{dept.name}' ({dept.code})")
        except Exception as e:
            logger.error(f"Error saving department to MongoDB Atlas: {e}")

    new_d.pop("_id", None)
    return {"message": "Department created successfully in MongoDB Atlas", "department": new_d}

@router.get("/audit-logs")
async def get_audit_logs():
    """Retrieve security audit logs from MongoDB Atlas."""
    if db_manager.is_connected and db_manager.db is not None:
        try:
            coll = db_manager.db[COLLECTIONS["audit_logs"]]
            cursor = coll.find({}, {"_id": 0}).sort("timestamp", -1)
            logs = await cursor.to_list(length=200)
            if logs:
                return {"audit_logs": logs, "total": len(logs)}
        except Exception as e:
            logger.error(f"Error fetching audit logs from MongoDB Atlas: {e}")

    return {"audit_logs": [], "total": 0}
