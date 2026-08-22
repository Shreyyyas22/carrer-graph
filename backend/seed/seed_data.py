import os
import sys
import uuid
import logging

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
import django
django.setup()

from graph.client import client

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

def uid():
    return str(uuid.uuid4())

import random

ROLES = [{"id": uid(), "name": name} for name in [
    "Backend Engineer", "Frontend Developer", "Data Scientist", "DevOps Engineer",
    "Full Stack Developer", "Machine Learning Engineer", "Mobile Developer",
    "Security Engineer", "Cloud Architect", "Database Administrator",
    "QA Engineer", "Product Manager", "UX Designer", "Data Engineer", "SRE"
]]

# --- Realistic skill catalog (no more Skill 1..50) ---
REAL_SKILLS = [
    ("Python", "Language"), ("JavaScript", "Language"), ("TypeScript", "Language"),
    ("Go", "Language"), ("Java", "Language"), ("SQL", "Language"), ("Rust", "Language"),
    ("React", "Framework"), ("Next.js", "Framework"), ("Vue.js", "Framework"),
    ("Angular", "Framework"), ("Django", "Framework"), ("FastAPI", "Framework"),
    ("Spring Boot", "Framework"), ("Node.js", "Framework"), ("Express.js", "Framework"),
    ("Docker", "Tool"), ("Kubernetes", "Tool"), ("Terraform", "Tool"),
    ("Git", "Tool"), ("Jenkins", "Tool"), ("GraphQL", "Tool"), ("gRPC", "Tool"),
    ("System Design", "Concept"), ("REST APIs", "Concept"), ("Microservices", "Concept"),
    ("CI/CD", "Concept"), ("Machine Learning", "Concept"), ("Data Structures", "Concept"),
    ("Algorithms", "Concept"), ("Agile", "Concept"), ("OAuth 2.0", "Concept"),
    ("Event-Driven Architecture", "Concept"), ("Test Automation", "Concept"),
    ("AWS", "Tool"), ("GCP", "Tool"), ("Azure", "Tool"),
    ("PostgreSQL", "Tool"), ("MongoDB", "Tool"), ("Redis", "Tool"),
    ("Kafka", "Tool"), ("RabbitMQ", "Tool"), ("Elasticsearch", "Tool"),
    ("Figma", "Tool"), ("Storybook", "Tool"), ("Cypress", "Tool"),
    ("PyTorch", "Framework"), ("TensorFlow", "Framework"), ("Pandas", "Framework"),
    ("Spark", "Framework"), ("Airflow", "Tool"), ("Prometheus", "Tool"),
]

SKILLS = [{"id": uid(), "name": n, "category": c} for n, c in REAL_SKILLS]
# add a few extras to reach ~54 but keep them meaningful
EXTRA_SKILLS = [
    ("WebSockets", "Concept"), ("WebAssembly", "Concept"), ("Serverless", "Concept"),
    ("Observability", "Concept"), ("SRE Practices", "Concept"),
]
SKILLS.extend({"id": uid(), "name": n, "category": c} for n, c in EXTRA_SKILLS)

# --- Technologies: distinct infra/products, not 1:1 with skills ---
REAL_TECH = [
    "PostgreSQL", "MongoDB", "Redis", "Elasticsearch", "Kafka", "RabbitMQ",
    "AWS", "GCP", "Azure", "Vercel", "Cloudflare",
    "Docker", "Kubernetes", "Terraform", "Jenkins", "GitHub Actions",
    "Next.js", "React", "TypeScript", "GraphQL", "gRPC", "WebRTC",
    "PyTorch", "TensorFlow", "Spark", "Airflow", "Prometheus", "Grafana",
    "Nginx", "Envoy", "Datadog",
]
TECHNOLOGIES = [{"id": uid(), "name": n} for n in REAL_TECH]

INDUSTRIES = [{"id": uid(), "name": name} for name in [
    "Fintech", "Healthcare", "E-commerce", "EdTech", "Gaming", "Cybersecurity",
    "PropTech", "AgriTech", "Logistics", "Web3"
]]

REAL_LOCATIONS = [
    ("San Francisco", "USA"), ("New York", "USA"), ("Austin", "USA"),
    ("Seattle", "USA"), ("Boston", "USA"), ("Chicago", "USA"),
    ("London", "UK"), ("Berlin", "Germany"), ("Singapore", "Singapore"),
    ("Toronto", "Canada"), ("Bengaluru", "India"),
]
LOCATIONS = [{"id": uid(), "city": city, "country": country, "remote_friendly": random.choice([True, False])}
             for city, country in REAL_LOCATIONS]
LOCATIONS.append({"id": uid(), "city": "Remote", "country": "Global", "remote_friendly": True})

REAL_COMPANIES = [
    ("NovaTech Systems", "https://novatech.example.com"),
    ("CloudForge", "https://cloudforge.example.com"),
    ("DataPulse Labs", "https://datapulse.example.com"),
    ("QuantumLeap AI", "https://quantumleapai.example.com"),
    ("FinEdge", "https://finedge.example.com"),
    ("HealthSync", "https://healthsync.example.com"),
    ("EduSpark", "https://eduspark.example.com"),
    ("GameCraft Studios", "https://gamecraft.example.com"),
    ("SecureStack", "https://securestack.example.com"),
    ("PropNest", "https://propnest.example.com"),
    ("AgriFlow", "https://agriflow.example.com"),
    ("ShipFast Logistics", "https://shipfast.example.com"),
    ("ChainMint", "https://chainmint.example.com"),
    ("ByteBridge", "https://bytebridge.example.com"),
    ("AeroCode", "https://aerocode.example.com"),
    ("PixelForge", "https://pixelforge.example.com"),
    ("InsightIQ", "https://insightiq.example.com"),
    ("BrightPath", "https://brightpath.example.com"),
    ("Northwind Digital", "https://northwind.example.com"),
    ("LumenWorks", "https://lumenworks.example.com"),
]
COMPANIES = [{"id": uid(), "name": n, "website": w, "logo_url": ""} for n, w in REAL_COMPANIES]

# Realistic job titles + descriptions
REAL_JOBS = [
    ("Senior Backend Engineer", "Design and scale microservices on AWS; own REST APIs and PostgreSQL tuning. Node/Python.", "Senior"),
    ("Frontend Developer — React", "Build accessible React + Next.js UIs with TypeScript and Tailwind. Collaborate with design via Figma.", "Mid"),
    ("Staff Data Engineer", "Own Spark/Airflow pipelines over 10TB/d; model warehouses in BigQuery/Snowflake.", "Lead"),
    ("Machine Learning Engineer", "Train and deploy PyTorch models to production with Kubernetes and MLflow.", "Senior"),
    ("DevOps / Platform Engineer", "Harden CI/CD (Jenkins/GitHub Actions), IaC with Terraform, and observability via Prometheus/Grafana.", "Mid"),
    ("Mobile Engineer — React Native", "Ship iOS/Android features with React Native and native bridges.", "Mid"),
    ("Security Engineer — AppSec", "Lead threat modeling, OAuth, and SAST/DAST across services.", "Senior"),
    ("Cloud Architect", "Define multi-region AWS/GCP strategy, service mesh and cost controls.", "Lead"),
    ("Database Administrator", "Operate PostgreSQL/Redis at scale; backup, replication and pgbouncer tuning.", "Mid"),
    ("QA Automation Engineer", "Build Cypress/Playwright suites and contract testing for microservices.", "Junior"),
    ("Product Manager — Platform", "Own roadmap for internal developer platform and API governance.", "Mid"),
    ("UX Designer — Design Systems", "Evolve the design system in Figma and Storybook; partner with FE.", "Mid"),
    ("Full Stack Developer", "Ship FastAPI + React features end-to-end; PostgreSQL, Docker.", "Mid"),
    ("SRE — Observability", "SLOs, runbooks, on-call rotation, and Datadog/Airflow alerts.", "Senior"),
    ("Data Scientist — Analytics", "Experimentation, causal inference and dashboarding with Spark/Pandas.", "Senior"),
    ("Junior Backend Engineer", "Implement REST endpoints in Spring Boot; learn observability and testing.", "Junior"),
    ("Lead Frontend Architect", "Own Next.js SSR/ISR strategy and front-end performance budgets.", "Lead"),
    ("Blockchain Engineer", "Build secure Web3 services with gRPC, Kafka and audit logging.", "Senior"),
    ("EdTech Platform Engineer", "Services for video, WebRTC and real-time collaboration.", "Mid"),
    ("Fintech Risk Engineer", "Real-time risk checks with Kafka, Redis and PostgreSQL.", "Senior"),
]
# Expand to ~53 jobs by shuffling levels/remote with realistic variety
JOBS = []
for i, (title, desc, level) in enumerate(REAL_JOBS):
    JOBS.append({"id": uid(), "title": title, "description": desc, "level": level, "remote": random.choice([True, False]), "created_at": "2023-10-01T00:00:00Z"})
# Pad with junior/mid variants so filters have coverage
EXTRA_TITLES = [
    ("Backend Engineer", "APIs and background jobs with Python/Go."),
    ("Frontend Engineer", "Polishing UI, a11y and performance."),
    ("Data Analyst", "SQL and storytelling with data."),
    ("Support Engineer", "Debug prod, write runbooks."),
]
for t, d in EXTRA_TITLES:
    for lvl in ["Junior", "Mid", "Senior"]:
        JOBS.append({"id": uid(), "title": f"{lvl} {t}", "description": d, "level": lvl, "remote": random.choice([True, False]), "created_at": "2023-10-01T00:00:00Z"})
# add a couple more to reach ~53
for _ in range(5):
    title, desc, lvl = random.choice(REAL_JOBS)
    JOBS.append({"id": uid(), "title": title, "description": desc, "level": lvl, "remote": random.choice([True, False]), "created_at": "2023-10-01T00:00:00Z"})

# Ensure some overlap jobs for testing still present (now naturally overlapping via real skills)
JOBS.append({"id": uid(), "title": "Senior Python Engineer", "description": "Build scalable backends with Python, PostgreSQL and Docker.", "level": "Senior", "remote": True, "created_at": "2023-10-01T00:00:00Z"})

ALICE_ID = "24e29a26-15ff-437b-92f5-5ba979467123"
# Demo-friendly cohort: each extra dev has 2-3 WORKED_AS so career-path has something to find
DEVELOPERS = [
    {"id": ALICE_ID, "name": "Alice Smith", "email": "alice@example.com", "experience_years": 5, "bio": "Backend specialist — Python, System Design and PostgreSQL. Loves APIs and observability."},
    {"id": uid(), "name": "Priya Sharma", "email": "priya.sharma@example.com", "experience_years": 8, "bio": "Backend → Cloud Architect → SRE. AWS, Kubernetes and observability."},
    {"id": uid(), "name": "Marco Rossi", "email": "marco.rossi@example.com", "experience_years": 6, "bio": "Frontend → Full Stack → Backend. React, Next.js and Node.js."},
    {"id": uid(), "name": "Sofia Chen", "email": "sofia.chen@example.com", "experience_years": 7, "bio": "Data Engineer → Data Scientist → ML Engineer. Spark, PyTorch and SQL."},
    {"id": uid(), "name": "Jamal Khan", "email": "jamal.khan@example.com", "experience_years": 6, "bio": "QA → DevOps → SRE. Test automation, CI/CD and SRE practices."},
    {"id": uid(), "name": "Elena Petrova", "email": "elena.petrova@example.com", "experience_years": 5, "bio": "Mobile → UX Designer → Product Manager. Figma and React Native."},
]

def clear_database():
    logger.info("Clearing database...")
    client.execute_write("MATCH (n) DETACH DELETE n")

def seed_nodes():
    logger.info("Seeding nodes...")

    client.execute_write("""
    UNWIND $roles AS row
    MERGE (r:Role {id: row.id})
    SET r.name = row.name
    """, {"roles": ROLES})

    client.execute_write("""
    UNWIND $skills AS row
    MERGE (s:Skill {id: row.id})
    SET s.name = row.name, s.category = row.category
    """, {"skills": SKILLS})

    client.execute_write("""
    UNWIND $tech AS row
    MERGE (t:Technology {id: row.id})
    SET t.name = row.name
    """, {"tech": TECHNOLOGIES})

    client.execute_write("""
    UNWIND $industries AS row
    MERGE (i:Industry {id: row.id})
    SET i.name = row.name
    """, {"industries": INDUSTRIES})

    client.execute_write("""
    UNWIND $locations AS row
    MERGE (l:Location {id: row.id})
    SET l.city = row.city, l.country = row.country, l.remote_friendly = row.remote_friendly
    """, {"locations": LOCATIONS})

    client.execute_write("""
    UNWIND $companies AS row
    MERGE (c:Company {id: row.id})
    SET c.name = row.name, c.website = row.website, c.logo_url = row.logo_url
    """, {"companies": COMPANIES})

    client.execute_write("""
    UNWIND $jobs AS row
    MERGE (j:Job {id: row.id})
    SET j.title = row.title, j.description = row.description, j.level = row.level, j.remote = row.remote, j.created_at = row.created_at
    """, {"jobs": JOBS})

    client.execute_write("""
    UNWIND $devs AS row
    MERGE (d:Developer {id: row.id})
    SET d.name = row.name, d.email = row.email, d.experience_years = row.experience_years, d.bio = row.bio
    """, {"devs": DEVELOPERS})

def seed_relationships():
    logger.info("Seeding relationships...")

    company_industry = [{"c_id": c["id"], "i_id": random.choice(INDUSTRIES)["id"]} for c in COMPANIES]
    client.execute_write("""
    UNWIND $pairs AS pair
    MATCH (c:Company {id: pair.c_id}), (i:Industry {id: pair.i_id})
    MERGE (c)-[:IN_INDUSTRY]->(i)
    """, {"pairs": company_industry})

    job_company = [{"j_id": j["id"], "c_id": random.choice(COMPANIES)["id"]} for j in JOBS]
    client.execute_write("""
    UNWIND $pairs AS pair
    MATCH (c:Company {id: pair.c_id}), (j:Job {id: pair.j_id})
    MERGE (c)-[:POSTED]->(j)
    """, {"pairs": job_company})

    job_details = []
    for j in JOBS:
        j_skills = random.sample(SKILLS, k=random.randint(3, 7))
        j_tech = random.sample(TECHNOLOGIES, k=random.randint(2, 5))
        job_details.append({
            "j_id": j["id"],
            "r_id": random.choice(ROLES)["id"],
            "l_id": random.choice(LOCATIONS)["id"],
            "skills": [{"id": s["id"], "importance": random.choice(["Required", "NiceToHave"])} for s in j_skills],
            "tech": [{"id": t["id"]} for t in j_tech]
        })

    client.execute_write("""
    UNWIND $details AS d
    MATCH (j:Job {id: d.j_id}), (r:Role {id: d.r_id}), (l:Location {id: d.l_id})
    MERGE (j)-[:FOR_ROLE]->(r)
    MERGE (j)-[:LOCATED_IN]->(l)
    WITH j, d
    UNWIND d.skills AS s_data
    MATCH (s:Skill {id: s_data.id})
    MERGE (j)-[:REQUIRES {importance: s_data.importance}]->(s)
    WITH j, d
    UNWIND d.tech AS t_data
    MATCH (t:Technology {id: t_data.id})
    MERGE (j)-[:USES]->(t)
    """, {"details": job_details})

    # Alice: keep her graph-interesting (overlaps with many jobs)
    client.execute_write("""
    MATCH (d:Developer {name: 'Alice Smith'}), (r:Role {name: 'Backend Engineer'}), (l:Location {city: 'Remote'}), (s1:Skill {name: 'Python'}), (s2:Skill {name: 'System Design'}), (s3:Skill {name: 'PostgreSQL'})
    MERGE (d)-[:WORKED_AS]->(r)
    MERGE (d)-[:LOCATED_IN]->(l)
    MERGE (d)-[:HAS_SKILL {proficiency: 'Expert', years: 5}]->(s1)
    MERGE (d)-[:HAS_SKILL {proficiency: 'Intermediate', years: 2}]->(s2)
    MERGE (d)-[:HAS_SKILL {proficiency: 'Advanced', years: 3}]->(s3)
    """)

    # Priya: Backend → Cloud Architect → SRE
    client.execute_write("""
    MATCH (d:Developer {name: 'Priya Sharma'}), (r1:Role {name: 'Backend Engineer'}), (r2:Role {name: 'Cloud Architect'}), (r3:Role {name: 'SRE'}), (l:Location {city: 'San Francisco'}), (s1:Skill {name: 'Python'}), (s2:Skill {name: 'AWS'}), (s3:Skill {name: 'Kubernetes'}), (s4:Skill {name: 'Docker'}), (s5:Skill {name: 'Terraform'})
    MERGE (d)-[:WORKED_AS]->(r1)
    MERGE (d)-[:WORKED_AS]->(r2)
    MERGE (d)-[:WORKED_AS]->(r3)
    MERGE (d)-[:LOCATED_IN]->(l)
    MERGE (d)-[:HAS_SKILL {proficiency: 'Expert', years: 6}]->(s1)
    MERGE (d)-[:HAS_SKILL {proficiency: 'Expert', years: 5}]->(s2)
    MERGE (d)-[:HAS_SKILL {proficiency: 'Advanced', years: 4}]->(s3)
    MERGE (d)-[:HAS_SKILL {proficiency: 'Advanced', years: 4}]->(s4)
    MERGE (d)-[:HAS_SKILL {proficiency: 'Intermediate', years: 2}]->(s5)
    """)

    # Marco: Frontend → Full Stack → Backend
    client.execute_write("""
    MATCH (d:Developer {name: 'Marco Rossi'}), (r1:Role {name: 'Frontend Developer'}), (r2:Role {name: 'Full Stack Developer'}), (r3:Role {name: 'Backend Engineer'}), (l:Location {city: 'Berlin'}), (s1:Skill {name: 'JavaScript'}), (s2:Skill {name: 'React'}), (s3:Skill {name: 'Node.js'}), (s4:Skill {name: 'TypeScript'}), (s5:Skill {name: 'Next.js'})
    MERGE (d)-[:WORKED_AS]->(r1)
    MERGE (d)-[:WORKED_AS]->(r2)
    MERGE (d)-[:WORKED_AS]->(r3)
    MERGE (d)-[:LOCATED_IN]->(l)
    MERGE (d)-[:HAS_SKILL {proficiency: 'Expert', years: 5}]->(s1)
    MERGE (d)-[:HAS_SKILL {proficiency: 'Expert', years: 5}]->(s2)
    MERGE (d)-[:HAS_SKILL {proficiency: 'Advanced', years: 3}]->(s3)
    MERGE (d)-[:HAS_SKILL {proficiency: 'Advanced', years: 3}]->(s4)
    MERGE (d)-[:HAS_SKILL {proficiency: 'Intermediate', years: 2}]->(s5)
    """)

    # Sofia: Data Engineer → Data Scientist → ML Engineer
    client.execute_write("""
    MATCH (d:Developer {name: 'Sofia Chen'}), (r1:Role {name: 'Data Engineer'}), (r2:Role {name: 'Data Scientist'}), (r3:Role {name: 'Machine Learning Engineer'}), (l:Location {city: 'New York'}), (s1:Skill {name: 'Python'}), (s2:Skill {name: 'Spark'}), (s3:Skill {name: 'Pandas'}), (s4:Skill {name: 'PyTorch'}), (s5:Skill {name: 'SQL'})
    MERGE (d)-[:WORKED_AS]->(r1)
    MERGE (d)-[:WORKED_AS]->(r2)
    MERGE (d)-[:WORKED_AS]->(r3)
    MERGE (d)-[:LOCATED_IN]->(l)
    MERGE (d)-[:HAS_SKILL {proficiency: 'Expert', years: 5}]->(s1)
    MERGE (d)-[:HAS_SKILL {proficiency: 'Expert', years: 4}]->(s2)
    MERGE (d)-[:HAS_SKILL {proficiency: 'Advanced', years: 3}]->(s3)
    MERGE (d)-[:HAS_SKILL {proficiency: 'Advanced', years: 3}]->(s4)
    MERGE (d)-[:HAS_SKILL {proficiency: 'Expert', years: 6}]->(s5)
    """)

    # Jamal: QA → DevOps → SRE
    client.execute_write("""
    MATCH (d:Developer {name: 'Jamal Khan'}), (r1:Role {name: 'QA Engineer'}), (r2:Role {name: 'DevOps Engineer'}), (r3:Role {name: 'SRE'}), (l:Location {city: 'Austin'}), (s1:Skill {name: 'Test Automation'}), (s2:Skill {name: 'Docker'}), (s3:Skill {name: 'Kubernetes'}), (s4:Skill {name: 'CI/CD'}), (s5:Skill {name: 'Prometheus'})
    MERGE (d)-[:WORKED_AS]->(r1)
    MERGE (d)-[:WORKED_AS]->(r2)
    MERGE (d)-[:WORKED_AS]->(r3)
    MERGE (d)-[:LOCATED_IN]->(l)
    MERGE (d)-[:HAS_SKILL {proficiency: 'Expert', years: 4}]->(s1)
    MERGE (d)-[:HAS_SKILL {proficiency: 'Advanced', years: 3}]->(s2)
    MERGE (d)-[:HAS_SKILL {proficiency: 'Advanced', years: 3}]->(s3)
    MERGE (d)-[:HAS_SKILL {proficiency: 'Expert', years: 5}]->(s4)
    MERGE (d)-[:HAS_SKILL {proficiency: 'Intermediate', years: 2}]->(s5)
    """)

    # Elena: Mobile → UX Designer → Product Manager
    client.execute_write("""
    MATCH (d:Developer {name: 'Elena Petrova'}), (r1:Role {name: 'Mobile Developer'}), (r2:Role {name: 'UX Designer'}), (r3:Role {name: 'Product Manager'}), (l:Location {city: 'London'}), (s1:Skill {name: 'Figma'}), (s2:Skill {name: 'React'}), (s3:Skill {name: 'TypeScript'}), (s4:Skill {name: 'Agile'})
    MERGE (d)-[:WORKED_AS]->(r1)
    MERGE (d)-[:WORKED_AS]->(r2)
    MERGE (d)-[:WORKED_AS]->(r3)
    MERGE (d)-[:LOCATED_IN]->(l)
    MERGE (d)-[:HAS_SKILL {proficiency: 'Advanced', years: 3}]->(s1)
    MERGE (d)-[:HAS_SKILL {proficiency: 'Advanced', years: 4}]->(s2)
    MERGE (d)-[:HAS_SKILL {proficiency: 'Intermediate', years: 2}]->(s3)
    MERGE (d)-[:HAS_SKILL {proficiency: 'Expert', years: 5}]->(s4)
    """)

def run_seed():
    clear_database()
    seed_nodes()
    seed_relationships()
    logger.info("Seed complete!")
    counts = client.execute_read("MATCH (n) RETURN labels(n)[0] as label, count(n) as count")
    logger.info("Current node counts:")
    for row in counts:
        logger.info(f"  {row['label']}: {row['count']}")

if __name__ == "__main__":
    run_seed()
