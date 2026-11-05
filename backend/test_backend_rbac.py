import asyncio
import os
import httpx
from app.main import app

async def run_rbac_tests():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        print("=== 1. TEST STUDENT LOGIN ===")
        res_stu = await client.post("/api/auth/login", json={"email": "student@vignan.ac.in", "password": os.environ["SEED_STUDENT_PASSWORD"]})
        assert res_stu.status_code == 200, f"Student login failed: {res_stu.text}"
        stu_token = res_stu.json()["access_token"]
        print("[PASS] Student logged in successfully. Role:", res_stu.json()["user"]["role"])

        print("\n=== 2. TEST RBAC FORBIDDEN ON STUDENT ACCESSING ADMIN API ===")
        res_forbidden = await client.get("/api/admin/venues", headers={"Authorization": f"Bearer {stu_token}"})
        print(f"Status code received: {res_forbidden.status_code}")
        assert res_forbidden.status_code == 403, f"Expected 403 Forbidden, got {res_forbidden.status_code}"
        print("[PASS] Successfully received 403 Forbidden for Student accessing Admin API!")

        print("\n=== 3. TEST SUPER ADMIN LOGIN & ADMIN API ACCESS ===")
        res_admin = await client.post("/api/auth/login", json={"email": "superadmin@vignan.ac.in", "password": os.environ["SEED_SUPERADMIN_PASSWORD"]})
        assert res_admin.status_code == 200, f"Admin login failed: {res_admin.text}"
        admin_token = res_admin.json()["access_token"]
        print("[PASS] Super Admin logged in. Role:", res_admin.json()["user"]["role"])

        res_venues = await client.get("/api/admin/venues", headers={"Authorization": f"Bearer {admin_token}"})
        assert res_venues.status_code == 200, f"Admin venue get failed: {res_venues.text}"
        print(f"[PASS] Super Admin successfully fetched {len(res_venues.json()['venues'])} venues from Master Data!")

        print("\n=== 4. TEST PLAN REVALIDATION API ===")
        reval_req = {
            "title": "Modified Hackathon",
            "venue_name": "Sangamithra Seminar Hall",
            "expected_participants": 480,
            "date": "2026-08-28"
        }
        res_reval = await client.post("/api/events/revalidate", json=reval_req)
        assert res_reval.status_code == 200, f"Revalidation failed: {res_reval.text}"
        print("[PASS] Plan Revalidation result:", res_reval.json()["status"])

        print("\n=== 5. TEST AVAILABILITY FEED ===")
        res_avail = await client.get("/api/events/availability?date=2026-08-28")
        assert res_avail.status_code == 200, f"Availability failed: {res_avail.text}"
        print(f"[PASS] Venue availability feed generated for {len(res_avail.json()['venues_availability'])} venues.")

        print("\nALL BACKEND SECURITY & FUNCTIONAL TESTS PASSED SUCCESSFULLY! [OK]")

if __name__ == "__main__":
    asyncio.run(run_rbac_tests())
