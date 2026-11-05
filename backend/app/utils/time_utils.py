import re
from typing import Tuple, Optional

def parse_time_to_minutes(time_str: str) -> int:
    """
    Parses human time strings into minutes from midnight (0 - 1439).
    Examples: '09:00 AM' -> 540, '12:00 PM' -> 720, '02:00 PM' -> 840, '17:00' -> 1020
    """
    if not time_str:
        return 540  # Default 09:00 AM

    clean_str = time_str.strip().upper()
    is_pm = 'PM' in clean_str
    is_am = 'AM' in clean_str

    # Extract digits
    digits = re.findall(r'\d+', clean_str)
    if not digits:
        return 540

    hours = int(digits[0])
    minutes = int(digits[1]) if len(digits) > 1 else 0

    if is_pm and hours < 12:
        hours += 12
    elif is_am and hours == 12:
        hours = 0

    return (hours * 60) + minutes

def check_time_interval_overlap(
    start1_str: str,
    end1_str: str,
    start2_str: str,
    end2_str: str
) -> bool:
    """
    Determines if two time intervals overlap.
    Returns True if start1 < end2 AND end1 > start2.
    Boundary touches (e.g. 09:00-12:00 and 12:00-15:00) return False (No conflict).
    """
    s1 = parse_time_to_minutes(start1_str)
    e1 = parse_time_to_minutes(end1_str)
    s2 = parse_time_to_minutes(start2_str)
    e2 = parse_time_to_minutes(end2_str)

    # Ensure valid end > start
    if e1 <= s1:
        e1 = s1 + 480  # Default 8 hours duration
    if e2 <= s2:
        e2 = s2 + 480

    return (s1 < e2) and (e1 > s2)
