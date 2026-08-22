from graph.client import client
from graph.queries.skill_queries import (
    GET_LEARNING_RESOURCES,
    GET_RELATED_TECH_JOBS,
    GET_CAREER_PATH_TRANSITIONS
)

class SkillService:
    @staticmethod
    def get_learning_resources(skill_id: str):
        return client.execute_read(GET_LEARNING_RESOURCES, {"skill_id": skill_id})

    @staticmethod
    def get_related_tech_jobs(tech_id: str):
        return client.execute_read(GET_RELATED_TECH_JOBS, {"tech_id": tech_id})

    @staticmethod
    def get_career_path_transitions(current_role_id: str, target_role_id: str):
        return client.execute_read(GET_CAREER_PATH_TRANSITIONS, {
            "current_role_id": current_role_id,
            "target_role_id": target_role_id
        })
