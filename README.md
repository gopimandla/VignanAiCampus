# Vignan AI Campus EventOps
### AI-Powered Campus Event Management & Operations Platform
**Vignan's Foundation for Science, Technology and Research (VFSTR), Vadlamudi, Guntur**

---

## 🏛️ Project Overview
**Vignan AI Campus EventOps** is a modern, full-stack, AI-orchestrated campus event operations management system designed for Vignan University. It streamlines the lifecycle of university events—from natural language AI requirement analysis and multi-venue scheduling to resource conflict resolution, role-based multi-tier approvals, and campus-wide coordination.

---

## 🏗️ Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide React
- **Backend**: Python 3.10+, FastAPI, Pydantic v2, Motor / PyMongo (MongoDB Atlas)
- **AI Intelligence**: Anthropic Claude API (Multi-agent architecture)
- **Security**: JWT Authentication, Bcrypt password hashing, RBAC

---

## 🚀 Quick Start

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Set JWT_SECRET in .env to a unique, random value before starting the API.
uvicorn app.main:app --reload --port 8000
```
Backend API: `http://localhost:8000` (API Docs: `http://localhost:8000/docs`)

Demo accounts are not created with shared default passwords. To seed them on an empty database, set all four `SEED_*_PASSWORD` values in `backend/.env` first.

### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Frontend Web UI: `http://localhost:5173`
