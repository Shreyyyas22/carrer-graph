from graph.client import client
from graph.queries.developer_queries import GET_DEVELOPER_PROFILE, GET_DEVELOPER_SKILLS
from graph.exceptions import NodeNotFoundError

class DeveloperService:
    @staticmethod
    def get_profile(dev_id: str):
        result = client.execute_read(GET_DEVELOPER_PROFILE, {"dev_id": dev_id})
        if not result:
            raise NodeNotFoundError(f"Developer with id {dev_id} not found.")
        
        record = result[0]
        return {
            "developer": record.get("developer"),
            "role": record.get("role"),
            "location": record.get("location")
        }
        
    @staticmethod
    def get_skills(dev_id: str):
        result = client.execute_read(GET_DEVELOPER_SKILLS, {"dev_id": dev_id})
        return result
