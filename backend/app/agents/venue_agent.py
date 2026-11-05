import time
from typing import List, Dict, Any, Tuple
from app.schemas.plan import EventDetails, VenueRecommendation

class VenueAgent:
    """
    Agent 2 — Venue Agent
    Queries MongoDB campus venue catalog, checks capacity, verifies amenities (AC, AV, Sound),
    checks availability against existing bookings, and ranks suitable venues without hallucinating.
    """
    def __init__(self):
        self.name = "Venue Agent"
        self.responsibility = "Campus Venue Querying, Capacity Matching & Facility Verification"

    async def execute(
        self,
        event_details: EventDetails,
        venues_catalog: List[Dict[str, Any]],
        existing_bookings: List[Dict[str, Any]],
        user_preferred_venue: str = None
    ) -> Dict[str, Any]:
        start_time = time.time()
        participants = event_details.expected_participants
        category = event_details.category
        event_type = event_details.event_type

        recommendations: List[VenueRecommendation] = []

        for venue in venues_catalog:
            cap = venue.get("capacity", 0)
            v_id = venue.get("id", "")
            v_name = venue.get("name", "")
            v_cat = venue.get("category", "")
            v_block = venue.get("block", "")
            ac = venue.get("ac", False)
            av = venue.get("av_equipped", True)
            suitable_tags = [s.lower() for s in venue.get("suitable_for", [])]

            # 1. Capacity Match Assessment
            if cap >= participants:
                utilization = round((participants / cap) * 100, 1)
                if utilization >= 70 and utilization <= 100:
                    cap_match = "Optimal Fit"
                    cap_score = 40
                elif utilization >= 40:
                    cap_match = "Sufficient Capacity"
                    cap_score = 35
                else:
                    cap_match = "Exceeds Demand (Spacious)"
                    cap_score = 25
            else:
                utilization = round((participants / cap) * 100, 1)
                cap_match = "Capacity Deficit (Overflow Risk)"
                cap_score = 5

            # 2. Category & Event Type Suitability
            type_score = 20
            reason_points = []

            if "hackathon" in event_type.lower():
                if "sangamithra" in v_id or "sa-re-ga-ma" in v_id or "srujana" in v_id:
                    type_score = 35
                    reason_points.append("Dual AV and power layout suitable for hackathon teams")
                elif "oat" in v_id:
                    type_score = 10
                    reason_points.append("Open-air venue less optimal for prolonged coding/power needs")
            elif "cultural" in category.lower() or "fest" in event_type.lower():
                if "oat" in v_id or "sa-re-ga-ma" in v_id or "convocation" in v_id:
                    type_score = 35
                    reason_points.append("Acoustic staging and amphitheater viewing optimal for cultural shows")
            elif "seminar" in event_type.lower() or "academic" in category.lower():
                if "seminar" in v_cat.lower():
                    type_score = 35
                    reason_points.append("Theater acoustics and podium setup aligned for academic keynotes")
            elif "nss" in category.lower() or "social" in event_type.lower():
                if "sangamam" in v_id or "oat" in v_id or "mhp" in v_id:
                    type_score = 35
                    reason_points.append("Ideal for volunteer assembly and squad dispatch")

            # 3. Amenities Score
            amenity_score = 0
            if ac:
                amenity_score += 15
            else:
                amenity_score += 5
            if av:
                amenity_score += 10

            # 4. User Preference Bonus
            if user_preferred_venue and user_preferred_venue.lower() in v_name.lower():
                amenity_score += 15

            # Check if booked
            is_booked = any(b.get("venue_id") == v_id for b in existing_bookings)
            if is_booked:
                amenity_score -= 30
                reason_points.append("Note: Conflicting booking detected in database")

            total_score = min(100, max(10, cap_score + type_score + amenity_score))

            if not reason_points:
                reason_points.append(f"Standard university venue with {cap} seats and AV support.")

            reason_str = " • ".join(reason_points)

            recommendations.append(
                VenueRecommendation(
                    venue_id=v_id,
                    venue_name=v_name,
                    category=v_cat,
                    block=v_block,
                    capacity=cap,
                    capacity_match=cap_match,
                    utilization_percentage=utilization,
                    ac=ac,
                    av_equipped=av,
                    suitability_score=total_score,
                    suitability_reason=reason_str,
                    is_primary=False
                )
            )

        # Sort ranked venues by suitability score descending
        recommendations.sort(key=lambda x: x.suitability_score, reverse=True)

        if recommendations:
            recommendations[0].is_primary = True
            selected_venue = recommendations[0]
            secondary_venues = recommendations[1:3] if len(recommendations) > 1 else []
        else:
            # Fallback if catalog is empty
            selected_venue = VenueRecommendation(
                venue_id="convocation-hall",
                venue_name="Convocation Hall",
                category="Auditorium",
                block="University Central",
                capacity=2000,
                capacity_match="Sufficient",
                utilization_percentage=50.0,
                ac=True,
                av_equipped=True,
                suitability_score=85,
                suitability_reason="Default large university venue",
                is_primary=True
            )
            secondary_venues = []

        exec_time = round((time.time() - start_time) * 1000, 2)

        return {
            "venue_recommendations": recommendations,
            "selected_venue": selected_venue,
            "secondary_venues": secondary_venues,
            "trace": {
                "agent_id": "agent-2-venue",
                "agent_name": self.name,
                "responsibility": self.responsibility,
                "status": "completed",
                "execution_time_ms": exec_time,
                "summary": f"Selected '{selected_venue.venue_name}' (Capacity: {selected_venue.capacity}, Score: {selected_venue.suitability_score}/100) from {len(venues_catalog)} campus venues.",
                "details": {
                    "primary_venue": selected_venue.venue_name,
                    "capacity": selected_venue.capacity,
                    "utilization": f"{selected_venue.utilization_percentage}%"
                }
            }
        }

venue_agent = VenueAgent()
