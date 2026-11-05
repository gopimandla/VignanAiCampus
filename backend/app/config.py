import os
from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "Vignan AI Campus EventOps"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    API_V1_STR: str = "/api"

    HOST: str = "0.0.0.0"
    PORT: int = 8000

    CORS_ORIGINS: Union[str, List[str]] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "https://vignan-ai-eventops.onrender.com",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return ["*"]

    # MongoDB Atlas Database Configuration
    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "vignan_eventops"

    # JWT Authentication
    # Set a unique, random value in the local .env file. Never use a committed default.
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # Optional demo account passwords; leave unset to avoid creating demo users.
    SEED_SUPERADMIN_PASSWORD: str = ""
    SEED_HOD_PASSWORD: str = ""
    SEED_ORGANIZER_PASSWORD: str = ""
    SEED_STUDENT_PASSWORD: str = ""

    # Anthropic API
    ANTHROPIC_API_KEY: str = ""
    ANTHROPIC_MODEL: str = "claude-3-5-sonnet-20241022"

    # Resource Pricing Catalog (Unit costs in INR ₹)
    RESOURCE_PRICING: dict = {
        "res-projectors": 1500.0,
        "res-microphones": 500.0,
        "res-speakers": 2500.0,
        "res-led-screens": 10000.0,
        "res-chairs": 40.0,
        "res-tables": 150.0,
        "res-laptops": 1000.0,
        "res-cameras": 3500.0,
        "res-generators": 8000.0,
        "res-wifi-support": 1200.0,
        "res-buses": 3000.0,
        "res-security": 800.0,
        "res-volunteers": 300.0,
        "logistics_overhead": 5000.0
    }

    # Campus Metadata
    CAMPUS_NAME: str = "Vignan's Foundation for Science, Technology and Research"
    CAMPUS_LOCATION: str = "Vadlamudi, Guntur, Andhra Pradesh"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

settings = Settings()
