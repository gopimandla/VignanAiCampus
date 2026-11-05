import logging
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from app.auth.security import create_access_token, verify_password, get_password_hash
from app.auth.rbac import get_current_user, get_user_by_email, ALLOWED_ROLES, DEFAULT_USERS
from app.database import db_manager, COLLECTIONS

logger = logging.getLogger("uvicorn.error")

router = APIRouter(prefix="/auth", tags=["Authentication & RBAC"])

class LoginRequest(BaseModel):
    email: str
    password: str
    role: Optional[str] = None

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str
    department: Optional[str] = "VFSTR Vadlamudi"

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

@router.post("/login", response_model=AuthResponse)
async def login(req: LoginRequest):
    """Authenticate user with email/password against MongoDB Atlas and issue JWT bearer token."""
    email_clean = req.email.lower().strip()
    if not email_clean:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address is required."
        )

    user = await get_user_by_email(email_clean)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email credentials. User account does not exist in MongoDB database."
        )

    if not verify_password(req.password, user.get("password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password provided. Please verify your credentials."
        )

    token_data = {
        "sub": user["email"],
        "id": user.get("id", f"usr-{user['email']}"),
        "name": user["name"],
        "role": user["role"],
        "department": user.get("department", "VFSTR Vadlamudi")
    }
    token = create_access_token(token_data)

    safe_user = {
        "id": token_data["id"],
        "name": token_data["name"],
        "email": token_data["sub"],
        "role": token_data["role"],
        "department": token_data["department"]
    }

    return AuthResponse(access_token=token, user=safe_user)

@router.post("/register", response_model=AuthResponse)
async def register(req: RegisterRequest):
    """Register a new student or event organizer in MongoDB Atlas."""
    # 1. Strict Role Registration Security: Only STUDENT and EVENT_ORGANIZER allowed for public registration
    if req.role not in ["STUDENT", "EVENT_ORGANIZER"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Public registration is only permitted for 'STUDENT' and 'EVENT_ORGANIZER' roles. Super Admin and HOD accounts must be provisioned by administration."
        )

    # 2. Input Validation and Normalization
    name_clean = req.name.strip()
    if not name_clean:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Full name is required."
        )

    email_clean = req.email.lower().strip()
    if not email_clean or "@" not in email_clean:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid email address is required."
        )

    if not req.password or len(req.password.strip()) < 4:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 4 characters long."
        )

    # 3. Check for Seed Users Duplicate before DB
    for u in DEFAULT_USERS:
        if u["email"].lower() == email_clean:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email address already exists in the campus database."
            )

    # 4. Check database connectivity
    if not db_manager.is_connected or db_manager.db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is currently unavailable. Please try again."
        )

    # 5. Check for Duplicate Email in MongoDB Atlas
    coll = db_manager.db[COLLECTIONS["users"]]
    try:
        existing = await coll.find_one({"email": email_clean})
    except Exception as e:
        logger.error(f"Error checking existing user in MongoDB Atlas: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is currently unavailable. Please try again."
        )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists in the campus database."
        )

    for u in DEFAULT_USERS:
        if u["email"].lower() == email_clean:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email address already exists in the campus database."
            )

    # 5. Construct New User Document with Hashed Password
    user_id = f"usr-{int(datetime.now().timestamp() * 1000)}"
    now_iso = datetime.now().isoformat()
    new_user = {
        "id": user_id,
        "name": name_clean,
        "email": email_clean,
        "password": get_password_hash(req.password),
        "role": req.role,
        "department": req.department.strip() if req.department else "VFSTR Vadlamudi",
        "is_active": True,
        "created_at": now_iso
    }

    # 6. Insert into MongoDB Atlas users collection
    try:
        insert_result = await coll.insert_one(new_user)
        if not insert_result.inserted_id:
            raise Exception("Database insertion failed to return an ID.")
        logger.info(f"Successfully registered user '{email_clean}' (Role: {req.role}) into MongoDB Atlas.")
    except Exception as e:
        logger.error(f"Error persisting registered user to MongoDB Atlas: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server/database error occurred while saving user. Please try again."
        )

    # 7. Issue JWT and Return Safe User Object (Never expose password/hash)
    token_data = {
        "sub": new_user["email"],
        "id": new_user["id"],
        "name": new_user["name"],
        "role": new_user["role"],
        "department": new_user["department"]
    }
    token = create_access_token(token_data)

    safe_user = {
        "id": new_user["id"],
        "name": new_user["name"],
        "email": new_user["email"],
        "role": new_user["role"],
        "department": new_user["department"]
    }

    return AuthResponse(access_token=token, user=safe_user)

@router.get("/me")
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    """Retrieve authenticated user's profile and active role permissions."""
    return {
        "user": {
            "id": current_user.get("id"),
            "name": current_user.get("name"),
            "email": current_user.get("email"),
            "role": current_user.get("role"),
            "department": current_user.get("department")
        },
        "permissions": {
            "can_modify_master_data": current_user.get("role") == "SUPER_ADMIN",
            "can_plan_events": current_user.get("role") in ["SUPER_ADMIN", "HOD", "EVENT_ORGANIZER"],
            "can_approve_events": current_user.get("role") in ["SUPER_ADMIN", "HOD"],
            "is_student_view": current_user.get("role") == "STUDENT"
        }
    }

@router.get("/roles")
async def list_available_roles():
    """List the 4 supported login roles with descriptions."""
    return {
        "roles": [
            {"role": "SUPER_ADMIN", "title": "Super Admin", "description": "Full Master Data Console & Campus Operations Oversight"},
            {"role": "HOD", "title": "Head of Department", "description": "Department Event Operations, Faculty Coordination & Approvals"},
            {"role": "EVENT_ORGANIZER", "title": "Event Organizer", "description": "AI Event Planning, Blueprint Editing & Event Management"},
            {"role": "STUDENT", "title": "Student Participant", "description": "Campus Events Feed, Schedule & Event Registrations"}
        ]
    }

