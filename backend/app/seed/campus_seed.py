"""
Campus Seed Data for Vignan's Foundation for Science, Technology and Research (VFSTR)
Vadlamudi, Guntur, Andhra Pradesh.

NOTE: Master data follows user-provided campus information. 
Admin users can edit, update, or expand all records via the Master Data Management modules.
"""

CAMPUS_INFO = {
    "name": "Vignan's Foundation for Science, Technology and Research (Deemed to be University)",
    "short_name": "VFSTR / Vignan University",
    "location": "Vadlamudi, Guntur District, Andhra Pradesh, India - 522213",
    "description": "Premier institution driving innovation, research, technical and cultural excellence.",
}

SEED_VENUES = [
    {
        "id": "sangamam-sh",
        "name": "Sangamam Seminar Hall",
        "category": "Seminar Hall",
        "block": "Central Academic Block",
        "capacity": 300,
        "ac": True,
        "av_equipped": True,
        "suitable_for": ["Guest Lectures", "Workshops", "Department Seminars", "Symposiums"],
        "status": "available",
        "description": "Equipped with stage audio, projection system, and tiered acoustic seating."
    },
    {
        "id": "spoorthy-sh",
        "name": "Spoorthy Seminar Hall",
        "category": "Seminar Hall",
        "block": "Central Academic Block",
        "capacity": 300,
        "ac": True,
        "av_equipped": True,
        "suitable_for": ["Technical Sessions", "Conferences", "Faculty Development Programs"],
        "status": "available",
        "description": "High-clarity projection, sound system, and comfortable theater seating."
    },
    {
        "id": "srujana-sh",
        "name": "Srujana Seminar Hall",
        "category": "Seminar Hall",
        "block": "Academic Block",
        "capacity": 400,
        "ac": True,
        "av_equipped": True,
        "suitable_for": ["Hackathons Keynotes", "Workshops", "Cultural Briefings", "Conclaves"],
        "status": "available",
        "description": "Mid-large seminar hall ideal for intra-college technical events and hackathons."
    },
    {
        "id": "sa-re-ga-ma-sh",
        "name": "Sa Re Ga Ma Seminar Hall",
        "category": "Seminar Hall",
        "block": "Cultural & Academic Zone",
        "capacity": 500,
        "ac": True,
        "av_equipped": True,
        "suitable_for": ["Musical Performances", "Cultural Reviews", "Large Seminars", "Guest Lectures"],
        "status": "available",
        "description": "Premium acoustics and stage lighting suitable for technical and artistic symposiums."
    },
    {
        "id": "sangamithra-sh",
        "name": "Sangamithra Seminar Hall",
        "category": "Seminar Hall",
        "block": "Academic Zone",
        "capacity": 500,
        "ac": True,
        "av_equipped": True,
        "suitable_for": ["National Conferences", "Hackathons", "Annual Department Meets"],
        "status": "available",
        "description": "Spacious 500-seater hall with multi-display setup and dual mic podiums."
    },
    {
        "id": "h-block-oat",
        "name": "H Block Open Air Theatre (OAT)",
        "category": "Open Air Theatre",
        "block": "H Block",
        "capacity": 500,
        "ac": False,
        "av_equipped": True,
        "suitable_for": ["Beat The Street", "Club Activities", "Flash Mobs", "Outdoor Seminars"],
        "status": "available",
        "description": "Open-air amphitheater with tiered stepped seating and stage platform."
    },
    {
        "id": "a-block-oat",
        "name": "A Block Open Air Theatre (OAT)",
        "category": "Open Air Theatre",
        "block": "A Block",
        "capacity": 1000,
        "ac": False,
        "av_equipped": True,
        "suitable_for": ["University Cultural Meets", "Fest Inaugurations", "Celebrations", "Concerts"],
        "status": "available",
        "description": "Large capacity amphitheatre facing the central courtyard."
    },
    {
        "id": "u-block-oat",
        "name": "U Block Open Air Theatre (OAT)",
        "category": "Open Air Theatre",
        "block": "U Block",
        "capacity": 700,
        "ac": False,
        "av_equipped": True,
        "suitable_for": ["Student Gatherings", "Club Festivals", "Street Plays", "Band Performances"],
        "status": "available",
        "description": "Vibrant venue suitable for medium-to-large open air student assemblies."
    },
    {
        "id": "convocation-hall",
        "name": "Convocation Hall",
        "category": "Auditorium / Grand Hall",
        "block": "University Central",
        "capacity": 2000,
        "ac": True,
        "av_equipped": True,
        "suitable_for": ["Convocation", "Mahotsav", "University Orientations", "International Summits"],
        "status": "available",
        "description": "Flagship university auditorium holding ~2000 delegates for mega summits."
    },
    {
        "id": "mhp-zone",
        "name": "MHP (Most Happening Place)",
        "category": "Informal / Student Hub",
        "block": "Student Activity Center / Canteen Zone",
        "capacity": 350,
        "ac": False,
        "av_equipped": True,
        "suitable_for": ["Informal Events", "Canteen Activities", "SAC Popups", "Interactive Workshops"],
        "status": "available",
        "description": "Central energetic hub for informal student events and cultural activations."
    }
]

SEED_BLOCKS = [
    {
        "block_id": "block-a",
        "name": "A Block",
        "total_floors": 5,
        "known_patterns": ["VBSF Labs/Rooms", "VBSSF", "VBTSF", "VFFTSF"],
        "description": "5-Floor engineering block with specialized labs and smart lecture rooms. Exact room inventory editable by Admin.",
        "known_rooms_count": 25
    },
    {
        "block_id": "block-h",
        "name": "H Block",
        "total_floors": 3,
        "known_patterns": ["First Floor: VFF Classrooms", "Second Floor: VSF Classrooms", "Third Floor: VTF Classrooms"],
        "description": "3-Floor block with approximately 10 classrooms per mentioned floor. Exact room numbers editable via Admin.",
        "known_rooms_count": 30
    },
    {
        "block_id": "block-n",
        "name": "N Block",
        "total_floors": 5,
        "known_patterns": ["N-101", "N-102", "N-114-A", "N-114-B", "Continuing through N-619"],
        "description": "5-Floor academic facility with high-density lecture halls and project labs.",
        "known_rooms_count": 40
    }
]

SEED_EVENT_CATEGORIES = {
    "Technical": [
        "Srujanankura",
        "Vastrotsav",
        "Fudo Festino",
        "Spark Tank",
        "Project Expo",
        "Poster Presentations",
        "Ideathons",
        "Hackathons"
    ],
    "Cultural / Major": [
        "Vignan Mahotsav",
        "Bala Mahotsav",
        "Sankranthi Sambaralu"
    ],
    "NSS / Social": [
        "Swachh Campus Abhiyan",
        "Emergency Relief & Drives",
        "Health / Medical Camps",
        "Rural Outreach"
    ],
    "SAC / Student Activities": [
        "Beat The Street",
        "Symphony",
        "Frames of Vignan",
        "Leadership & Youth Forums"
    ]
}

SEED_LEADERSHIP = [
    {
        "id": "lead-founder",
        "name": "Dr. Lavu Rathaiah",
        "role": "Founder, Chairman & Chancellor",
        "qualifications": "M.Sc, M.Ed, D.J., Ph.D.",
        "department": "University Leadership",
        "user_provided": True,
        "editable": True
    },
    {
        "id": "hod-cse",
        "name": "Dr. Venkatarama Phani Kumar Sistla",
        "role": "Head of Department (HOD)",
        "department": "Computer Science and Engineering (CSE)",
        "user_provided": True,
        "editable": True
    },
    {
        "id": "hod-ece",
        "name": "Dr. N. Usha Rani",
        "role": "Head of Department (HOD)",
        "department": "Electronics and Communication Engineering (ECE)",
        "user_provided": True,
        "editable": True
    },
    {
        "id": "hod-eee",
        "name": "Dr. G. Srinivasa Rao",
        "role": "Head of Department (HOD)",
        "department": "Electrical and Electronics Engineering (EEE)",
        "user_provided": True,
        "editable": True
    },
    {
        "id": "hod-mech",
        "name": "Dr. M. Rama Krishna",
        "role": "Head of Department (HOD)",
        "department": "Mechanical Engineering",
        "user_provided": True,
        "editable": True
    },
    {
        "id": "hod-it",
        "name": "Dr. A. Rama Swamy Reddy",
        "role": "Head of Department (HOD)",
        "department": "Information Technology (IT)",
        "user_provided": True,
        "editable": True
    },
    {
        "id": "hod-chem",
        "name": "Dr. M. Ramesh Naidu",
        "role": "Head of Department (HOD)",
        "department": "Chemical Engineering",
        "user_provided": True,
        "editable": True
    },
    {
        "id": "hod-bme",
        "name": "Dr. G. Sitaramanjaneya Reddy",
        "role": "Head of Department (HOD)",
        "department": "Biomedical Engineering",
        "user_provided": True,
        "editable": True
    },
    {
        "id": "hod-pharmacy",
        "name": "Dr. Ch. Jithendra",
        "role": "Head of Department (HOD)",
        "department": "Pharmacy",
        "user_provided": True,
        "editable": True
    },
    {
        "id": "hod-snh",
        "name": "Dr. N. Srinivasu",
        "role": "Head of Department (HOD)",
        "department": "Science & Humanities",
        "user_provided": True,
        "editable": True
    },
    {
        "id": "hod-mba",
        "name": "Mr. D. Vijaya Krishna",
        "role": "Head of Department (HOD)",
        "department": "Management Studies (MBA)",
        "user_provided": True,
        "editable": True
    }
]

# Configurable resource inventory with initial demo seed values clearly identified
SEED_RESOURCES = [
    {"id": "res-projectors", "name": "High-Lumen Projectors", "category": "Audio/Visual", "total_quantity": 25, "available_quantity": 25, "unit": "units", "editable": True},
    {"id": "res-microphones", "name": "Wireless & Collar Microphones", "category": "Audio/Visual", "total_quantity": 60, "available_quantity": 60, "unit": "sets", "editable": True},
    {"id": "res-speakers", "name": "PA Systems & Stage Speakers", "category": "Audio/Visual", "total_quantity": 30, "available_quantity": 30, "unit": "systems", "editable": True},
    {"id": "res-led-screens", "name": "Stage LED Wall Display Panels", "category": "Audio/Visual", "total_quantity": 6, "available_quantity": 6, "unit": "walls", "editable": True},
    {"id": "res-chairs", "name": "Auditorium & Banquet Chairs", "category": "Furniture", "total_quantity": 1500, "available_quantity": 1500, "unit": "chairs", "editable": True},
    {"id": "res-tables", "name": "Registration & Hackathon Tables", "category": "Furniture", "total_quantity": 250, "available_quantity": 250, "unit": "tables", "editable": True},
    {"id": "res-laptops", "name": "Evaluation & Control Laptops", "category": "IT / Tech", "total_quantity": 40, "available_quantity": 40, "unit": "laptops", "editable": True},
    {"id": "res-cameras", "name": "4K Livestream & Photography Cameras", "category": "Media", "total_quantity": 12, "available_quantity": 12, "unit": "kits", "editable": True},
    {"id": "res-generators", "name": "Heavy Duty Backup Power Generators", "category": "Facilities", "total_quantity": 4, "available_quantity": 4, "unit": "generators", "editable": True},
    {"id": "res-wifi-support", "name": "Dedicated High-Density Wi-Fi Access Points", "category": "IT / Tech", "total_quantity": 50, "available_quantity": 50, "unit": "nodes", "editable": True},
    {"id": "res-buses", "name": "University Shuttles / Transport Buses", "category": "Transport", "total_quantity": 15, "available_quantity": 15, "unit": "vehicles", "editable": True},
    {"id": "res-security", "name": "Campus Security Personnel", "category": "Operations", "total_quantity": 35, "available_quantity": 35, "unit": "guards", "editable": True},
    {"id": "res-volunteers", "name": "Student SAC Volunteers", "category": "Human Resources", "total_quantity": 120, "available_quantity": 120, "unit": "students", "editable": True},
]
