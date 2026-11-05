import asyncio
import httpx
from app.main import app

prompts = [
    "Plan a 2-day hackathon for 500 students.",
    "Organize a cultural evening for 800 students.",
    "Conduct a technical seminar for 300 students with projector, microphones and Wi-Fi.",
    "Organize an NSS orientation for 250 volunteers.",
    "Plan an event for 50 students.",
    "Organize a large event for 1500 students."
]

async def run_tests():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        for idx, p in enumerate(prompts, 1):
            res = await client.post("/api/events/plan", json={"prompt": p})
            assert res.status_code == 200, f"Error {res.status_code}: {res.text}"
            data = res.json()
            event = data["event"]
            venue = data["selected_venue"]
            print(f"=== TEST {idx}: \"{p}\" ===")
            print(f"Title: {event['title']}")
            print(f"Category: {event['category']} | Type: {event['event_type']}")
            print(f"Participants: {event['expected_participants']} | Duration: {event['duration']}")
            print(f"Venue: {venue['venue_name']} (Cap: {venue['capacity']}, Score: {venue['suitability_score']}/100, Match: {venue['capacity_match']})")
            print(f"Resources Allocated: {len(data['resources'])} streams")
            print(f"Conflicts Detected: {len(data['conflicts'])} | Resolutions: {len(data['resolutions'])}")
            print(f"Schedule Milestones: {len(data['schedule'])}")
            print(f"Agent Traces: {[t['agent_name'] for t in data['agent_trace']]}")
            print(f"Status: {data['status']}")
            print()

if __name__ == "__main__":
    asyncio.run(run_tests())
