import bcrypt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from app.config import settings

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify password against bcrypt hash or plaintext fallback for seed accounts.
    Ensures existing users and seeded demo accounts authenticate reliably.
    """
    if not plain_password or not hashed_password:
        return False
    
    # Bcrypt hash formats: $2b$, $2a$, $2y$
    if hashed_password.startswith(("$2b$", "$2a$", "$2y$")):
        try:
            plain_bytes = plain_password.encode("utf-8")[:72]
            hash_bytes = hashed_password.encode("utf-8")
            return bcrypt.checkpw(plain_bytes, hash_bytes)
        except Exception:
            return False
    
    # Plaintext fallback for demo seed accounts
    return plain_password == hashed_password

def get_password_hash(password: str) -> str:
    """
    Generate a secure bcrypt password hash.
    Safely enforces 72-byte max length limit for bcrypt standard compliance.
    """
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        return None

