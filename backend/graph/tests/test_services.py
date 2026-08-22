import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
import django
django.setup()

from graph.services.developer_service import DeveloperService
from graph.services.job_service import JobService
from graph.services.company_service import CompanyService
from graph.services.skill_service import SkillService
from graph.services.explorer_service import ExplorerService
from graph.client import client

def run_tests():
    # Fetch a developer to test with
    res = client.execute_read("MATCH (d:Developer) RETURN d.id AS id LIMIT 1")
    if not res:
        print("No developers found in database.")
        return
    dev_id = res[0]['id']
    
    print(f"--- Testing DeveloperService ---")
    prof = DeveloperService.get_profile(dev_id)
    print("Profile:", prof['developer']['name'])
    
    skills = DeveloperService.get_skills(dev_id)
    print("Skills Count:", len(skills))
    
    print(f"--- Testing JobService ---")
    matches = JobService.get_matches(dev_id)
    print("Job Matches Count:", len(matches))
    if matches:
        print("Top Match:", matches[0]['job']['title'], "Score:", matches[0]['match_percentage'])
        job_id = matches[0]['job']['id']
        missing = JobService.get_missing_skills(job_id, dev_id)
        print("Missing Skills for Top Job:", len(missing))
        similar = JobService.get_similar_jobs(job_id)
        print("Similar Jobs:", len(similar))
        
    print(f"--- Testing CompanyService ---")
    companies = client.execute_read("MATCH (c:Company)-[:POSTED]->(j:Job) RETURN c.id AS id LIMIT 1")
    if companies:
        c_id = companies[0]['id']
        c_jobs = CompanyService.get_jobs(c_id)
        print("Company Jobs Count:", len(c_jobs))
        
    print(f"--- Testing ExplorerService ---")
    neighborhood = ExplorerService.get_neighborhood(dev_id)
    print("Neighborhood 1-Hop Relationship Count:", len(neighborhood))

if __name__ == "__main__":
    run_tests()
