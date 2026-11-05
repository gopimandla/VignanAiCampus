import json
import logging
import re
from typing import Dict, Any, Optional
import anthropic
from app.config import settings

logger = logging.getLogger("uvicorn.error")

class ClaudeService:
    def __init__(self):
        self.api_key = settings.ANTHROPIC_API_KEY.strip() if settings.ANTHROPIC_API_KEY else ""
        self.model = settings.ANTHROPIC_MODEL or "claude-3-5-sonnet-20241022"
        self.client = None
        if self.api_key and len(self.api_key) > 5:
            try:
                self.client = anthropic.AsyncAnthropic(api_key=self.api_key)
            except Exception as e:
                logger.warning(f"Failed to initialize Anthropic client: {e}")

    def is_available(self) -> bool:
        return self.client is not None

    async def analyze_event_prompt(
        self,
        prompt: str,
        venues_catalog: list,
        resources_catalog: list
    ) -> Optional[Dict[str, Any]]:
        """
        Uses Claude API to extract requirements, objectives, and schedule structure.
        """
        if not self.is_available():
            return None

        system_instruction = (
            "You are the Lead Campus Event Planning AI for Vignan University (VFSTR), Vadlamudi. "
            "Your task is to analyze the user's natural language event request and extract structured details. "
            "You must ONLY refer to real campus venues and real resources provided in the context. "
            "Return ONLY valid JSON without markdown wrapping."
        )

        venues_context = json.dumps([
            {"id": v["id"], "name": v["name"], "capacity": v["capacity"], "category": v["category"], "ac": v.get("ac", False)}
            for v in venues_catalog
        ])

        resources_context = json.dumps([
            {"id": r["id"], "name": r["name"], "category": r["category"], "available": r["available_quantity"], "unit": r["unit"]}
            for r in resources_catalog
        ])

        user_content = f"""
Event Prompt: "{prompt}"

Available Campus Venues in VFSTR Database:
{venues_context}

Available Campus Resource Inventory in VFSTR Database:
{resources_context}

Analyze this event and output a JSON object with the following schema:
{{
  "title": "A clear, engaging title for the event",
  "category": "Technical | Cultural / Major | NSS / Social | SAC / Student Activities | Academic / Workshop",
  "event_type": "Hackathon | Seminar | Cultural Fest | Orientation | Workshop | Conference | Social Drive | Other",
  "expected_participants": 500,
  "duration": "e.g. 2 Days | 1 Day | 4 Hours",
  "duration_days": 2,
  "duration_hours_per_day": 8,
  "target_audience": "e.g. B.Tech Engineering Students & Faculty",
  "host_department": "e.g. Dept of CSE / SAC / NSS Cell",
  "key_objectives": ["Objective 1", "Objective 2", "Objective 3"],
  "special_requirements": ["e.g. High speed Wi-Fi", "Dual mic setup"],
  "assumptions": ["Assumption 1", "Assumption 2"],
  "suggested_venue_id": "id of the best matching venue from the provided list",
  "resource_demands": {{
     "projectors": 2,
     "microphones": 4,
     "speakers": 2,
     "led_screens": 1,
     "chairs": 500,
     "tables": 125,
     "laptops": 10,
     "wifi_access_points": 8,
     "security_guards": 6,
     "volunteers": 20
  }},
  "schedule_outline": [
     {{
       "day": 1,
       "time_slot": "09:00 AM - 10:30 AM",
       "stage_name": "Inauguration & Welcome",
       "activity": "Brief description of the opening session",
       "responsible_team": "Organizing Committee & SAC"
     }}
  ],
  "recommendations": ["Actionable recommendation 1", "Actionable recommendation 2"]
}}
"""

        try:
            logger.info(f"Invoking Anthropic Claude model {self.model} for prompt: '{prompt}'...")
            response = await self.client.messages.create(
                model=self.model,
                max_tokens=2000,
                system=system_instruction,
                messages=[{"role": "user", "content": user_content}]
            )

            response_text = ""
            for block in response.content:
                if hasattr(block, "text"):
                    response_text += block.text

            # Parse JSON from response
            cleaned_text = response_text.strip()
            if cleaned_text.startswith("```"):
                cleaned_text = re.sub(r"^```(?:json)?\n?", "", cleaned_text)
                cleaned_text = re.sub(r"\n?```$", "", cleaned_text)

            parsed = json.loads(cleaned_text)
            return parsed
        except Exception as e:
            logger.warning(f"Claude API call failed: {e}. Falling back to dynamic Python deterministic agent.")
            return None

claude_service = ClaudeService()
