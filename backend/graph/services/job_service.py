from graph.client import client
from graph.queries.job_queries import GET_JOB_MATCHES, GET_MISSING_SKILLS, GET_SIMILAR_JOBS, GET_JOB_DETAIL, LIST_JOBS

class JobService:
    @staticmethod
    def get_matches(dev_id: str):
        result = client.execute_read(GET_JOB_MATCHES, {"dev_id": dev_id})
        return result

    @staticmethod
    def get_detail(job_id: str):
        result = client.execute_read(GET_JOB_DETAIL, {"job_id": job_id})
        return result[0] if result else None
        
    @staticmethod
    def list_jobs():
        return client.execute_read(LIST_JOBS)

    @staticmethod
    def get_missing_skills(job_id: str, dev_id: str):
        result = client.execute_read(GET_MISSING_SKILLS, {"job_id": job_id, "dev_id": dev_id})
        return result

    @staticmethod
    def get_similar_jobs(job_id: str):
        result = client.execute_read(GET_SIMILAR_JOBS, {"job_id": job_id})
        return result
